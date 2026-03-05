// Vercel Serverless Function to send OTP emails via Mailtrap
const fetch = require('node-fetch');

module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Handle OPTIONS request for CORS preflight
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, otp } = req.body;

    // Validate input
    if (!email || !otp) {
      return res.status(400).json({ 
        success: false, 
        error: 'Email and OTP are required' 
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid email format' 
      });
    }

    // Validate OTP format (6 digits)
    if (!/^\d{6}$/.test(otp)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid OTP format' 
      });
    }

    // Mailtrap configuration from environment variables
    const MAILTRAP_API_TOKEN = process.env.MAILTRAP_API_TOKEN || 'bfdea519fa8a5535a58f43016032de8f';
    const MAILTRAP_FROM_EMAIL = process.env.MAILTRAP_FROM_EMAIL || 'hello@physique57india.com';

    // Email HTML template
    const emailContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body {
            font-family: 'Montserrat', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            background: #f8fafc;
            margin: 0;
            padding: 0;
        }
        .container {
            max-width: 600px;
            margin: 40px auto;
            background: white;
            border-radius: 16px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, #6366f1, #8b5cf6);
            padding: 32px;
            text-align: center;
        }
        .header h1 {
            color: white;
            margin: 0;
            font-size: 24px;
            font-weight: 700;
        }
        .content {
            padding: 40px 32px;
        }
        .otp-box {
            background: linear-gradient(135deg, #f3f4f6, #e5e7eb);
            border-radius: 12px;
            padding: 24px;
            text-align: center;
            margin: 24px 0;
        }
        .otp-code {
            font-size: 36px;
            font-weight: 700;
            letter-spacing: 8px;
            color: #6366f1;
            margin: 0;
        }
        .footer {
            text-align: center;
            padding: 24px;
            color: #6b7280;
            font-size: 13px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>PHYSIQUE 57</h1>
        </div>
        <div class="content">
            <h2 style="color: #1f2937; margin-top: 0;">Email Verification</h2>
            <p style="color: #4b5563; font-size: 15px;">
                Thank you for registering with Physique 57! Please use the verification code below to complete your registration:
            </p>
            <div class="otp-box">
                <p class="otp-code">${otp}</p>
            </div>
            <p style="color: #6b7280; font-size: 13px; margin-bottom: 0;">
                This code will expire in 10 minutes. If you did not request this code, please ignore this email.
            </p>
        </div>
        <div class="footer">
            <p style="margin: 0;">Transform Your Body, Transform Your Life</p>
            <p style="margin: 8px 0 0 0;">&copy; 2026 Physique 57 India</p>
        </div>
    </div>
</body>
</html>`;

    // Send email via Mailtrap API
    const response = await fetch('https://send.api.mailtrap.io/api/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${MAILTRAP_API_TOKEN}`
      },
      body: JSON.stringify({
        from: {
          email: MAILTRAP_FROM_EMAIL,
          name: 'Physique 57 India'
        },
        to: [{ email: email }],
        subject: 'Your Physique 57 Verification Code',
        html: emailContent,
        category: 'Email Verification'
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Mailtrap API error:', errorText);
      return res.status(500).json({ 
        success: false, 
        error: 'Failed to send email. Please try again.' 
      });
    }

    const result = await response.json();
    console.log('Email sent successfully:', result);

    return res.status(200).json({ 
      success: true, 
      message: 'Verification code sent successfully' 
    });

  } catch (error) {
    console.error('Error in send-otp function:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    });
  }
};
