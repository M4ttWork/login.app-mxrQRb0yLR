const express = require("express");
const cors = require("cors");
const nodemailer = require("nodemailer");

const app = express();

// --- 1) Konfiguracja CORS – obsługa preflight i niestandardowych nagłówków
const corsOptions = {
  origin: "https://m4ttwork.github.io",  // ✅ zmieniono na domenę GitHub Pages
  methods: ["POST", "OPTIONS"],
  allowedHeaders: ["Content-Type", "X-User-ID", "X-Full-Name"]
};
app.use(cors(corsOptions));
app.options("/upload", cors(corsOptions));  // odpowiedź na preflight

// --- 2) Middleware do parsowania surowego PDF
app.use("/upload", express.raw({ type: "application/pdf", limit: "10mb" }));

// --- 3) Endpoint uploadu
app.post("/upload", async (req, res) => {
  const uid = req.header("X-User-ID") || "unknown";
  const fullName = req.header("X-Full-Name") || "Nieznane_Imię_i_Nazwisko";
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");

  const sanitizedFullName = fullName
    .replace(/[^a-zA-ZąćęłńóśźżĄĆĘŁŃÓŚŹŻ0-9\s]/g, "")
    .replace(/\s+/g, "_");
  const fileName = `${sanitizedFullName}_${timestamp}.pdf`;

  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || "587", 10),
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    await transporter.sendMail({
      from: `"PDF Uploader" <${process.env.SMTP_USER}>`,
      to: process.env.RECIPIENT_EMAIL,
      subject: `Potwierdzenie od: ${fullName}`,
      text: `W załączniku znajduje się potwierdzenie od: ${fullName}`,
      attachments: [{
        filename: fileName,
        content: req.body,
        contentType: "application/pdf"
      }]
    });

    console.log(`✅ Plik przesłany e-mailem jako ${fileName}`);
    res.status(200).json({ success: true });
  } catch (err) {
    console.error("❌ Błąd wysyłki e-maila:", err);
    res.status(500).json({ error: "Błąd serwera" });
  }
});

// --- 4) Start serwera
const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`🚀 Serwer działa na porcie ${PORT}`)
);
