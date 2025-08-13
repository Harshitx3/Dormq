# Fixing Netlify Deployment Issues

## Common Error: 500 Server Error on API Calls

If you're seeing a 500 error when making API calls from your Netlify-deployed frontend to your Vercel backend, follow these steps to resolve the issue:

### 1. Check Your API Configuration

The API calls have been updated to use relative paths (`/api/...`) instead of absolute URLs. This works with the Netlify redirects configuration.

### 2. Verify Netlify Configuration Files

Ensure these files are present in your repository:

- `_redirects` - Contains the redirect rules for API calls
- `netlify.toml` - Contains build settings and additional redirect configurations

### 3. Deploy with the Correct Settings

1. In Netlify dashboard, go to your site settings
2. Under "Build & deploy" > "Continuous Deployment":
   - Base directory: `client`
   - Publish directory: `./`
   - No build command needed (static site)

### 4. Check CORS Configuration on Backend

Ensure your Vercel backend has proper CORS configuration to accept requests from your Netlify domain:

```javascript
app.use(cors({
    origin: ['https://your-netlify-app.netlify.app', 'http://localhost:3000'],
    credentials: true
}));
```

### 5. Clear Browser Cache

After making changes, clear your browser cache or use incognito mode to test the deployment.

### 6. Check Netlify Deployment Logs

If issues persist, check the Netlify deployment logs for any errors or warnings.

### 7. Test API Endpoints Directly

Test the Vercel API endpoints directly (using tools like Postman) to ensure they're working correctly.

### 8. Verify Environment Variables

Ensure any required environment variables are properly set in your Netlify deployment settings.