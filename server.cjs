const express = require("express");
const cors = require("cors");
const nodemailer = require("nodemailer");

const app = express();
app.use(cors());
app.use(express.raw({ type: "application/pdf", limit: "10mb" }));

app.post("/upload", async (req, res) => {
  const uid = req.header("X-User-ID") || "unknown";
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const fileName = `regulamin_signed_${uid}_${timestamp}.pdf`;

  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || "587"),
      secure: process.env.SMTP_SECURE === "true", // true dla portu 465, false dla 587
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const mailOptions = {
      from: `"PDF Uploader" <${process.env.SMTP_USER}>`,
      to: process.env.RECIPIENT_EMAIL,
      subject: `Nowy regulamin od użytkownika ${uid}`,
      text: `W załączniku znajduje się podpisany regulamin od użytkownika ${uid}.`,
      attachments: [
        {
          filename: fileName,
          content: req.body,
          contentType: "application/pdf",
        },
      ],
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Plik przesłany e-mailem jako ${fileName}`);
    res.status(200).send("Plik przesłany e-mailem");
  } catch (err) {
    console.error("❌ Błąd wysyłki e-maila:", err);
    res.status(500).send("Błąd serwera");
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Serwer działa na porcie ${PORT}`);
});
