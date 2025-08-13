# API Endpoint Update Instructions

## Overview

This document provides instructions for updating all client-side API endpoints to use the Vercel deployment URL instead of localhost.

## Vercel Backend URL

```
https://dormq.vercel.app/api
```

## Files Updated

1. Created a new API configuration file: `client/js/api-config.js`
2. Updated API endpoint in `client/js/register.js`
3. Updated API endpoint in `client/js/login.js`

## Files That Need to Be Updated

The following files may contain API calls that need to be updated:

1. `client/js/community.js`
2. `client/js/home.js`
3. `client/js/my-posts.js`
4. `client/js/services.js`
5. `client/js/comments.js`

## How to Update API Endpoints

For each JavaScript file that makes API calls:

1. Find all instances of:
   - `fetch('/api/...')`
   - `fetch('http://localhost:3006/api/...')`
   - Any other localhost URLs

2. Replace them with:
   - `fetch('https://dormq.vercel.app/api/...')`

## Using the API Configuration File

For a more maintainable approach, you can use the new API configuration file:

1. Import the API utilities at the top of your JavaScript file:

```javascript
import { API_BASE_URL, apiRequest } from './api-config.js';
```

2. Replace direct fetch calls with the apiRequest helper:

```javascript
// Before:
const response = await fetch('http://localhost:3006/api/posts', {
    method: 'GET',
    headers: {
        'Authorization': `Bearer ${token}`
    }
});

// After:
const data = await apiRequest('/posts', { method: 'GET' });
```

## Testing

After updating all API endpoints:

1. Deploy the updated client code to Netlify
2. Test all functionality that involves API calls:
   - User registration
   - User login
   - Viewing posts
   - Creating posts
   - Adding comments
   - Any other features that interact with the backend

## Troubleshooting

If you encounter issues:

1. Check browser console for errors
2. Verify that the Vercel backend is running correctly
3. Ensure CORS is properly configured on the backend
4. Confirm that all API endpoints are correctly updated