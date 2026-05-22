const express = require("express");
const router = express.Router();
const pool = require("../db");

router.get("/", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM gastos ORDER BY created_at DESC"
    );

    res.json(result.rows);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error obteniendo gastos" });
  }
});

router.post("/", async (req, res) => {
  try {
    const { persona, detalle, monto, categoria, fecha } = req.body;

    const result = await pool.query(
      `
      INSERT INTO gastos
      (persona, detalle, monto, categoria, fecha)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
      `,
      [persona, detalle, monto, categoria, fecha]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error guardando gasto" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    await pool.query("DELETE FROM gastos WHERE id = $1", [id]);

    res.json({ ok: true });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error eliminando gasto" });
  }
});

module.exports = router;