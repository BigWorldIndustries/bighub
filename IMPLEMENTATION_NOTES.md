# Supreme Court Nomination Form - Implementation Complete

## What Was Built

A complete Discord OAuth-gated form system with the following features:

### 1. **Discord OAuth Authentication**
- Login via Discord OAuth 2.0
- Session management with secure, signed cookies
- User profile fetching (username, avatar)
- Logout functionality

### 2. **Generic Forms API**
- Reusable `/api/forms` endpoint for any form type
- Form submissions stored in Firestore: `forms/{formId}/submissions/{discordUserId}`
- One submission per user per form (enforced by document ID)
- GET endpoint to check existing submissions
- POST endpoint to create new submissions

### 3. **Supreme Court Nomination Page**
- Protected route (requires Discord login)
- Select up to 3 candidates
- Shows "already submitted" state if user has already nominated
- Displays user's Discord avatar and username
- Clean UI with Skeleton components and Tailwind

### 4. **Navigation**
- Added "Nominate" link to the main navigation bar

## Files Created/Modified

### Created Files:
1. `src/hooks.server.ts` - Session cookie parsing and user authentication
2. `src/routes/api/auth/discord/+server.ts` - OAuth login redirect
3. `src/routes/api/auth/discord/callback/+server.ts` - OAuth callback handler
4. `src/routes/api/auth/logout/+server.ts` - Logout endpoint
5. `src/routes/api/forms/+server.ts` - Generic forms API (GET/POST)
6. `src/routes/nominate/+page.server.ts` - Page server load with auth guard
7. `src/routes/nominate/+page.svelte` - Nomination form UI

### Modified Files:
1. `src/app.d.ts` - Added `Locals` interface for Discord user session
2. `src/routes/+layout.svelte` - Added "Nominate" navigation link
3. `.env` - Updated with Discord OAuth and AUTH_SECRET variables

## Next Steps for You

### 1. Generate AUTH_SECRET
Run this command in your terminal and update the `.env` file:
```bash
openssl rand -hex 32
```
Replace `your-random-secret-key-here-replace-me` in `.env` with the generated value.

### 2. Update Discord Redirect URI in Developer Portal
The redirect URI is currently set to `http://localhost:5173/api/auth/discord/callback` (correct path).

Go to the [Discord Developer Portal](https://discord.com/developers/applications):
1. Select your application (ID: 1472641614114721822)
2. Go to OAuth2 settings
3. Ensure the redirect URI is: `http://localhost:5173/api/auth/discord/callback`

### 3. For Production Deployment
When deploying to Vercel, add these environment variables in the Vercel dashboard:
- `DISCORD_CLIENT_ID` (same as local)
- `DISCORD_CLIENT_SECRET` (same as local)
- `DISCORD_REDIRECT_URI` (update to your production URL, e.g., `https://yourdomain.vercel.app/api/auth/discord/callback`)
- `AUTH_SECRET` (same as local)
- All existing Firebase variables

Then update the Discord Developer Portal to include the production redirect URI as well.

### 4. Test the Application
1. Start the dev server: `npm run dev`
2. Navigate to `/nominate`
3. You'll be redirected to Discord for login
4. After authorizing, you'll return to the nomination form
5. Select 1-3 candidates and submit
6. Refresh or revisit - you should see "already submitted" state

## Firestore Structure

```
forms/
  scotus-nomination/
    submissions/
      {discord_user_id}/
        {
          discordUserId: "123456789",
          discordUsername: "username",
          form_data: {
            nominees: ["johan", "dan", "alice"]
          },
          submittedAt: Timestamp
        }
```

## Adding Future Forms

To create a new form (e.g., a survey), you only need:

1. Create a new page: `src/routes/my-survey/+page.server.ts` and `+page.svelte`
2. Use the same `/api/forms` endpoint with a different `formId`
3. Structure your `form_data` however you need

No new API routes or Firestore collections required!

## Customizing the Candidate List

Edit the `eligibleCandidates` array in `src/routes/nominate/+page.svelte` to change the list of nominees.
