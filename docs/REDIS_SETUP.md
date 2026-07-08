# Redis Setup and Configuration

This document provides detailed instructions for setting up and re-enabling Redis functionality in the Vespera AI Chatbot.

## Current Status

**Redis is currently DISABLED** but all code infrastructure is in place and ready for use.

## What Redis Provides

- **Resumable Streams**: Chat sessions can continue from where they left off if interrupted
- **Session Persistence**: Chat state is maintained across network interruptions
- **Stream Recovery**: Ability to resume streaming responses after connection drops

## Re-enabling Redis

### 1. Environment Variables

Add Redis URL to your environment variables:

```env
# Local Development
REDIS_URL=redis://localhost:6379

# Production (Vercel KV)
REDIS_URL=your_vercel_kv_redis_url
```

### 2. Code Changes

Edit `app/(chat)/api/chat/route.ts`:

#### Step 1: Uncomment Global Stream Context

```typescript
// Change from:
// let globalStreamContext: ResumableStreamContext | null = null;

// To:
let globalStreamContext: ResumableStreamContext | null = null;
```

#### Step 2: Restore getStreamContext Function

```typescript
// Replace the disabled function:
function getStreamContext() {
  // Resumable streams are disabled for now
  console.log(" > Resumable streams are disabled");
  return null;
}

// With the original implementation:
function getStreamContext() {
  if (!globalStreamContext) {
    try {
      globalStreamContext = createResumableStreamContext({
        waitUntil: after,
      });
    } catch (error: any) {
      if (error.message.includes("REDIS_URL")) {
        console.log(
          " > Resumable streams are disabled due to missing REDIS_URL"
        );
      } else {
        console.error(error);
      }
    }
  }
  return globalStreamContext;
}
```

#### Step 3: Update POST Function

```typescript
// Replace the simplified return:
return new Response(stream);

// With the resumable stream logic:
const streamContext = getStreamContext();
if (streamContext) {
  return new Response(
    await streamContext.resumableStream(streamId, () => stream)
  );
} else {
  return new Response(stream);
}
```

#### Step 4: Restore GET Function

```typescript
// Replace the simplified GET function with the full implementation
// (The original GET function handles resumable stream recovery)
```

### 3. Database Setup

The database schema already includes:

- `stream` table for tracking stream IDs
- `createStreamId` and `getStreamIdsByChatId` functions
- All necessary foreign key relationships

No database changes are required.

### 4. Dependencies

All required packages are already installed:

- `redis: ^5.0.0`
- `resumable-stream: ^2.0.0`

## Testing Redis Setup

### 1. Local Development

1. Install Redis locally:

   ```bash
   # macOS
   brew install redis
   brew services start redis

   # Ubuntu/Debian
   sudo apt-get install redis-server
   sudo systemctl start redis-server
   ```

2. Test Redis connection:
   ```bash
   redis-cli ping
   # Should return: PONG
   ```

### 2. Production (Vercel)

1. Create a Vercel KV database in your Vercel dashboard
2. Add the `REDIS_URL` environment variable
3. Deploy your application

### 3. Verification

After enabling Redis:

1. Start a chat conversation
2. Interrupt the network connection during a response
3. Reconnect and verify the chat can resume from where it left off

## Troubleshooting

### Common Issues

1. **"Resumable streams are disabled due to missing REDIS_URL"**

   - Ensure `REDIS_URL` is set in environment variables
   - Check Redis server is running

2. **Connection refused**

   - Verify Redis server is running
   - Check firewall settings
   - Ensure correct Redis URL format

3. **Stream not resuming**
   - Check browser console for errors
   - Verify stream IDs are being created in database
   - Ensure GET endpoint is working correctly

### Debug Commands

```bash
# Check Redis connection
redis-cli ping

# Monitor Redis activity
redis-cli monitor

# Check application logs
pnpm run dev
```

## Performance Considerations

- **Memory Usage**: Redis stores stream state in memory
- **Connection Pooling**: Configure appropriate connection limits
- **TTL Settings**: Consider setting expiration for old stream data
- **Monitoring**: Monitor Redis memory and connection usage

## Security

- **Network Security**: Ensure Redis is not exposed to public internet
- **Authentication**: Use Redis password if available
- **TLS**: Enable TLS for production Redis connections
- **Environment Variables**: Never commit Redis URLs to version control

## Rollback

If you need to disable Redis again:

1. Comment out `REDIS_URL` in environment variables
2. Replace the `getStreamContext()` function with the disabled version
3. Simplify the POST and GET functions as shown in the current implementation

The application will continue to work with regular streaming (non-resumable) functionality.
