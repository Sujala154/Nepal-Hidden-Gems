const nodemailer = require('nodemailer');

const sendVerificationOTP = async (email, otp, name) => {
  console.log('\n📧 EMAIL VERIFICATION PROCESS');
  console.log(`To: ${email}`);
  console.log(`Name: ${name}`);
  console.log(`OTP: ${otp}`);

  // Check if email credentials are configured
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log('❌ Email credentials missing in .env file');
    console.log('ℹ️  Please configure EMAIL_USER and EMAIL_PASS in .env');
    console.log('📋 Example:');
    console.log('EMAIL_USER="your-email@gmail.com"');
    console.log('EMAIL_PASS="your-app-password"');
    console.log('\n🔢 Development OTP:', otp);
    return { success: false, otp: otp, message: 'Email credentials missing' };
  }

  try {
    console.log('✅ Email credentials found, creating transporter...');
    
    // Create transporter with your Gmail credentials
    const transporter = nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE || 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      },
      tls: {
        rejectUnauthorized: false // For development only
      }
    });

    // Verify transporter connection
    console.log('🔍 Verifying SMTP connection...');
    await transporter.verify();
    console.log('✅ SMTP connection verified successfully');

    // Email content
    const mailOptions = {
      from: `"Nepal Hidden Gems" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: '🔐 Verify Your Email - Nepal Hidden Gems',
      html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Email Verification</title>
            <style>
                body {
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    line-height: 1.6;
                    color: #333;
                    max-width: 600px;
                    margin: 0 auto;
                    padding: 20px;
                    background-color: #f9fafb;
                }
                .container {
                    background-color: #ffffff;
                    border-radius: 12px;
                    padding: 40px;
                    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                    border: 1px solid #e5e7eb;
                }
                .header {
                    text-align: center;
                    margin-bottom: 30px;
                }
                .logo {
                    color: #3b82f6;
                    font-size: 28px;
                    font-weight: 700;
                    margin-bottom: 10px;
                }
                .tagline {
                    color: #6b7280;
                    font-size: 14px;
                    margin-bottom: 20px;
                }
                .otp-box {
                    background: linear-gradient(135deg, #3b82f6, #1d4ed8);
                    color: white;
                    padding: 25px;
                    border-radius: 10px;
                    text-align: center;
                    margin: 30px 0;
                }
                .otp-code {
                    font-size: 42px;
                    font-weight: 700;
                    letter-spacing: 8px;
                    margin: 15px 0;
                    font-family: monospace;
                }
                .expiry {
                    color: #d1d5db;
                    font-size: 14px;
                    margin-top: 10px;
                }
                .instructions {
                    background-color: #f8fafc;
                    padding: 20px;
                    border-radius: 8px;
                    margin: 25px 0;
                    border-left: 4px solid #3b82f6;
                }
                .footer {
                    margin-top: 40px;
                    padding-top: 20px;
                    border-top: 1px solid #e5e7eb;
                    text-align: center;
                    color: #6b7280;
                    font-size: 12px;
                }
                .button {
                    display: inline-block;
                    background-color: #3b82f6;
                    color: white;
                    padding: 12px 24px;
                    text-decoration: none;
                    border-radius: 6px;
                    font-weight: 600;
                    margin: 10px 0;
                }
                .security-note {
                    background-color: #fef3c7;
                    border: 1px solid #f59e0b;
                    padding: 15px;
                    border-radius: 6px;
                    margin: 20px 0;
                    font-size: 13px;
                    color: #92400e;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <div class="logo">🇳🇵 Nepal Hidden Gems</div>
                    <div class="tagline">Discover the hidden treasures of Nepal</div>
                </div>

                <h2 style="color: #1f2937; margin-bottom: 5px;">Welcome, ${name}!</h2>
                <p style="color: #6b7280; margin-bottom: 25px;">Thank you for joining our community of explorers.</p>

                <div class="otp-box">
                    <p style="margin-bottom: 15px; font-size: 16px;">Your Email Verification Code</p>
                    <div class="otp-code">${otp}</div>
                    <div class="expiry">⏰ Expires in 10 minutes</div>
                </div>

                <div class="instructions">
                    <h4 style="color: #1f2937; margin-top: 0;">How to verify your email:</h4>
                    <ol style="padding-left: 20px; margin: 10px 0;">
                        <li>Return to the Nepal Hidden Gems website</li>
                        <li>Go to the verification page</li>
                        <li>Enter the 6-digit code above</li>
                        <li>Click "Verify Email" to complete registration</li>
                    </ol>
                </div>

                <div class="security-note">
                    <strong>🔒 Security Notice:</strong> Never share this code with anyone. Nepal Hidden Gems will never ask for your password or verification code.
                </div>

                <div style="text-align: center; margin: 30px 0;">
                    <a href="${process.env.CLIENT_URL}/verify-otp" class="button">Go to Verification Page</a>
                </div>

                <div class="footer">
                    <p>This email was sent to ${email} as part of your Nepal Hidden Gems registration.</p>
                    <p>If you didn't create an account, please ignore this email or contact our support team.</p>
                    <p style="margin-top: 20px;">
                        &copy; ${new Date().getFullYear()} Nepal Hidden Gems. All rights reserved.<br>
                        Kathmandu, Nepal
                    </p>
                </div>
            </div>
        </body>
        </html>
      `,
      text: `
NEPAL HIDDEN GEMS - EMAIL VERIFICATION

Welcome to Nepal Hidden Gems, ${name}!

Your verification code is: ${otp}

This code will expire in 10 minutes.

To verify your email:
1. Return to Nepal Hidden Gems website
2. Go to the verification page
3. Enter the 6-digit code above
4. Click "Verify Email"

🔒 Security Notice: Never share this code with anyone. Nepal Hidden Gems will never ask for your password or verification code.

If you didn't create an account, please ignore this email.

---
Nepal Hidden Gems
Discover the hidden treasures of Nepal
© ${new Date().getFullYear()} All rights reserved.
      `
    };

    // Send email
    console.log('🚀 Sending email...');
    const info = await transporter.sendMail(mailOptions);
    
    console.log(`✅ Email sent successfully!`);
    console.log(`📧 Message ID: ${info.messageId}`);
    console.log(`📧 To: ${email}`);
    console.log(`📧 From: ${process.env.EMAIL_USER}`);
    
    return { 
      success: true, 
      messageId: info.messageId,
      message: 'Email sent successfully'
    };
    
  } catch (error) {
    console.error('❌ EMAIL SENDING FAILED:', error.message);
    console.error('❌ Error details:', error);
    
    // Provide helpful debugging info
    if (error.code === 'EAUTH') {
      console.log('\n🔧 TROUBLESHOOTING AUTH ERROR:');
      console.log('1. Make sure you\'re using App Password (not regular password)');
      console.log('2. Enable 2-Step Verification in Google Account');
      console.log('3. Generate new App Password for "Mail"');
      console.log('4. Check if "Less secure apps" is enabled (if using regular password)');
    }
    
    console.log(`\n🔢 DEVELOPMENT OTP: ${otp}`);
    console.log('⚠️  Use this OTP for verification in development');
    
    return { 
      success: false, 
      error: error.message,
      otp: otp,
      message: 'Email sending failed, use OTP from console'
    };
  }
};

