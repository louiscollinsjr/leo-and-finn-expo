# Supabase Authentication Setup

This guide will help you set up Supabase authentication with your Leo & Finn Expo app.

## Environment Variables

Create a `.env` file in the root of your project with the following variables:

```env
EXPO_PUBLIC_SUPABASE_URL=your_supabase_project_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### How to Get Supabase Credentials

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Create a new project or select an existing one
3. Navigate to **Project Settings** > **API**
4. Copy the **Project URL** and **anon public key**

## Supabase Project Configuration

### 1. Enable Authentication Providers

In your Supabase project dashboard:

1. Go to **Authentication** > **Providers**
2. Enable the providers you want to use:

#### Email OTP (Magic Link)
- Enable **Email** provider
- Configure email templates in **Authentication** > **Email Templates**
- Set up a custom SMTP server or use Supabase's default email service

#### Apple OAuth
- Enable **Apple** provider
- You'll need to configure Apple Sign In:
  - Create an App ID in Apple Developer Portal
  - Enable "Sign in with Apple" capability
  - Add your return URL: `https://your-project-id.supabase.co/auth/v1/callback`

#### Google OAuth
- Enable **Google** provider
- You'll need to configure Google OAuth:
  - Create a project in [Google Cloud Console](https://console.cloud.google.com/)
  - Enable Google+ API
  - Create OAuth 2.0 credentials
  - Add authorized redirect URI: `https://your-project-id.supabase.co/auth/v1/callback`

### 2. Configure Redirect URLs

For Expo deep linking to work properly, you need to configure redirect URLs:

#### For Expo Go (Development)
```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

#### For Standalone Builds (Production)
1. Update your `app.json` scheme to match your app's identifier
2. Configure the redirect URI in Supabase:
   - Go to **Authentication** > **URL Configuration**
   - Add your redirect URLs:
     - Development: `exp://localhost:19000/--/auth/callback`
     - Production: `yourscheme://auth/callback`

## URL Configuration

### Update your `app.json`

```json
{
  "expo": {
    "scheme": "leoandfinn",
    "extra": {
      "eas": {
        "projectId": "your-project-id"
      }
    }
  }
}
```

### Deep Link Setup

The app is already configured to handle deep links. The redirect URI is automatically generated using:

```typescript
export const redirectTo = makeRedirectUri({ path: 'auth/callback' });
```

This will work for:
- Expo Go: `exp://localhost:19000/--/auth/callback`
- Standalone iOS: `leoandfinn://auth/callback`
- Standalone Android: `leoandfinn://auth/callback`

## Testing the Setup

### 1. Email OTP (Magic Link)
- Start your app: `npm start`
- Navigate to the login screen
- Enter your email and click "Continue"
- Check your email for the magic link
- Click the link to complete authentication

### 2. OAuth Providers
- Make sure OAuth providers are configured in Supabase
- Test Apple/Google sign in flows
- Ensure the browser redirects back to your app

### 3. Session Persistence
- Sign in with any method
- Close and reopen the app
- You should remain signed in
- Test sign out functionality

## Troubleshooting

### Common Issues

1. **"Missing Supabase env vars" error**
   - Make sure your `.env` file exists in the project root
   - Restart your development server after adding environment variables

2. **OAuth callback not working**
   - Verify redirect URLs are configured in Supabase
   - Check your app scheme in `app.json`
   - Ensure deep linking is properly set up

3. **Email not received**
   - Check Supabase email logs in **Authentication** > **Logs**
   - Verify email provider configuration
   - Check spam/junk folders

4. **Session not persisting**
   - AsyncStorage is automatically configured for native apps
   - Web apps use localStorage by default
   - Check browser console for any errors

### Debugging

Enable debug logging in development:

```typescript
// In lib/supabase.ts, temporarily add:
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    // ... existing config
    debug: __DEV__, // Enable debug logging in development
  },
});
```

## Security Notes

- Never commit your `.env` file to version control
- Use environment-specific configurations for development and production
- Regularly rotate your Supabase keys
- Enable row-level security (RLS) in your Supabase database
- Use Supabase's built-in rate limiting for authentication

## Next Steps

Once authentication is working, you can:

1. **Add User Profiles**: Store additional user information in a `profiles` table
2. **Implement Role-Based Access**: Use Supabase's custom claims for user roles
3. **Add Social Sharing**: Allow users to share content with their authentication
4. **Implement Passkeys**: Use WebAuthn for passwordless authentication
5. **Set Up Email Verification**: Require email verification before full access

## File Structure

```
lib/
├── auth.ts          # Authentication functions (OAuth, magic link, sign out)
├── supabase.ts      # Supabase client configuration
└── ...

app/
├── welcome.tsx      # Welcome screen with auth options
├── auth/
│   └── email.tsx    # Email OTP authentication screen
└── account.tsx      # Account management screen

hooks/
└── useAuth.ts       # Custom hook for authentication state
```

All authentication flows are already implemented and ready to use!
