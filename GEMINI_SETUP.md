# Google Gemini API Setup Guide

This guide will help you set up and configure the Google Gemini API for the AI-Assisted Text Editor.

## 🔑 Getting Your API Key

### Step 1: Access Google AI Studio

1. Navigate to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. If prompted, accept the terms of service

### Step 2: Create an API Key

1. Click on **"Get API key"** or **"Create API Key"**
2. Select or create a Google Cloud project
3. Click **"Create API key in new project"** or select an existing project
4. Copy the generated API key immediately (you won't be able to see it again)

### Step 3: Configure the Project

1. Open the project root directory
2. Locate the `.env.example` file
3. Copy it to create a new `.env` file:
   ```bash
   cp .env.example .env
   ```
4. Open `.env` in your text editor
5. Replace `your_api_key_here` with your actual API key:
   ```env
   VITE_GEMINI_API_KEY=AIzaSyBtTXiU3zt9mwKItSeXDbtY4lovM20h0sY
   ```

### Step 4: Restart Development Server

If the dev server is running, restart it to load the new environment variables:
```bash
# Stop the server (Ctrl+C)
# Start it again
npm run dev
```

## ✅ Verify Configuration

When the app starts, check the browser console:
- ✅ **Success**: `"✅ Gemini AI initialized successfully"`
- ⚠️ **Warning**: `"⚠️ Gemini API key not configured..."`

You can also test the configuration by:
1. Opening the application
2. Typing some text in the editor
3. Clicking "Continue Writing" or pressing `Ctrl+Enter`
4. If configured correctly, you'll see AI-generated text appear

## 🔒 Security Best Practices

### Never Commit API Keys

The `.env` file is automatically git-ignored. **Never** commit your API key to version control.

### API Key Restrictions (Recommended)

For production deployments, restrict your API key:

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Navigate to **APIs & Services > Credentials**
3. Find your API key and click **Edit**
4. Set restrictions:
   - **Application restrictions**: HTTP referrers (for web apps)
   - **API restrictions**: Restrict to "Generative Language API"
   - **Website restrictions**: Add your domain (e.g., `yourdomain.com/*`)

### Environment-Specific Keys

Use different API keys for different environments:

```env
# Development
VITE_GEMINI_API_KEY=dev_key_here

# Production
VITE_GEMINI_API_KEY=prod_key_here
```

## 📊 Monitoring Usage

### Check API Usage

1. Visit [Google Cloud Console](https://console.cloud.google.com)
2. Navigate to **APIs & Services > Dashboard**
3. Select "Generative Language API"
4. View usage statistics and quotas

### Free Tier Limits

Google Gemini API offers a generous free tier:
- **Free quota**: 60 requests per minute (RPM)
- **Rate limit**: Built-in 500ms minimum between requests in this app
- **Token limits**: 500 tokens per generation (configured in the app)

### Upgrade Options

If you exceed free tier limits:
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Enable billing for your project
3. Upgrade to paid tier for higher quotas

## 🛠️ Troubleshooting

### Error: "API key not configured"

**Solution**: Ensure `.env` file exists with valid API key
```bash
# Check if .env exists
ls -la .env

# Verify content (do not share this output!)
cat .env
```

### Error: "Invalid API key"

**Causes**:
- Typo in the API key
- API key was deleted or regenerated
- API key restrictions blocking requests

**Solution**:
1. Verify the key in [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Generate a new key if necessary
3. Update `.env` with the new key
4. Restart the dev server

### Error: "Quota exceeded"

**Causes**:
- Exceeded free tier limits (60 RPM)
- Too many requests in short time

**Solution**:
1. Wait a few minutes for the quota to reset
2. Enable billing for higher quotas
3. Check usage in [Google Cloud Console](https://console.cloud.google.com)

### Error: "Network error"

**Causes**:
- No internet connection
- Firewall blocking Google APIs
- VPN/proxy issues

**Solution**:
1. Check internet connection
2. Try disabling VPN/proxy temporarily
3. Check firewall settings
4. Verify Google APIs are accessible from your network

## 🔧 Advanced Configuration

### Custom Generation Parameters

You can modify AI generation behavior in `src/services/aiService.ts`:

```typescript
private readonly defaultConfig: GeminiConfig = {
  temperature: 0.7,        // 0.0-2.0: Lower = more deterministic
  topK: 40,                // 1-40: Vocabulary diversity
  topP: 0.95,              // 0.0-1.0: Nucleus sampling threshold
  maxOutputTokens: 500,    // Max length of generated text
  candidateCount: 1,       // Number of variations to generate
};
```

### Safety Settings

Modify content filtering in `src/services/aiService.ts`:

```typescript
private readonly safetySettings = [
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  // ... more settings
];
```

Available thresholds:
- `BLOCK_NONE`: No filtering
- `BLOCK_LOW_AND_ABOVE`: Block low, medium, and high
- `BLOCK_MEDIUM_AND_ABOVE`: Block medium and high (default)
- `BLOCK_ONLY_HIGH`: Block only high severity

### Rate Limiting

Adjust rate limiting in `src/services/aiService.ts`:

```typescript
private readonly MIN_REQUEST_INTERVAL_MS = 500; // Minimum ms between requests
```

### Retry Configuration

Modify retry behavior in `src/services/aiService.ts`:

```typescript
private readonly MAX_RETRIES = 3;                  // Number of retry attempts
private readonly RETRY_DELAY_MS = 1000;            // Initial retry delay
private readonly RETRY_BACKOFF_MULTIPLIER = 2;     // Exponential backoff multiplier
```

## 📚 Additional Resources

- [Gemini API Documentation](https://ai.google.dev/docs)
- [Google AI Studio](https://makersuite.google.com)
- [Google Cloud Console](https://console.cloud.google.com)
- [Pricing Information](https://ai.google.dev/pricing)
- [API Quotas & Limits](https://ai.google.dev/docs/quota)

## 💡 Tips

1. **Start with free tier**: Test thoroughly before enabling billing
2. **Monitor usage**: Check Cloud Console regularly
3. **Set budget alerts**: Prevent unexpected charges
4. **Use development keys**: Different keys for dev/prod environments
5. **Implement caching**: Cache common requests to reduce API calls (not implemented in this demo)

## 🆘 Need Help?

If you encounter issues not covered here:

1. Check the [GitHub Issues](https://github.com/google/generative-ai-js/issues) for the SDK
2. Review [API Status](https://status.cloud.google.com/) for service outages
3. Check browser console for detailed error messages
4. Verify network requests in browser DevTools (Network tab)

---

**Security Reminder**: Never share your API key publicly or commit it to version control. The `.env` file should always be in `.gitignore`.
