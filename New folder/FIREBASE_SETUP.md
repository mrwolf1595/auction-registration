# Firebase Storage Setup Instructions

## Required Environment Variables

Create a `.env.local` file in the project root with the following variables:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

## Firebase Console Setup

1. **Create Firebase Project**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Click "Create a project" or select existing project
   - Follow the setup wizard

2. **Add Web App**
   - Go to Project Settings > General > Your apps
   - Click "Add app" and select Web (</>) icon
   - Register your app with a nickname
   - Copy the configuration values to your `.env.local` file

3. **Enable Firebase Storage**
   - Go to Storage in the left sidebar
   - Click "Get started"
   - Choose "Start in test mode" for development
   - Select a location for your storage bucket

4. **Configure Storage Rules**
   - Go to Storage > Rules tab
   - Update rules for your use case:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Allow read/write access to auction documents
    match /مزادات/{allPaths=**} {
      allow read, write: if true; // Adjust based on your security needs
    }
  }
}
```

## Storage Path Structure

Files will be uploaded to the following path structure:
```
/مزادات/{bidder_name}/{YYYY-MM-DD_HH-mm}/
├── ايصال_استلام.pdf
└── اقرار_المزايد.pdf
```

## Testing the Upload

1. Fill out the registration form
2. Click "معاينة" to open preview modal
3. Click "رفع إلى Firebase" to upload files
4. Monitor upload progress in the modal
5. Download files using the provided URLs

## Security Considerations

- **Environment Variables**: Never commit `.env.local` to version control
- **Storage Rules**: Configure appropriate access rules for production
- **Authentication**: Consider adding user authentication for production use
- **File Validation**: Implement file type and size validation
- **Rate Limiting**: Consider implementing upload rate limiting

## Troubleshooting

### Common Issues

1. **"Firebase App not initialized"**
   - Check that all environment variables are set correctly
   - Verify Firebase project configuration

2. **"Permission denied"**
   - Check Firebase Storage rules
   - Ensure Storage is enabled in Firebase Console

3. **"Network error"**
   - Check internet connection
   - Verify Firebase project is active

4. **"File too large"**
   - Check Firebase Storage quotas
   - Implement file size validation

### Debug Mode

Enable debug logging by adding to your `.env.local`:
```env
NEXT_PUBLIC_FIREBASE_DEBUG=true
```
