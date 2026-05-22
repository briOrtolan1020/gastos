const express = require("express");
const cors = require("cors");

const pool = require("./db");
const gastosRoutes = require("./routes/gastos.routes.js");
const authRoutes = require("./routes/auth.routes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/gastos", gastosRoutes);
app.use("/api/auth", authRoutes);

pool
  .connect()
  .then(() => {
    console.log("✅ PostgreSQL conectado");
  })
  .catch((err) => {
    console.log("❌ Error PostgreSQL", err);
  });

app.get("/", (req, res) => {
  res.send("Backend DuoCash funcionando correctamente");
});

app.get("/api/status", (req, res) => {
  res.json({
    ok: true,
    message: "El servidor está funcionando",
  });
});

const PORT = 3001;

app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});