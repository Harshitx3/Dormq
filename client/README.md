# DormQ Client Deployment Guide

## Netlify Deployment Instructions

### Setup

1. The project has been configured with the necessary Netlify configuration files:
   - `_redirects` - Handles API proxying
   - `netlify.toml` - Contains build and redirect settings

### Deployment Steps

1. Log in to your Netlify account
2. Click "Add new site" > "Import an existing project"
3. Connect to your Git provider and select the repository
4. Configure the deployment with these settings:
   - Base directory: `client`
   - Publish directory: `./` (as specified in netlify.toml)
   - Build command: (leave empty - this is a static site)

### Troubleshooting

#### API Connection Issues

If you encounter API connection errors (500 errors):

1. Verify that the Vercel backend is running correctly
2. Check that the redirects are properly configured
3. Ensure CORS is properly set up on the backend

#### Local Development

For local development, you may need to update the API paths in `api-config.js` to point to your local server:

```javascript
// For local development
const API_BASE_URL = 'http://localhost:3006/api';

// For production
// const API_BASE_URL = '/api';
```

Remember to change it back to the relative path before deploying to Netlify.