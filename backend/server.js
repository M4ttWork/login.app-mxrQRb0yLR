const express = require("express");
const fs = require("fs");
const path = require("path");
const cors = require("cors");

const app = express();
app.use(cors()); // Umożliwia połączenie z GitHub Pages lub innym frontendem
app.use(express.raw({ type: "application/pdf", limit: "10mb" }));

app.post("/upload", (req, res) => {
  const uid = req.header("X-User-ID") || "unknown";
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const fileName = `regulamin_signed_${uid}_${timestamp}.pdf`;

  const filePath = path.join("/tmp", fileName); // Tylko /tmp jest zapisywalny na Render

  fs.writeFile(filePath, req.body, (err) => {
    if (err) {
      console.error("❌ Błąd zapisu:", err);
      return res.status(500).send("Błąd serwera");
    }
    console.log(`✅ Plik zapisany jako ${filePath}`);
    res.status(200).send("Plik przyjęty");
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Serwer działa na porcie ${PORT}`);
});
