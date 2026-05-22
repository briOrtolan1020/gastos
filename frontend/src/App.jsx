import { useEffect, useState } from "react";
import { getGastos, crearGasto, eliminarGastoDB } from "./api";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Bell, FileDown } from "lucide-react";
import Login from "./pages/Login";
import { Toaster } from "react-hot-toast";
import {
  Wallet,
  PiggyBank,
  TrendingUp,
  CalendarDays,
  History,
  Trash2,
} from "lucide-react";

function obtenerStorage(clave, valorInicial) {
  const guardado = localStorage.getItem(clave);
  return guardado ? JSON.parse(guardado) : valorInicial;
}

const categorias = [
  "Comida",
  "Alquiler",
  "Servicios",
  "Transporte",
  "Salidas",
  "Ropa",
  "Deudas",
  "Otros",
];

function Dashboard() {
  const sueldoBrisa = obtenerStorage("sueldoBrisa", 0);
  const gastosBrisa = obtenerStorage("gastosBrisa", []);
  const quincena1 = obtenerStorage("joaquinQuincena1", 0);
  const quincena2 = obtenerStorage("joaquinQuincena2", 0);
  const gastosJoaquin = obtenerStorage("gastosJoaquin", []);

  const totalBrisaGastado = gastosBrisa.reduce(
    (acc, gasto) => acc + Number(gasto.monto),
    0
  );

  const totalJoaquinGastado = gastosJoaquin.reduce(
    (acc, gasto) => acc + Number(gasto.monto),
    0
  );

  const ingresoTotal = sueldoBrisa + quincena1 + quincena2;
  const gastoTotal = totalBrisaGastado + totalJoaquinGastado;
  const restanteTotal = ingresoTotal - gastoTotal;

  return (
    <div>
      <h1 className="text-4xl font-bold text-slate-800 mb-8">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card title="Ingresos totales" value={`$${ingresoTotal.toLocaleString()}`} color="from-emerald-400 to-emerald-600" />
        <Card title="Gastos totales" value={`$${gastoTotal.toLocaleString()}`} color="from-rose-400 to-rose-600" />
        <Card title="Disponible total" value={`$${restanteTotal.toLocaleString()}`} color="from-indigo-400 to-indigo-600" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ResumenPersona
          titulo="Resumen Brisa"
          ingresoTexto="Sueldo"
          ingreso={sueldoBrisa}
          gastado={totalBrisaGastado}
        />

        <ResumenPersona
          titulo="Resumen Joaquín"
          ingresoTexto="Total cobrado"
          ingreso={quincena1 + quincena2}
          gastado={totalJoaquinGastado}
        />
      </div>
    </div>
  );
}

function ResumenPersona({ titulo, ingresoTexto, ingreso, gastado }) {
  return (
    <div className="bg-white rounded-3xl shadow-xl p-6">
      <h2 className="text-2xl font-bold mb-4">{titulo}</h2>

      <p className="text-slate-600 mb-2">
        {ingresoTexto}: <b>${ingreso.toLocaleString()}</b>
      </p>

      <p className="text-slate-600 mb-2">
        Gastado: <b>${gastado.toLocaleString()}</b>
      </p>

      <p className="text-emerald-600 font-bold">
        Restante: ${(ingreso - gastado).toLocaleString()}
      </p>
    </div>
  );
}

function GastosBrisa() {
  const [sueldo, setSueldo] = useState(() =>
    obtenerStorage("sueldoBrisa", 850000)
  );

  const [gastos, setGastos] = useState([]);

  const [detalle, setDetalle] = useState("");
  const [monto, setMonto] = useState("");
  const [categoria, setCategoria] = useState("Comida");

  useEffect(() => {
    localStorage.setItem("sueldoBrisa", JSON.stringify(sueldo));
  }, [sueldo]);



  useEffect(() => {
  cargarGastosBrisa();
}, []);

async function cargarGastosBrisa() {
  try {
    const data = await getGastos();

    const gastosBrisa = data.filter(
      (gasto) => gasto.persona === "Brisa"
    );

    setGastos(gastosBrisa);
  } catch (error) {
    console.log(error);
  }
}

  return (
    <PantallaGastos
      titulo="Gastos Brisa"
      ingresoLabel="Sueldo del mes"
      ingreso={sueldo}
      setIngreso={setSueldo}
      gastos={gastos}
      setGastos={setGastos}
      detalle={detalle}
      setDetalle={setDetalle}
      monto={monto}
      setMonto={setMonto}
      categoria={categoria}
      setCategoria={setCategoria}
    />
  );
}

