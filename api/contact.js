// api/contact.js
//
// Vercel serverless function. Vercel automatically turns any file inside
// /api into a live endpoint — this file becomes: POST /api/contact
// No server runs 24/7; Vercel spins this up only when a request arrives.
// Frontend and this API deploy together from the same repo, so they share
// the same domain — no CORS setup needed.

const nodemailer = require("nodemailer");

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, error: "Method not allowed" });
  }

  const { name, email, message } = req.body || {};

  // Basic validation — never trust data coming from the client
  if (!name || !email || !message) {
    return res.status(400).json({
      success: false,
      error: "Name, email, and message are all required.",
    });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({
      success: false,
      error: "Please provide a valid email address.",
    });
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });

  try {
    await transporter.sendMail({
      from: `"Portfolio Contact Form" <${process.env.GMAIL_USER}>`,
      to: process.env.GMAIL_USER,
      replyTo: email,
      subject: `New portfolio message from ${name}`,
      text: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
      html: `
        <h3>New message from your portfolio contact form</h3>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Message:</strong></p>
        <p>${message.replace(/\n/g, "<br>")}</p>
      `,
    });

    return res.status(200).json({ success: true, message: "Message sent successfully." });
  } catch (err) {
    console.error("Email send failed:", err);
    return res.status(500).json({
      success: false,
      error: "Something went wrong while sending your message. Please try again.",
    });
  }
};