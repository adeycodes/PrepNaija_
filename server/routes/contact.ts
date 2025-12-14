// server/routes/contact.js
import express from "express";
import { sendContactEmails } from "../utils/sendEmail.ts";

const router = express.Router();

router.post("/", async (req, res) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ error: "All fields are required" });
  }

  const result = await sendContactEmails({ name, email, message });

  if (result.success) {
    res.status(200).json({ message: "Message sent successfully!" });
  } else {
    res.status(500).json({ error: "Failed to send message. Please try again." });
  }
});

export default router;