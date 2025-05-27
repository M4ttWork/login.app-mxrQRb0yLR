app.post("/upload", async (req, res) => {
  const uid = req.header("X-User-ID") || "unknown";
  const fullName = req.header("X-Full-Name") || "Nieznane Imię i Nazwisko";
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const safeName = fullName.replace(/[^\w\s]/gi, "").replace(/\s+/g, "_");
  const fileName = `${safeName}_${timestamp}.pdf`;

  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || "587"),
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const mailOptions = {
      from: `"PDF Uploader" <${process.env.SMTP_USER}>`,
      to: process.env.RECIPIENT_EMAIL,
      subject: `Potwierdzenie Alertu od: ${fullName}`,
      text: `W załączniku znajduje się potwierdzenie alertu przez: ${fullName}`,
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
