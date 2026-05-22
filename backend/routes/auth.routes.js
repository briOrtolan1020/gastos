const express = require("express");
const router = express.Router();

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const pool = require("../db");

const SECRET = "duocash_secret";

router.post("/register", async (req, res) => {
  try {
    const { nombre, email, password } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `
      INSERT INTO usuarios
      (nombre, email, password)
      VALUES ($1, $2, $3)
      RETURNING id, nombre, email
      `,
      [nombre, email, hashedPassword]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.log(error);

    res.status(500).json({
      error: "Error registrando usuario",
    });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const result = await pool.query(
      `
      SELECT * FROM usuarios
      WHERE email = $1
      `,
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        error: "Usuario no encontrado",
      });
    }

    const usuario = result.rows[0];

    const passwordCorrecta = await bcrypt.compare(
      password,
      usuario.password
    );

    if (!passwordCorrecta) {
      return res.status(401).json({
        error: "Contraseña incorrecta",
      });
    }

    const token = jwt.sign(
      {
        id: usuario.id,
        email: usuario.email,
      },
      SECRET,
      {
        expiresIn: "7d",
      }
    );

    res.json({
      token,
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email,
      },
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      error: "Error iniciando sesión",
    });
  }
});

module.exports = router;