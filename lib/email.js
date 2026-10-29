import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT),
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Email for the Student (Self Assessment) - Updated for Direct Link
export async function sendStudentInvite({ to, name, assessmentId, participantId, assessmentTitle }) {
  // Create the direct link that bypasses login
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
  const link = `${baseUrl}/self/${assessmentId}/${participantId}`;

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to,
      subject: `Action Required: ${assessmentTitle} (Self Assessment)`,
      html: `
        <h2>Hello ${name},</h2>
        <p>You have been invited to complete a self-assessment for: <strong>${assessmentTitle}</strong>.</p>
        <p>Please click the button below to begin. This link is unique to you.</p>
        <p><a href="${link}" style="background-color: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Start Self-Assessment</a></p>
      `,
    });
    console.log(`Student email sent to ${to}`);
  } catch (error) {
    console.error("Failed to send student email to", to, error);
  }
}

// Email for the Peer (Evaluation)
export async function sendPeerInvite({ to, name, token, assessmentTitle, studentName }) {
  const link = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/assess/${token}`;
  
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to,
      subject: `Action Required: Evaluate ${studentName} for ${assessmentTitle}`,
      html: `
        <h2>Hello ${name},</h2>
        <p>A student named <strong>${studentName}</strong> has completed their self-assessment for <strong>${assessmentTitle}</strong>.</p>
        <p>It is now your turn to evaluate them. Please click the button below:</p>
        <p><a href="${link}" style="background-color: #10b981; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Evaluate ${studentName}</a></p>
      `,
    });
    console.log(`Peer email sent to ${to} for student ${studentName}`);
  } catch (error) {
    console.error("Failed to send peer email to", to, error);
  }
}