function GastosJoaquin() {
  const [quincena1, setQuincena1] = useState(() =>
    obtenerStorage("joaquinQuincena1", 400000)
  );

  const [quincena2, setQuincena2] = useState(() =>
    obtenerStorage("joaquinQuincena2", 400000)
  );

const [gastos, setGastos] = useState([]);

  const [detalle, setDetalle] = useState("");
  const [monto, setMonto] = useState("");
  const [categoria, setCategoria] = useState("Comida");

  useEffect(() => {
    localStorage.setItem("joaquinQuincena1", JSON.stringify(quincena1));
  }, [quincena1]);

  useEffect(() => {
    localStorage.setItem("joaquinQuincena2", JSON.stringify(quincena2));
  }, [quincena2]);

  

  useEffect(() => {
  cargarGastosJoaquin();
}, []);

async function cargarGastosJoaquin() {
  try {
    const data = await getGastos();

    const gastosJoaquin = data.filter(
      (gasto) => gasto.persona === "Joaquin"
    );

    setGastos(gastosJoaquin);
  } catch (error) {
    console.log(error);
  }
}

  const sueldoTotal = quincena1 + quincena2;

async function agregarGasto(e) {
  e.preventDefault();

  if (!detalle.trim() || !monto) return;

  try {
    const nuevoGasto = {
      persona: "Joaquin",
      detalle,
      monto: Number(monto),
      categoria,
      fecha: new Date().toLocaleDateString("es-AR"),
    };

    const gastoGuardado = await crearGasto(nuevoGasto);

    setGastos([gastoGuardado, ...gastos]);

    setDetalle("");
    setMonto("");
    setCategoria("Comida");
  } catch (error) {
    console.log(error);
  }
}

  async function eliminarGasto(id) {
  try {
    await eliminarGastoDB(id);

    setGastos(
      gastos.filter((gasto) => gasto.id !== id)
    );
  } catch (error) {
    console.log(error);
  }
}

  const totalGastado = gastos.reduce(
    (acc, gasto) => acc + Number(gasto.monto),
    0
  );

  const restante = sueldoTotal - totalGastado;

  return (
    <div>
      <h1 className="text-4xl font-bold text-slate-800 mb-8">
        Gastos Joaquín
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <InputIngreso
          label="Primera quincena"
          value={quincena1}
          onChange={setQuincena1}
        />

        <InputIngreso
          label="Segunda quincena"
          value={quincena2}
          onChange={setQuincena2}
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-8">
      <CardsResumen
  ingreso={sueldoTotal}
  gastado={totalGastado}
  restante={restante}
  ingresoTitulo="Total cobrado"
/>
      </div>
      <FormularioGasto
        detalle={detalle}
        setDetalle={setDetalle}
        monto={monto}
        setMonto={setMonto}
        categoria={categoria}
        setCategoria={setCategoria}
        agregarGasto={agregarGasto}
      />

      <ListaGastos gastos={gastos} eliminarGasto={eliminarGasto} />
    </div>
  );
}

function PantallaGastos({
  titulo,
  ingresoLabel,
  ingreso,
  setIngreso,
  gastos,
  setGastos,
  detalle,
  setDetalle,
  monto,
  setMonto,
  categoria,
  setCategoria,
}) {
  const totalGastado = gastos.reduce(
    (acc, gasto) => acc + Number(gasto.monto),
    0
  );

  const restante = ingreso - totalGastado;

  function agregarGasto(e) {
    e.preventDefault();

    if (!detalle.trim() || !monto) return;

    setGastos([
      ...gastos,
      {
        detalle,
        monto: Number(monto),
        categoria,
        fecha: new Date().toLocaleDateString("es-AR"),
      },
    ]);

    setDetalle("");
    setMonto("");
    setCategoria("Comida");
  }

  function eliminarGasto(indexAEliminar) {
    setGastos(gastos.filter((_, index) => index !== indexAEliminar));
  }

  return (
    <div>
      <h1 className="text-4xl font-bold text-slate-800 mb-8">{titulo}</h1>

      <InputIngreso label={ingresoLabel} value={ingreso} onChange={setIngreso} />

      <CardsResumen ingreso={ingreso} gastado={totalGastado} restante={restante} ingresoTitulo="Sueldo" />

      <FormularioGasto
        detalle={detalle}
        setDetalle={setDetalle}
        monto={monto}
        setMonto={setMonto}
        categoria={categoria}
        setCategoria={setCategoria}
        agregarGasto={agregarGasto}
      />

      <ListaGastos gastos={gastos} eliminarGasto={eliminarGasto} />
    </div>
  );
}

