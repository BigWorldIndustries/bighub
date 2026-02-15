# Supreme Court Nomination Form - Quick Start Guide

## ✅ Implementation Complete!

All code has been written and tested for linter errors. The system is ready to use.

## 🚀 Quick Start

### 1. Environment Variables (Already Set Up)
Your `.env` file has been updated with:
- ✅ `DISCORD_CLIENT_ID` - Already configured
- ✅ `DISCORD_CLIENT_SECRET` - Already configured  
- ✅ `DISCORD_REDIRECT_URI` - Set to `http://localhost:5173/api/auth/discord/callback`
- ✅ `AUTH_SECRET` - Auto-generated secure random key

### 2. Discord Developer Portal
Verify your Discord OAuth application settings at https://discord.com/developers/applications:

1. Select your application (Client ID: 1472641614114721822)
2. Go to **OAuth2** → **Redirects**
3. Ensure this URL is added: `http://localhost:5173/api/auth/discord/callback`
4. Scopes should include: `identify`

### 3. Start the Development Server
```bash
npm run dev
```

### 4. Test the Application
1. Navigate to `http://localhost:5173/nominate`
2. You'll be redirected to Discord for authorization
3. After authorizing, you'll return to the nomination form
4. Select 1-3 candidates and submit
5. Try refreshing or revisiting - you should see "already submitted" message

## 📁 What Was Built

### New Routes:
- `/nominate` - Supreme Court nomination form (Discord login required)
- `/api/auth/discord` - Discord OAuth login redirect
- `/api/auth/discord/callback` - OAuth callback handler
- `/api/auth/logout` - Logout endpoint
- `/api/forms` - Generic forms API (GET/POST)

### Key Features:
- ✅ Discord OAuth 2.0 authentication
- ✅ Secure session management with signed cookies
- ✅ Generic forms system (reusable for future forms)
- ✅ One submission per user per form
- ✅ Firestore integration
- ✅ Beautiful UI with Skeleton components
- ✅ "Already submitted" state detection

## 🗄️ Firestore Data Structure

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

## 🔧 Customization

### Change the Candidate List
Edit `src/routes/nominate/+page.svelte`, line ~18:
```typescript
const eligibleCandidates = [
  { id: 'johan', name: 'Johan', displayName: 'Most Holy Quiche Mechanicus' },
  // Add/modify candidates here
];
```

### Create a New Form
To add another form (e.g., a survey):

1. Create `src/routes/my-survey/+page.server.ts`:
```typescript
import { redirect } from '@sveltejs/kit';

const FORM_ID = 'my-survey-2025'; // Unique form ID

export const load = async ({ locals, fetch }: any) => {
  if (!locals.discordUser) {
    throw redirect(302, '/api/auth/discord?returnTo=/my-survey');
  }
  
  const response = await fetch(`/api/forms?formId=${FORM_ID}`);
  const data = await response.json();
  
  return {
    user: locals.discordUser,
    existingSubmission: data.submitted ? data.submission : null
  };
};
```

2. Create `src/routes/my-survey/+page.svelte` and use the same `/api/forms` endpoint:
```typescript
// POST to /api/forms with:
{
  formId: "my-survey-2025",
  form_data: {
    // Whatever data structure you need
    answer1: "...",
    answer2: "..."
  }
}
```

No new API routes or Firestore collections needed!

## 🌐 Production Deployment (Vercel)

When deploying to production:

1. **Add environment variables in Vercel dashboard:**
   - `DISCORD_CLIENT_ID` (same value)
   - `DISCORD_CLIENT_SECRET` (same value)
   - `DISCORD_REDIRECT_URI` → Change to: `https://yourdomain.vercel.app/api/auth/discord/callback`
   - `AUTH_SECRET` (same value)
   - All existing Firebase variables

2. **Update Discord Developer Portal:**
   - Add production redirect URI: `https://yourdomain.vercel.app/api/auth/discord/callback`

3. **Deploy:**
   ```bash
   git add .
   git commit -m "Add Supreme Court nomination form with Discord OAuth"
   git push
   ```

## 📊 View Submissions

To view all nominations in Firestore:
1. Go to Firebase Console
2. Navigate to Firestore Database
3. Browse to: `forms` → `scotus-nomination` → `submissions`
4. Each document represents one user's submission

## 🐛 Troubleshooting

### "Invalid state parameter" error
- Clear your cookies and try again
- Ensure `AUTH_SECRET` is set in `.env`

### "Not authenticated" error
- Check that Discord OAuth redirect URI matches exactly
- Verify environment variables are loaded (restart dev server)

### Session not persisting
- Check browser console for cookie errors
- Ensure `AUTH_SECRET` is the same value used when session was created
- Try logging out and logging back in

## 📝 Files Modified/Created

**Created (7 files):**
- `src/hooks.server.ts`
- `src/routes/api/auth/discord/+server.ts`
- `src/routes/api/auth/discord/callback/+server.ts`
- `src/routes/api/auth/logout/+server.ts`
- `src/routes/api/forms/+server.ts`
- `src/routes/nominate/+page.server.ts`
- `src/routes/nominate/+page.svelte`

**Modified (3 files):**
- `src/app.d.ts` (added Locals interface & env var types)
- `src/routes/+layout.svelte` (added Nominate nav link)
- `.env` (added Discord & AUTH_SECRET variables)

---

**Need help?** Check the implementation notes in `IMPLEMENTATION_NOTES.md` or reach out!
