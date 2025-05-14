# Environment Configuration Setup

This document describes how to set up environment variables for the e-commerce application.

## Environment Files

The application uses a configuration system based on Vite's environment variables (prefixed with `VITE_`).

### Creating the .env File

1. Create a file named `.env` in the root directory of the project
2. Add the following variables to the file:

```
VITE_API_BASE_URL=http://localhost:8000/api
```

This URL should point to your backend API. Adjust it based on your environment:

- Development: `http://localhost:8000/api`
- Production: `https://your-production-domain.com/api`

## How Configuration Works

The application uses a centralized configuration system:

1. Environment variables are loaded from the `.env` file by Vite during build and development
2. These variables are accessed in the application via `import.meta.env.VITE_API_BASE_URL`
3. The `src/config.ts` file acts as a central point for accessing these variables, providing fallbacks if they're not defined

## Changing API Base URL

When deploying to different environments, update the `.env` file with the appropriate API base URL. The application will use this URL for all API requests.

## Storage/Images URL

The application assumes that the storage path for images is at `/storage` relative to the base URL, but with the `/api` part removed. For example:

- If API URL is `http://localhost:8000/api`
- Then storage URL is `http://localhost:8000/storage`

This is handled automatically in the code by replacing '/api' in the base URL. 