const express = require("express");
const fs = require("fs");
const path = require("path");
const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static("public"));

// Helper read/write
const dbFile = path.join(__dirname, "db", "transaksi.json");
const passFile = path.join(__dirname, "db", "password.json");

function readTransaksi() {
  return JSON.parse(fs.readFileSync(dbFile, "utf-8"));
}
function writeTransaksi(data) {
  fs.writeFileSync(dbFile, JSON.stringify(data, null, 2));
}

// Routes
app.get("/api/transaksi", (req, res) => {
  res.json(readTransaksi());
});

app.post("/api/transaksi", (req, res) => {
  const transaksi = readTransaksi();
  transaksi.push(req.body);
  writeTransaksi(transaksi);
  res.json({ status: "success" });
});

app.put("/api/transaksi/:id", (req, res) => {
  const { password } = req.body;
  const realPass = JSON.parse(fs.readFileSync(passFile)).password;
  if (password !== realPass)
    return res.status(403).json({ error: "Wrong password" });

  let transaksi = readTransaksi();
  transaksi[req.params.id] = req.body.data;
  writeTransaksi(transaksi);
  res.json({ status: "updated" });
});

app.delete("/api/transaksi/:id", (req, res) => {
  const { password } = req.body;
  const realPass = JSON.parse(fs.readFileSync(passFile)).password;
  if (password !== realPass)
    return res.status(403).json({ error: "Wrong password" });

  let transaksi = readTransaksi();
  transaksi.splice(req.params.id, 1);
  writeTransaksi(transaksi);
  res.json({ status: "deleted" });
});

app.listen(PORT, () => console.log(`Server running: http://localhost:${PORT}`));
