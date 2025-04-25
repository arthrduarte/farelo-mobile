# Farelo Server API Documentation

## Overview
Farelo's server is built using Express.js and provides a RESTful API for recipe management, chat functionality, and payment processing. The server is designed to be scalable and maintainable, with clear separation of concerns and modular architecture.

## Base URL
```
https://usefarelo.com/api
```

## Authentication
Authentication details should be provided in the request headers. (Implementation details to be added)

## API Endpoints

### Health Check
```
GET /health
```
Returns the server status. Useful for monitoring and health checks.

**Response**
```json
{
    "status": "ok",
    "message": "Server is running"
}
```

### Recipe Management

#### Import Recipe
```
POST /recipes/import
```
Imports a recipe from structured data.

**Request Body**
- Content-Type: application/json
- Body: Recipe data structure (schema to be documented)

#### Import Recipe from Images
```
POST /recipes/import/images
```
Extracts recipe information from uploaded images.

**Request Body**
- Content-Type: multipart/form-data
- Field name: `images`
- Supports up to 3 images (jpg, png, webp)
- Maximum file size: 30MB per image

**File Upload Constraints**
- Accepted formats: JPG, PNG, WebP
- Maximum files: 3
- Maximum size per file: 30MB

#### Remix Recipe
```
POST /recipes/remix
```
Creates a variation of an existing recipe.

**Request Body**
- Content-Type: application/json
- Body: Original recipe data with modification parameters

### Chat

#### Send Chat Message
```
POST /chat
```
Handles chat interactions, possibly for recipe assistance or general inquiries.

**Request Body**
- Content-Type: application/json
- Body: Chat message data structure

### Payment Processing

#### Stripe Webhook
```
POST /stripe
```
Handles Stripe webhook events for payment processing.

**Request Body**
- Content-Type: application/json
- Raw body required for Stripe signature verification

## Error Handling

The API uses standard HTTP status codes:
- 200: Success
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 500: Internal Server Error

Each error response includes:
```json
{
    "error": {
        "message": "Description of the error",
        "code": "ERROR_CODE"
    }
}
```

## Server Architecture

### Directory Structure
```
/server
├── index.ts           # Main server entry point
├── src/
│   ├── routes/       # Route definitions
│   ├── controllers/  # Business logic
│   └── models/       # Data models
├── dist/             # Compiled JavaScript
└── dist-client/      # Static frontend files
```

### Key Components

1. **Express Server**
   - CORS enabled
   - JSON body parsing
   - Static file serving
   - Request logging

2. **Route Modules**
   - recipe.routes.ts: Recipe management endpoints
   - chat.routes.ts: Chat functionality
   - stripe.routes.ts: Payment processing

3. **Static File Serving**
   - Serves the frontend application
   - Fallback to index.html for client-side routing

## Development Guidelines

1. All new endpoints should follow the established pattern:
   - Route definition in appropriate routes file
   - Controller logic in separate controller file
   - Model definitions when needed

2. Error handling should be consistent across all endpoints

3. File uploads should use the established multer configuration

4. All endpoints should include appropriate logging

## Mobile Integration Notes

For mobile applications integrating with this API:

1. **Base URL Configuration**
   - Use environment-based configuration for base URL
   - Include health check endpoint in startup sequence

2. **File Upload Considerations**
   - Respect file size limits (30MB per image)
   - Implement client-side image format validation
   - Handle multiple file selection (max 3 images)

3. **Error Handling**
   - Implement retry logic for network failures
   - Parse error responses for user-friendly messages
   - Handle timeout scenarios gracefully

4. **Authentication**
   - Implement secure token storage
   - Handle token refresh flows
   - Manage session expiration

5. **Offline Capabilities**
   - Consider implementing request queuing
   - Cache responses when appropriate
   - Sync strategies for offline-first features 