function InputIngreso({ label, value, onChange }) {
  return (
    <div className="bg-white rounded-3xl shadow-xl p-6 mb-8">
      <label className="font-bold text-slate-700">{label}</label>

      <input
        type="number"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full mt-2 p-4 rounded-2xl bg-slate-100 outline-none"
      />
    </div>
  );
}

function CardsResumen({ ingreso, gastado, restante, ingresoTitulo }) {
  return (
    <div className="flex flex-col lg:flex-row gap-6 mb-8 w-full">
      <Card
        title={ingresoTitulo}
        value={`$${ingreso.toLocaleString()}`}
        color="from-emerald-400 to-emerald-600"
      />

      <Card
        title="Gastado"
        value={`$${gastado.toLocaleString()}`}
        color="from-rose-400 to-rose-600"
      />

      <Card
        title="Restante"
        value={`$${restante.toLocaleString()}`}
        color="from-indigo-400 to-indigo-600"
      />
    </div>
  );
}

function FormularioGasto({
  detalle,
  setDetalle,
  monto,
  setMonto,
  categoria,
  setCategoria,
  agregarGasto,
}) {
  return (
    <form
      onSubmit={agregarGasto}
      className="bg-white rounded-3xl shadow-xl p-6 mb-8"
    >
      <h2 className="text-2xl font-bold mb-6">Agregar gasto</h2>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <input
          type="text"
          placeholder="Detalle del gasto"
          value={detalle}
          onChange={(e) => setDetalle(e.target.value)}
          className="p-4 rounded-2xl bg-slate-100 outline-none"
        />

        <input
          type="number"
          placeholder="Monto"
          value={monto}
          onChange={(e) => setMonto(e.target.value)}
          className="p-4 rounded-2xl bg-slate-100 outline-none"
        />

        <select
          value={categoria}
          onChange={(e) => setCategoria(e.target.value)}
          className="p-4 rounded-2xl bg-slate-100 outline-none"
        >
          {categorias.map((cat) => (
            <option key={cat}>{cat}</option>
          ))}
        </select>

        <button className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-2xl font-bold hover:scale-105 transition">
          Agregar
        </button>
      </div>
    </form>
  );
}

