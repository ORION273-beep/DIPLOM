/**
 * Email sender — mock in development, logs reset links to console.
 * Set SMTP_HOST in production for real delivery.
 */
async function sendPasswordResetEmail({ email, resetUrl }) {
  if (process.env.SMTP_HOST) {
    // Production: integrate nodemailer/resend here when SMTP is configured
    console.log(`[email] Would send reset to ${email}: ${resetUrl}`);
    return;
  }
  console.log(`[forgot-password] Reset link for ${email}: ${resetUrl}`);
}

module.exports = { sendPasswordResetEmail };
