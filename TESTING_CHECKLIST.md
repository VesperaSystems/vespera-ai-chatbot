# Testing Checklist for Legal Analysis Application

## Pre-Testing Setup

### ✅ Environment Variables

Create a `.env.local` file in the root directory with:

```env
# Database (required)
POSTGRES_URL="postgresql://username:password@localhost:5432/database_name"

# Authentication (required)
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"

# OpenAI (required for AI analysis)
OPENAI_API_KEY="your-openai-api-key-here"

# Vercel Blob (required for file uploads)
BLOB_READ_WRITE_TOKEN="your-vercel-blob-token-here"

# Environment
NODE_ENV="development"
```

### ✅ Database Setup

1. Ensure PostgreSQL is running
2. Run database migrations: `pnpm run db:migrate`
3. Verify database connection

### ✅ Dependencies

1. Install dependencies: `pnpm install`
2. Verify all packages are installed correctly

## API Endpoint Testing

### ✅ File Upload API (`/api/files/upload`)

- [ ] Accepts DOCX files
- [ ] Rejects unsupported file types
- [ ] Handles file size limits (25MB)
- [ ] Returns proper error messages
- [ ] Requires authentication

### ✅ Chat API (`/api/chat`)

- [ ] Accepts proper request format
- [ ] Handles document attachments
- [ ] Returns streaming response
- [ ] Requires authentication

### ✅ Document Edit API (`/api/document/edit`)

- [ ] Accepts issue data
- [ ] Creates edited documents
- [ ] Returns download URLs
- [ ] Requires authentication

### ✅ Download API (`/api/download/edited-document`)

- [ ] Serves edited documents
- [ ] Handles file cleanup
- [ ] Requires authentication

## Frontend Testing

### ✅ File Upload Interface

- [ ] File input accepts .docx files
- [ ] Upload progress indicator works
- [ ] Error messages display correctly
- [ ] Success messages display correctly

### ✅ Analysis Interface

- [ ] Analysis button triggers API call
- [ ] Loading states display correctly
- [ ] Analysis results display properly
- [ ] Error handling works

### ✅ Issue Management

- [ ] Issues display with correct formatting
- [ ] Issue types are color-coded
- [ ] Edit functionality works
- [ ] Apply changes button works

### ✅ Document Download

- [ ] Download button appears after changes
- [ ] Download triggers file download
- [ ] File name is correct
- [ ] File opens in Word/Office

## Browser Compatibility Testing

### ✅ Firefox

- [ ] File upload works
- [ ] Analysis functionality works
- [ ] Download functionality works
- [ ] UI displays correctly
- [ ] No console errors

### ✅ Chrome

- [ ] File upload works
- [ ] Analysis functionality works
- [ ] Download functionality works
- [ ] UI displays correctly
- [ ] No console errors

### ✅ Edge

- [ ] File upload works
- [ ] Analysis functionality works
- [ ] Download functionality works
- [ ] UI displays correctly
- [ ] No console errors

## Error Handling Testing

### ✅ Network Errors

- [ ] API timeouts handled gracefully
- [ ] Network disconnection handled
- [ ] Retry mechanisms work

### ✅ File Errors

- [ ] Invalid file types rejected
- [ ] File size limits enforced
- [ ] Corrupted files handled

### ✅ Authentication Errors

- [ ] Unauthorized access blocked
- [ ] Session expiration handled
- [ ] Login redirects work

## Performance Testing

### ✅ File Upload Performance

- [ ] Large files upload successfully
- [ ] Progress indicators accurate
- [ ] No memory leaks

### ✅ Analysis Performance

- [ ] Analysis completes in reasonable time
- [ ] UI remains responsive
- [ ] No blocking operations

### ✅ Download Performance

- [ ] Files download quickly
- [ ] No browser freezing
- [ ] Memory usage reasonable

## Security Testing

### ✅ File Upload Security

- [ ] File type validation works
- [ ] Malicious files rejected
- [ ] File size limits enforced

### ✅ Authentication Security

- [ ] Protected routes require auth
- [ ] Session management works
- [ ] No unauthorized access

### ✅ Data Security

- [ ] Sensitive data not exposed
- [ ] API keys not leaked
- [ ] Proper CORS headers

## Cross-Browser Specific Issues

### Firefox Specific

- [ ] FormData handling works
- [ ] File API compatibility
- [ ] CSS Grid/Flexbox support

### Chrome Specific

- [ ] Blob URL handling
- [ ] Download API support
- [ ] Modern CSS features

### Edge Specific

- [ ] Legacy API support
- [ ] CSS compatibility
- [ ] JavaScript compatibility

## Testing Commands

```bash
# Start development server
pnpm run dev

# Run linting
pnpm run lint

# Run build test
pnpm run build

# Run database migrations
pnpm run db:migrate

# Test API endpoints
node test-api.js
```

## Common Issues and Solutions

### Issue: 400 Error on API Calls

**Solution**: Check request format matches schema requirements

### Issue: 401 Unauthorized

**Solution**: Ensure user is authenticated and session is valid

### Issue: File Upload Fails

**Solution**: Check Vercel Blob configuration and environment variables

### Issue: Analysis Doesn't Work

**Solution**: Verify OpenAI API key and rate limits

### Issue: Download Doesn't Work

**Solution**: Check file permissions and temporary file handling

## Browser-Specific Testing Notes

### Firefox

- More strict with CORS
- Different file handling behavior
- May require explicit content-type headers

### Chrome

- Most permissive with APIs
- Best support for modern features
- Good debugging tools

### Edge

- May have issues with older APIs
- Different CSS rendering
- May require polyfills

## Final Verification

Before declaring the application ready:

1. ✅ All API endpoints return correct status codes
2. ✅ File upload works in all browsers
3. ✅ Analysis functionality works end-to-end
4. ✅ Download functionality works in all browsers
5. ✅ Error handling is graceful
6. ✅ UI is responsive and accessible
7. ✅ No console errors in any browser
8. ✅ Performance is acceptable
9. ✅ Security measures are in place
10. ✅ Documentation is complete

## Deployment Checklist

Before deploying to production:

1. ✅ Environment variables configured
2. ✅ Database migrations run
3. ✅ Build completes successfully
4. ✅ All tests pass
5. ✅ Security review completed
6. ✅ Performance testing done
7. ✅ Browser compatibility verified
8. ✅ Error monitoring configured
9. ✅ Backup procedures in place
10. ✅ Documentation updated
