import { useEffect, useRef, useState, useCallback } from 'react';
import { EditorState, Transaction, Plugin, TextSelection } from 'prosemirror-state';
import { EditorView, DecorationSet } from 'prosemirror-view';
import { Schema, DOMParser } from 'prosemirror-model';
import { schema } from 'prosemirror-schema-basic';
import { addListNodes } from 'prosemirror-schema-list';
import { keymap } from 'prosemirror-keymap';
import { history, undo, redo } from 'prosemirror-history';
import { baseKeymap } from 'prosemirror-commands';
import './EditorComponent.css';

/**
 * Extended ProseMirror schema with list support.
 * 
 * Schema design decisions:
 * - Starts with prosemirror-schema-basic (paragraph, heading, blockquote, etc.)
 * - Adds list nodes (bullet_list, ordered_list, list_item) via addListNodes
 * - List insertion pattern: 'paragraph block*' means lists can contain paragraphs and other blocks
 * - Group 'block' allows lists to be used wherever block content is expected
 * 
 * Why extend the schema:
 * The basic schema lacks list support, which users expect in any text editor.
 * Extending schemas is preferred over mixing multiple schemas.
 */
let mySchema: Schema;
try {
  mySchema = new Schema({
    nodes: addListNodes(schema.spec.nodes, 'paragraph block*', 'block'),
    marks: schema.spec.marks,
  });
} catch (error) {
  console.error('Failed to initialize editor schema:', error);
  // Fallback to basic schema if list extension fails
  mySchema = schema;
}

/**
 * Custom ProseMirror plugin for cursor tracking.
 * 
 * Plugin architecture:
 * - State lifecycle: init() → apply() for each transaction → decorations()
 * - Decorations are visual elements that don't affect document structure
 * - Must be remapped on each transaction to account for position changes
 * 
 * Current implementation:
 * Returns empty decoration set (no visual decorations yet).
 * Infrastructure is in place for future features like:
 * - Cursor position indicators
 * - Collaborative editing cursors
 * - Syntax highlighting
 * - Real-time validation markers
 */
function cursorPlugin() {
  return new Plugin({
    state: {
      init() { return DecorationSet.empty; },
      apply(tr, set) {
        // Remap decorations to account for document changes
        set = set.map(tr.mapping, tr.doc);
        return set;
      }
    },
    props: {
      decorations(state) {
        return this.getState(state);
      }
    }
  });
}

interface EditorComponentProps {
  content: string;
  onContentChange: (content: string) => void;
  isGenerating: boolean;
  placeholder?: string;
  userInputLength?: number; // Track where user input ends
}

/**
 * React wrapper for ProseMirror editor with visual input/output separation.
 */
export function EditorComponent({
  content,
  onContentChange,
  isGenerating,
  placeholder = 'Start writing something amazing...',
  userInputLength = 0,
}: EditorComponentProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const [isFocused, setIsFocused] = useState(false);
  
  // Track content to prevent sync loops
  const contentRef = useRef(content);

  /**
   * Handles content changes from ProseMirror.
   * 
   * Wrapped in useCallback to maintain stable reference, preventing
   * EditorView recreation in useEffect dependency array.
   * 
   * Comparison check prevents echoing: when App.tsx sets content via prop,
   * we update ProseMirror, which would normally trigger this callback,
   * which would call onContentChange, creating a loop. contentRef breaks this.
   */
  const handleContentChangeDebounced = useCallback((text: string) => {
    if (contentRef.current !== text) {
      contentRef.current = text;
      onContentChange(text);
    }
  }, [onContentChange]);

  /**
   * ProseMirror initialization
   */
  useEffect(() => {
    if (!editorRef.current) return;

    const editorElement = editorRef.current;

    const doc = DOMParser.fromSchema(mySchema).parse(
      document.createElement('div')
    );

    const state = EditorState.create({
      doc,
      plugins: [
        history(),
        keymap({
          'Mod-z': undo,
          'Mod-y': redo,
          'Mod-Shift-z': redo,
        }),
        keymap(baseKeymap),
        cursorPlugin(),
      ],
    });

    const view = new EditorView(editorElement, {
      state,
      dispatchTransaction(transaction: Transaction) {
        const newState = view.state.apply(transaction);
        view.updateState(newState);

        if (transaction.docChanged) {
          const text = newState.doc.textContent;
          handleContentChangeDebounced(text);
        }
      },
      attributes: {
        class: 'prosemirror-editor',
        spellcheck: 'true',
        'data-gramm': 'false',
        autocorrect: 'on',
        autocapitalize: 'on',
      },
      editable: () => !isGenerating,
    });

    viewRef.current = view;

    const handleFocus = () => setIsFocused(true);
    const handleBlur = () => setIsFocused(false);

    editorElement.addEventListener('focus', handleFocus, { capture: true, passive: true });
    editorElement.addEventListener('blur', handleBlur, { capture: true, passive: true });

    return () => {
      editorElement.removeEventListener('focus', handleFocus, true);
      editorElement.removeEventListener('blur', handleBlur, true);
      view.destroy();
    };
  }, [isGenerating, handleContentChangeDebounced]);

  /**
   * Bidirectional content sync: React state → ProseMirror
   */
  useEffect(() => {
    if (!viewRef.current) return;

    const currentText = viewRef.current.state.doc.textContent;
    if (currentText !== content && content !== contentRef.current) {
      const { state } = viewRef.current;
      const tr = state.tr.replaceWith(
        0,
        state.doc.content.size,
        mySchema.text(content)
      );
      
      try {
        const newDoc = tr.doc;
        const newSelection = TextSelection.create(newDoc, newDoc.content.size);
        tr.setSelection(newSelection);
      } catch (e) {
        console.warn('Failed to set selection', e);
      }
      
      viewRef.current.dispatch(tr);
      contentRef.current = content;
    }
  }, [content]);

  // Update editable state
  useEffect(() => {
    if (viewRef.current) {
      viewRef.current.update({
        ...viewRef.current.props,
        editable: () => !isGenerating,
      });
      
      if (!isGenerating && isFocused && viewRef.current.dom) {
        viewRef.current.focus();
      }
    }
  }, [isGenerating, isFocused]);

  return (
    <div className={`editor-wrapper ${isFocused ? 'focused' : ''} ${isGenerating ? 'generating' : ''}`}>
      <div 
        ref={editorRef} 
        className="editor-container"
        data-placeholder={content.length === 0 ? placeholder : ''}
        data-user-length={userInputLength}
      />
      {isGenerating && (
        <div className="generation-indicator">
          <div className="generation-spinner"></div>
          <span>AI is writing...</span>
        </div>
      )}
    </div>
  );
}
