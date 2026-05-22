import axios from "axios";

const API_URL = "http://localhost:3001/api";

export async function getGastos() {
  const res = await axios.get(`${API_URL}/gastos`);
  return res.data;
}

export async function crearGasto(gasto) {
  const res = await axios.post(`${API_URL}/gastos`, gasto);
  return res.data;
}

export async function eliminarGastoDB(id) {
  await axios.delete(`${API_URL}/gastos/${id}`);
}