const sendResetEmail = async (email, name, resetUrl) => {
  console.log('\n🔐 PASSWORD RESET REQUEST');
  console.log(`To: ${email}`);
  console.log(`🔗 Development Reset URL: ${resetUrl}\n`);

  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log("❌ Email credentials missing in .env file");
    return { success: false, message: "Email credentials missing", resetUrl };
  }

  try {
    const transporter = nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE || "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      tls: { rejectUnauthorized: false },
    });

    await transporter.verify();

    const mailOptions = {
      from: `"Nepal Hidden Gems" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "🔒 Reset your password - Nepal Hidden Gems",
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background:#f8fafc; padding:24px;">
          <div style="max-width:640px;margin:0 auto;background:#ffffff;border:1px solid #e5e7eb;border-radius:12px;box-shadow:0 10px 30px rgba(0,0,0,0.08);overflow:hidden;">
            <div style="background:linear-gradient(135deg,#0b1f3a,#1f3b6b);padding:28px;color:#fff;">
              <h1 style="margin:0;font-size:22px;">Nepal Hidden Gems</h1>
              <p style="margin:4px 0 0;font-size:14px;color:#dbeafe;">Secure password reset</p>
            </div>
            <div style="padding:28px;">
              <p style="font-size:16px;color:#0f172a;margin:0 0 12px;">Hi ${name || "Explorer"},</p>
              <p style="font-size:15px;color:#334155;margin:0 0 16px;">We received a request to reset your password. Click the button below to set a new password. This link expires in 15 minutes.</p>
              <div style="text-align:center;margin:28px 0;">
                <a href="${resetUrl}" style="display:inline-block;padding:14px 24px;background:#fbbf24;color:#0b1f3a;font-weight:700;text-decoration:none;border-radius:12px;box-shadow:0 10px 20px rgba(251,191,36,0.25);">Reset Password</a>
              </div>
              <p style="font-size:14px;color:#475569;margin:0 0 12px;">If the button doesn’t work, copy and paste this link into your browser:</p>
              <p style="font-size:13px;color:#0ea5e9;word-break:break-all;margin:0 0 20px;">${resetUrl}</p>
              <div style="background:#f1f5f9;border:1px solid #e2e8f0;border-radius:10px;padding:12px 14px;font-size:13px;color:#475569;">
                If you didn’t request a password reset, please ignore this email. Your account remains secure.
              </div>
            </div>
            <div style="padding:18px 28px;border-top:1px solid #e2e8f0;text-align:center;font-size:12px;color:#94a3b8;">
              © ${new Date().getFullYear()} Nepal Hidden Gems. Discover responsibly.
            </div>
          </div>
        </div>
      `,
      text: `Reset your password: ${resetUrl}`,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Reset email sent:", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("❌ Reset email failed:", error);
    return { success: false, error: error.message, resetUrl };
  }
};

module.exports = { sendVerificationOTP, sendResetEmail };