function ListaGastos({ gastos, eliminarGasto }) {
  return (
    <div className="bg-white rounded-3xl shadow-xl p-6">
      <h2 className="text-2xl font-bold mb-6">Lista de gastos</h2>

      <div className="flex flex-col gap-4">
        {gastos.map((gasto, index) => (
          <div
            key={index}
            className="flex items-center justify-between bg-slate-100 p-4 rounded-2xl"
          >
            <div>
              <p className="font-medium">{gasto.detalle}</p>

              <span className="text-sm text-slate-500">
  {gasto.categoria || "Otros"} · {gasto.fecha || "Sin fecha"}
</span>
            </div>

            <div className="flex items-center gap-4">
              <span className="font-bold text-rose-600">
                - ${Number(gasto.monto).toLocaleString()}
              </span>

              <button
                onClick={() => eliminarGasto(gasto.id)}
                className="bg-rose-100 text-rose-600 p-2 rounded-xl hover:bg-rose-200 transition"
                title="Eliminar gasto"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ProximoMes() {
  const [ingresoEstimado, setIngresoEstimado] = useState(() =>
    obtenerStorage("ingresoEstimadoProximoMes", 0)
  );

  const [estimados, setEstimados] = useState(() =>
    obtenerStorage("gastosEstimadosProximoMes", [])
  );

  const [detalle, setDetalle] = useState("");
  const [monto, setMonto] = useState("");
  const [categoria, setCategoria] = useState("Comida");

  useEffect(() => {
    localStorage.setItem(
      "ingresoEstimadoProximoMes",
      JSON.stringify(ingresoEstimado)
    );
  }, [ingresoEstimado]);

  useEffect(() => {
    localStorage.setItem(
      "gastosEstimadosProximoMes",
      JSON.stringify(estimados)
    );
  }, [estimados]);

  const totalEstimado = estimados.reduce(
    (acc, item) => acc + Number(item.monto),
    0
  );

  const sobranteEstimado = ingresoEstimado - totalEstimado;

  function agregarEstimado(e) {
    e.preventDefault();

    if (!detalle.trim() || !monto) return;

    setEstimados([
      ...estimados,
      {
        detalle,
        monto: Number(monto),
        categoria,
        fecha: new Date().toLocaleDateString("es-AR"),
      },
    ]);

    setDetalle("");
    setMonto("");
    setCategoria("Comida");
  }

  function eliminarEstimado(indexAEliminar) {
    setEstimados(
      estimados.filter((_, index) => index !== indexAEliminar)
    );
  }

  return (
    <div>
      <h1 className="text-4xl font-bold text-slate-800 mb-8">
        Estimado Próximo Mes
      </h1>

      <InputIngreso
        label="Ingreso estimado del próximo mes"
        value={ingresoEstimado}
        onChange={setIngresoEstimado}
      />

      <CardsResumen
        ingreso={ingresoEstimado}
        gastado={totalEstimado}
        restante={sobranteEstimado}
        ingresoTitulo="Ingreso estimado"
      />

      <FormularioGasto
        detalle={detalle}
        setDetalle={setDetalle}
        monto={monto}
        setMonto={setMonto}
        categoria={categoria}
        setCategoria={setCategoria}
        agregarGasto={agregarEstimado}
      />

      <ListaGastos
        gastos={estimados}
        eliminarGasto={eliminarEstimado}
      />
    </div>
  );
}

function Vencimientos() {
  const [vencimientos, setVencimientos] = useState(() =>
    obtenerStorage("vencimientos", [])
  );

  const [detalle, setDetalle] = useState("");
  const [fecha, setFecha] = useState("");
  const [monto, setMonto] = useState("");

  useEffect(() => {
    localStorage.setItem("vencimientos", JSON.stringify(vencimientos));
  }, [vencimientos]);

  function agregarVencimiento(e) {
    e.preventDefault();

    if (!detalle.trim() || !fecha) return;

    setVencimientos([
      ...vencimientos,
      {
        detalle,
        fecha,
        monto: Number(monto) || 0,
      },
    ]);

    setDetalle("");
    setFecha("");
    setMonto("");

    if (Notification.permission === "granted") {
  new Notification("Nuevo vencimiento agregado", {
    body: `${detalle} vence el ${fecha}`,
  });
}
  }

  function eliminarVencimiento(indexAEliminar) {
    setVencimientos(
      vencimientos.filter((_, index) => index !== indexAEliminar)
    );
  }

  return (
    <div>
      <h1 className="text-3xl md:text-4xl font-bold text-slate-800 mb-8">
        Vencimientos
      </h1>
<button
  onClick={() => {
    Notification.requestPermission().then((permiso) => {
      if (permiso === "granted") {
        alert("Notificaciones activadas");
      }
    });
  }}
  className="bg-indigo-100 text-indigo-700 rounded-2xl font-bold px-6 py-4 mb-6"
>
  Activar notificaciones
</button>
      <form
        onSubmit={agregarVencimiento}
        className="bg-white rounded-3xl shadow-xl p-6 mb-8"
      >
        <h2 className="text-2xl font-bold mb-6">Agregar vencimiento</h2>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input
            type="text"
            placeholder="Ej: Alquiler"
            value={detalle}
            onChange={(e) => setDetalle(e.target.value)}
            className="p-4 rounded-2xl bg-slate-100 outline-none"
          />

          <input
            type="date"
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
            className="p-4 rounded-2xl bg-slate-100 outline-none"
          />

          <input
            type="number"
            placeholder="Monto opcional"
            value={monto}
            onChange={(e) => setMonto(e.target.value)}
            className="p-4 rounded-2xl bg-slate-100 outline-none"
          />

          <button className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-2xl font-bold py-4">
            Agregar
          </button>
        </div>
      </form>

      <div className="bg-white rounded-3xl shadow-xl p-6">
        <h2 className="text-2xl font-bold mb-6">Lista de vencimientos</h2>

        <div className="flex flex-col gap-4">
          {vencimientos.map((item, index) => (
            <div
              key={index}
              className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-100 p-4 rounded-2xl"
            >
              <div>
                <p className="font-bold">{item.detalle}</p>
                <p className="text-sm text-slate-500">
                  Vence: {item.fecha}
                </p>
              </div>

              <div className="flex items-center gap-4">
                {item.monto > 0 && (
                  <span className="font-bold text-indigo-600">
                    ${item.monto.toLocaleString()}
                  </span>
                )}

                <button
                  onClick={() => eliminarVencimiento(index)}
                  className="bg-rose-100 text-rose-600 p-2 rounded-xl"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Historial() {
  const [historial, setHistorial] = useState(() =>
    obtenerStorage("historialMensual", [])
  );

  const [mesSeleccionado, setMesSeleccionado] = useState(() => {
  const fecha = new Date();

  return fecha.toLocaleDateString("es-AR", {
    month: "long",
    year: "numeric",
  });
});


 const nombresMeses = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

const años = [];

for (let año = 2026; año <= 2035; año++) {
  años.push(año);
}

const meses = [];

años.forEach((año) => {
  nombresMeses.forEach((mes) => {
    meses.push(`${mes} ${año}`);
  });
});

  const sueldoBrisa = obtenerStorage("sueldoBrisa", 0);
  const gastosBrisa = obtenerStorage("gastosBrisa", []);
  const quincena1 = obtenerStorage("joaquinQuincena1", 0);
  const quincena2 = obtenerStorage("joaquinQuincena2", 0);
  const gastosJoaquin = obtenerStorage("gastosJoaquin", []);

  const totalBrisaGastado = gastosBrisa.reduce(
    (acc, gasto) => acc + Number(gasto.monto),
    0
  );

  const totalJoaquinGastado = gastosJoaquin.reduce(
    (acc, gasto) => acc + Number(gasto.monto),
    0
  );

  const ingresoTotal = sueldoBrisa + quincena1 + quincena2;
  const gastoTotal = totalBrisaGastado + totalJoaquinGastado;
  const restanteTotal = ingresoTotal - gastoTotal;

  useEffect(() => {
    localStorage.setItem("historialMensual", JSON.stringify(historial));
  }, [historial]);

  function guardarMesActual() {
    const nuevoRegistro = {
      mes: mesSeleccionado,
      ingresoTotal,
      gastoTotal,
      restanteTotal,
      brisa: {
        ingreso: sueldoBrisa,
        gastado: totalBrisaGastado,
        restante: sueldoBrisa - totalBrisaGastado,
      },
      joaquin: {
        ingreso: quincena1 + quincena2,
        gastado: totalJoaquinGastado,
        restante: quincena1 + quincena2 - totalJoaquinGastado,
      },
    };

    setHistorial([nuevoRegistro, ...historial]);
  }

  function eliminarRegistro(indexAEliminar) {
    setHistorial(historial.filter((_, index) => index !== indexAEliminar));
  }

  return (
    <div>
      <h1 className="text-4xl font-bold text-slate-800 mb-8">
        Historial Mensual
      </h1>

      <div className="bg-white rounded-3xl shadow-xl p-6 mb-8">
        <h2 className="text-2xl font-bold mb-4">Guardar resumen actual</h2>

        <p className="text-slate-600 mb-6">
          Esto guarda una foto del estado actual del mes para consultarlo después.
        </p>

        <label className="font-bold text-slate-700">
          Elegir mes a guardar
        </label>

        <select
          value={mesSeleccionado}
          onChange={(e) => setMesSeleccionado(e.target.value)}
          className="w-full mt-2 mb-6 p-4 rounded-2xl bg-slate-100 outline-none"
        >
          {meses.map((mes) => (
            <option key={mes}>{mes}</option>
          ))}
        </select>

        <button
          onClick={guardarMesActual}
          className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-2xl font-bold px-6 py-4 hover:scale-105 transition"
        >
          Guardar mes seleccionado
        </button>
      </div>

      <div className="flex flex-col gap-6">
        {historial.length === 0 && (
          <div className="bg-white rounded-3xl shadow-xl p-8 text-slate-500">
            Todavía no hay meses guardados.
          </div>
        )}

        {historial.map((item, index) => (
          <div key={index} className="bg-white rounded-3xl shadow-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold capitalize">{item.mes}</h2>

              <button
                onClick={() => eliminarRegistro(index)}
                className="bg-rose-100 text-rose-600 p-2 rounded-xl hover:bg-rose-200 transition"
              >
                <Trash2 size={18} />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-6">
              <Card
                title="Ingresos"
                value={`$${item.ingresoTotal.toLocaleString()}`}
                color="from-emerald-400 to-emerald-600"
              />

              <Card
                title="Gastos"
                value={`$${item.gastoTotal.toLocaleString()}`}
                color="from-rose-400 to-rose-600"
              />

              <Card
                title="Restante"
                value={`$${item.restanteTotal.toLocaleString()}`}
                color="from-indigo-400 to-indigo-600"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <ResumenPersona
                titulo="Brisa"
                ingresoTexto="Ingreso"
                ingreso={item.brisa.ingreso}
                gastado={item.brisa.gastado}
              />

              <ResumenPersona
                titulo="Joaquín"
                ingresoTexto="Ingreso"
                ingreso={item.joaquin.ingreso}
                gastado={item.joaquin.gastado}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PageTitle({ title }) {
  return (
    <div className="bg-white p-8 rounded-3xl shadow-lg">
      <h1 className="text-4xl font-bold text-slate-800">{title}</h1>
    </div>
  );
}

function Card({ title, value, color }) {
  return (
    <div
      className={`bg-gradient-to-r ${color} text-white p-6 rounded-3xl shadow-xl w-full lg:flex-1`}
    >
      <h2 className="text-lg opacity-80">{title}</h2>

      <p className="text-3xl xl:text-4xl font-bold mt-4 whitespace-nowrap">
        {value}
      </p>
    </div>
  );
}

function MenuItem({ to, icon, text }) {
  return (
    <Link
      to={to}
      className="flex items-center justify-center md:justify-start gap-2 md:gap-3 p-3 md:p-4 rounded-2xl bg-white/10 md:bg-transparent hover:bg-white/20 transition-all duration-300 text-sm md:text-base whitespace-nowrap"
    >
      {icon}
      <span className="font-medium">{text}</span>
    </Link>
  );
}
export default function App() {
  const token = localStorage.getItem("token");
  const usuario = JSON.parse(localStorage.getItem("usuario"));

  if (!token) {
    return (
      <>
        <Toaster position="top-center" />
        <Login />
      </>
    );
  }
  return (
    <BrowserRouter>
    <Toaster position="top-center" />
      <div className="flex flex-col md:flex-row min-h-screen bg-slate-100">
        <aside className="w-full md:w-72 bg-gradient-to-r md:bg-gradient-to-b from-indigo-700 via-purple-700 to-pink-600 text-white p-4 md:p-6 shadow-2xl">
<div className="bg-white/10 rounded-2xl p-3 mb-4 text-sm">
  <p className="font-bold">
    {usuario?.nombre}
  </p>

  <p className="opacity-80 text-xs">
    {usuario?.email}
  </p>

  <button
    onClick={() => {
      localStorage.removeItem("token");
      localStorage.removeItem("usuario");
      window.location.reload();
    }}
    className="mt-3 bg-white/20 hover:bg-white/30 rounded-xl px-3 py-2 text-xs font-bold"
  >
    Cerrar sesión
  </button>
</div>

  <nav className="grid grid-cols-2 gap-3 md:flex md:flex-col">
    <MenuItem to="/" icon={<Wallet size={20} />} text="Dashboard" />
    <MenuItem to="/brisa" icon={<PiggyBank size={20} />} text="Brisa" />
    <MenuItem to="/joaquin" icon={<TrendingUp size={20} />} text="Joaquín" />
    <MenuItem to="/proximo" icon={<CalendarDays size={20} />} text="Próximo" />
    <MenuItem to="/vencimientos" icon={<Bell size={20} />} text="Vence" />
    <MenuItem to="/historial" icon={<History size={20} />} text="Historial" />
  </nav>
</aside>

        <main className="flex-1 p-4 md:p-10">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/brisa" element={<GastosBrisa />} />
            <Route path="/joaquin" element={<GastosJoaquin />} />
            <Route path="/proximo" element={<ProximoMes />} />
            <Route path="/historial" element={<Historial />} />
            <Route path="/vencimientos" element={<Vencimientos />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
