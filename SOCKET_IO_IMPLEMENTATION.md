# Socket.IO Implementation for Gmail Email Processing

## Overview
This implementation uses Socket.IO to provide real-time updates during Gmail email processing, preventing Vercel serverless function timeouts.

## Architecture

### Backend (script.js)
- Creates HTTP server with Express
- Initializes Socket.IO server with CORS configuration
- Makes `io` instance available to routes via `app.set('io', io)`

### Gmail Processing (gmailCrud.js)
The `fetchEmails` function now:
1. Accepts `socketId` as query parameter
2. Sends immediate response to avoid timeout
3. Processes emails asynchronously
4. Emits Socket.IO events for progress updates

### Socket Events

#### Server → Client Events:

**`gmail:status`**
```javascript
{
  message: string,
  step: number,
  total: number
}
```
Updates during different phases of processing.

**`gmail:progress`**
```javascript
{
  current: number,
  total: number,
  message: string
}
```
Real-time progress as each email is processed.

**`gmail:complete`**
```javascript
{
  total: number,
  documents: ProcessedEmail[]
}
```
Sent when processing is complete with results.

**`gmail:error`**
```javascript
{
  error: string
}
```
Sent if an error occurs during processing.

### Frontend Implementation

#### useSocket Hook (hooks/useSocket.ts)
Manages Socket.IO connection:
- Auto-connects on mount
- Returns `socket`, `isConnected`, and `socketId`
- Handles reconnection automatically

#### GmailStatus Component
1. Establishes socket connection via `useSocket()`
2. Passes `socketId` to API call
3. Listens for socket events
4. Updates UI in real-time with:
   - Status messages
   - Progress bar
   - Final results

## Environment Variables

### Backend (.env)
```env
FRONTEND_URL=http://localhost:5173
PORT=8080
```

### Frontend (.env)
```env
VITE_BASE_URL=http://localhost:8080
```

## Flow Diagram

```
User → GmailStatus Component
         ↓
      Socket.IO Connection
         ↓
      API Call with socketId
         ↓
      Backend (immediate response)
         ↓
      Async Processing Starts
         ↓
      Emits: gmail:status
      Emits: gmail:progress (multiple times)
      Emits: gmail:complete
         ↓
      Frontend updates UI in real-time
```

## Benefits

1. **No Timeouts**: Backend responds immediately, processes asynchronously
2. **Real-time Updates**: User sees progress as it happens
3. **Better UX**: Progress bar shows exactly how many emails processed
4. **Error Handling**: Errors communicated immediately via socket
5. **Scalable**: Can handle long-running operations

## Testing

1. Start backend: `cd backend && npm start`
2. Start frontend: `cd Front-end && npm run dev`
3. Navigate to Gmail import
4. Watch real-time progress updates

## Production Deployment

- Socket.IO works seamlessly with Vercel
- Ensure CORS is properly configured with production URLs
- Use `transports: ['websocket', 'polling']` for fallback
