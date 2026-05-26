import { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { supabase } from "../supabaseClient";

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
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            nombre,
          },
        },
      });

      if (error) throw error;

      toast.success("Cuenta creada");

      setModoRegistro(false);

      return;
    }

    const { data, error } =
      await supabase.auth.signInWithPassword({
        email,
        password,
      });

    if (error) throw error;

    localStorage.setItem(
      "usuario",
      JSON.stringify(data.user)
    );

    toast.success("Bienvenido");

    window.location.href = "/";
  } catch (error) {
    console.log(error);

    toast.error(error.message);
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