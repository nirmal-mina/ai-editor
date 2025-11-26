import { createMachine, assign } from 'xstate';

/**
 * Editor context maintains the complete state of the document editing session.
 * Intentionally minimal to avoid bloat while supporting all required functionality.
 */
export interface EditorContext {
  content: string;
  error: string | null;
  isGenerating: boolean;
  generationProgress: number;
  lastGeneratedAt: number | null;
  wordCount: number;
}

/**
 * Discriminated union of all possible events the editor machine can handle.
 * Using string literals ensures type safety and prevents typos at compile time.
 */
export type EditorEvent =
  | { type: 'CONTINUE_WRITING' }
  | { type: 'GENERATION_SUCCESS'; content: string; timestamp: number }
  | { type: 'GENERATION_ERROR'; error: string }
  | { type: 'UPDATE_CONTENT'; content: string }
  | { type: 'CLEAR_ERROR' }
  | { type: 'RESET' }
  | { type: 'CANCEL_GENERATION' };

/**
 * Minimum word threshold to enable AI continuation.
 * Too low and we don't have enough context; too high and it's restrictive.
 * 3 words strikes a balance between usability and quality.
 */
const MIN_WORDS_FOR_GENERATION = 3;

/**
 * Editor state machine implementing a predictable state flow.
 * Prevents impossible states like "generating while in error" through
 * explicit state transitions. Each state has clear entry/exit actions.
 */
export const editorMachine = createMachine({
  id: 'editor',
  initial: 'idle',
  types: {} as {
    context: EditorContext;
    events: EditorEvent;
  },
  context: {
    content: '',
    error: null,
    isGenerating: false,
    generationProgress: 0,
    lastGeneratedAt: null,
    wordCount: 0,
  },
  states: {
    idle: {
      on: {
        CONTINUE_WRITING: {
          target: 'generating',
          guard: ({ context }) => {
            const wordCount = context.content.trim().split(/\s+/).filter(w => w.length > 0).length;
            return wordCount >= MIN_WORDS_FOR_GENERATION;
          },
        },
        UPDATE_CONTENT: {
          actions: assign({
            content: ({ event }) => event.content,
            error: null,
            wordCount: ({ event }) => {
              return event.content.trim().split(/\s+/).filter(w => w.length > 0).length;
            },
          }),
        },
        RESET: {
          actions: assign({
            content: '',
            error: null,
            isGenerating: false,
            generationProgress: 0,
            lastGeneratedAt: null,
            wordCount: 0,
          }),
        },
      },
    },
    generating: {
      entry: assign({
        isGenerating: true,
        error: null,
        generationProgress: 0,
      }),
      on: {
        GENERATION_SUCCESS: {
          target: 'idle',
          actions: assign({
            content: ({ event }) => event.content,
            isGenerating: false,
            generationProgress: 100,
            lastGeneratedAt: ({ event }) => event.timestamp,
            wordCount: ({ event }) => {
              return event.content.trim().split(/\s+/).filter(w => w.length > 0).length;
            },
          }),
        },
        GENERATION_ERROR: {
          target: 'error',
          actions: assign({
            error: ({ event }) => event.error,
            isGenerating: false,
            generationProgress: 0,
          }),
        },
        CANCEL_GENERATION: {
          target: 'idle',
          actions: assign({
            isGenerating: false,
            generationProgress: 0,
          }),
        },
      },
    },
    error: {
      entry: assign({
        isGenerating: false,
        generationProgress: 0,
      }),
      on: {
        CLEAR_ERROR: {
          target: 'idle',
          actions: assign({
            error: null,
          }),
        },
        CONTINUE_WRITING: {
          target: 'generating',
          guard: ({ context }) => {
            const wordCount = context.content.trim().split(/\s+/).filter(w => w.length > 0).length;
            return wordCount >= MIN_WORDS_FOR_GENERATION;
          },
          actions: assign({
            error: null,
          }),
        },
        UPDATE_CONTENT: {
          target: 'idle',
          actions: assign({
            content: ({ event }) => event.content,
            error: null,
            wordCount: ({ event }) => {
              return event.content.trim().split(/\s+/).filter(w => w.length > 0).length;
            },
          }),
        },
      },
    },
  },
});
