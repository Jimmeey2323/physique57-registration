# Physique 57 Registration Form

A modern, multi-step registration form for Physique 57 with email verification, member search, and Google Sheets integration.

## Features

- ✨ Multi-step form wizard with progress indicators
- 📧 Email verification with OTP (One-Time Password)
- 🔍 Member search functionality via Momence API
- 📊 Dual Google Sheets logging (Complete signups & Incomplete submissions)
- 🎨 Modern, responsive design with animated backgrounds
- 🔐 Secure backend processing via Vercel serverless functions
- 📱 WhatsApp integration for direct contact
- 🎯 Tag assignment for existing members

## Setup

### Prerequisites

- Node.js 18.x or higher
- Vercel account (for deployment)
- Mailtrap account (for email sending)
- Google Sheets API credentials
- Momence API credentials

### Environment Variables

Create a `.env` file in the root directory:

```env
MAILTRAP_API_TOKEN=your_mailtrap_api_token
MAILTRAP_FROM_EMAIL=hello@physique57india.com
```

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Deploy to Vercel
npm run deploy
```

## Local Development

```bash
# Start local server with Vercel dev
npx vercel dev
```

The application will be available at `http://localhost:3000`

## Deployment to Vercel

### First-time Setup

1. Install Vercel CLI:
```bash
npm install -g vercel
```

2. Login to Vercel:
```bash
vercel login
```

3. Deploy:
```bash
vercel --prod
```

### Environment Variables in Vercel

Add these environment variables in your Vercel project settings:

- `MAILTRAP_API_TOKEN` - Your Mailtrap API token
- `MAILTRAP_FROM_EMAIL` - From email address (hello@physique57india.com)

## Project Structure

```
.
├── api/
│   └── send-otp.js          # Vercel serverless function for email OTP
├── index.html               # Main registration form
├── customers.html           # Customer listing page
├── logo.jpeg               # Physique 57 logo
├── package.json            # Node.js dependencies
├── vercel.json             # Vercel configuration
├── .gitignore              # Git ignore rules
└── README.md               # This file
```

## API Endpoints

### POST /api/send-otp

Sends OTP verification code to user's email.

**Request:**
```json
{
  "email": "user@example.com",
  "otp": "123456"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Verification code sent successfully"
}
```

## Form Flow

1. **Step 1: User Information**
   - First Name, Last Name
   - Email Address (with OTP verification)
   - Phone Number
   - Studio Location Selection

2. **Step 2: Member Status Check**
   - Existing Member → Search for membership
   - New Member → Show purchase options

3. **Step 3a: Existing Members**
   - Search by email
   - Select active membership
   - Submit registration

3. **Step 3b: New Members**
   - Submit registration
   - Option to purchase membership online
   - Option to contact via WhatsApp

## Google Sheets Integration

Two sheets are used for data tracking:

- **Signups**: Complete submissions (no duplicates based on email)
- **Incomplete**: Abandoned/incomplete forms (allows duplicates)

## Technologies Used

- Pure HTML/CSS/JavaScript (no frameworks)
- Vercel Serverless Functions (Node.js)
- Mailtrap API for email sending
- Google Sheets API for data logging
- Momence API for member management
- Facebook Pixel & Snapchat Pixel for tracking

## License

Proprietary - Physique 57 India

## Support

For support, contact: jimmeey@physique57india.com
