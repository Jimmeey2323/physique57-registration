# Deployment Guide - Physique 57 Registration Form

## 🚀 Quick Deploy to Vercel

### Step 1: Install Vercel CLI

```bash
npm install -g vercel
```

### Step 2: Login to Vercel

```bash
vercel login
```

This will open a browser window for authentication.

### Step 3: Deploy

From the project directory:

```bash
cd "/Users/jimmeeygondaa/Stronger in 30"
vercel
```

Follow the prompts:
- **Set up and deploy?** → Yes
- **Which scope?** → Select your account
- **Link to existing project?** → No
- **What's your project's name?** → physique57-registration (or any name)
- **In which directory is your code located?** → ./
- **Want to override the settings?** → No

### Step 4: Set Environment Variables

After first deployment, add environment variables:

```bash
vercel env add MAILTRAP_API_TOKEN
```

When prompted, paste: `bfdea519fa8a5535a58f43016032de8f`

```bash
vercel env add MAILTRAP_FROM_EMAIL
```

When prompted, paste: `hello@physique57india.com`

Select all environments (Production, Preview, Development).

### Step 5: Deploy to Production

```bash
vercel --prod
```

Your app will be live at: `https://your-project-name.vercel.app`

---

## 📋 Alternative: Deploy via Vercel Dashboard

### 1. Push to GitHub

```bash
# Create a new repository on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/physique57-registration.git
git branch -M main
git push -u origin main
```

### 2. Import to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click "Add New" → "Project"
3. Import your GitHub repository
4. Configure:
   - **Framework Preset:** Other
   - **Root Directory:** ./
   - **Build Command:** (leave empty)
   - **Output Directory:** (leave empty)

### 3. Add Environment Variables

In Vercel Dashboard → Settings → Environment Variables:

| Name | Value |
|------|-------|
| `MAILTRAP_API_TOKEN` | `bfdea519fa8a5535a58f43016032de8f` |
| `MAILTRAP_FROM_EMAIL` | `hello@physique57india.com` |

### 4. Deploy

Click "Deploy" and wait for deployment to complete.

---

## 🧪 Testing Locally with Vercel Dev

```bash
# Install dependencies
npm install

# Start Vercel dev server
vercel dev
```

Access at: `http://localhost:3000`

This runs the serverless functions locally, simulating the production environment.

---

## 🔧 Custom Domain Setup

### After Deployment:

1. Go to Vercel Dashboard → Your Project → Settings → Domains
2. Add your custom domain (e.g., `register.physique57india.com`)
3. Update your DNS records as instructed by Vercel:
   - Type: `CNAME`
   - Name: `register` (or `@` for root domain)
   - Value: `cname.vercel-dns.com`

---

## 📊 Monitoring & Logs

- **View Logs:** Vercel Dashboard → Your Project → Functions
- **Monitor Performance:** Vercel Dashboard → Analytics
- **Error Tracking:** Check function logs for any errors

---

## 🔒 Security Best Practices

### Move Sensitive Data to Environment Variables

In production, add these as Vercel environment variables:

```bash
vercel env add GOOGLE_CLIENT_ID
vercel env add GOOGLE_CLIENT_SECRET
vercel env add GOOGLE_REFRESH_TOKEN
vercel env add SPREADSHEET_ID
vercel env add MOMENCE_USERNAME
vercel env add MOMENCE_PASSWORD
vercel env add MOMENCE_BASIC_AUTH
```

Then update `index.html` to read from a config endpoint instead of hardcoded values.

---

## 🐛 Troubleshooting

### Email not sending?

Check Vercel function logs:
```bash
vercel logs
```

### CORS errors?

Ensure `api/send-otp.js` has correct CORS headers (already configured).

### Environment variables not working?

1. Verify they're set: Vercel Dashboard → Settings → Environment Variables
2. Redeploy: `vercel --prod`

---

## 📞 Support

For deployment issues:
- Vercel Docs: https://vercel.com/docs
- Vercel Discord: https://vercel.com/discord

For project issues:
- Email: jimmeey@physique57india.com
