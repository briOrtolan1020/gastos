import { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

const API_URL = "http://localhost:3001/api";

export default function Login() {
  const [modoRegistro, setModoRegistro] = useState(false);

  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      if (modoRegistro) {
        await axios.post(`${API_URL}/auth/register`, {
          nombre,
          email,
          password,
        });

        toast.success("Usuario creado correctamente");

        setModoRegistro(false);

        return;
      }

      const res = await axios.post(
        `${API_URL}/auth/login`,
        {
          email,
          password,
        }
      );

      localStorage.setItem(
        "token",
        res.data.token
      );

      localStorage.setItem(
        "usuario",
        JSON.stringify(res.data.usuario)
      );

      toast.success("Bienvenido");

      window.location.href = "/";
    } catch (error) {
      console.log(error);

      toast.error("Ocurrió un error");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 p-6">
      <form
        onSubmit={handleSubmit}
        className="bg-white w-full max-w-md rounded-3xl shadow-2xl p-8"
      >
        <h1 className="text-4xl font-black text-center mb-8">
          DuoCash
        </h1>

        <h2 className="text-2xl font-bold mb-6">
          {modoRegistro
            ? "Crear cuenta"
            : "Iniciar sesión"}
        </h2>

        {modoRegistro && (
          <input
            type="text"
            placeholder="Nombre"
            value={nombre}
            onChange={(e) =>
              setNombre(e.target.value)
            }
            className="w-full p-4 rounded-2xl bg-slate-100 outline-none mb-4"
          />
        )}

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) =>
            setEmail(e.target.value)
          }
          className="w-full p-4 rounded-2xl bg-slate-100 outline-none mb-4"
        />

        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) =>
            setPassword(e.target.value)
          }
          className="w-full p-4 rounded-2xl bg-slate-100 outline-none mb-6"
        />

        <button className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-2xl py-4 font-bold hover:scale-105 transition">
          {modoRegistro
            ? "Crear cuenta"
            : "Ingresar"}
        </button>

        <button
          type="button"
          onClick={() =>
            setModoRegistro(!modoRegistro)
          }
          className="w-full mt-4 text-indigo-600 font-medium"
        >
          {modoRegistro
            ? "Ya tengo cuenta"
            : "Crear cuenta"}
        </button>
      </form>
    </div>
  );
}