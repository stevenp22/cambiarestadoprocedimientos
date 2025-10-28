"use client";
import { useState } from "react";
import {
  buscarProcedimientos,
  cambiarEstadoProcedimientos,
  cambiarEstadoProcedimientosTramite,
} from "../lib/actions";
import { Procedimiento } from "../lib/definitions";

export default function Page() {
  const [documento, setDocumento] = useState("");
  const [procedimientos, setProcedimientos] = useState<Procedimiento[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [exito, setExito] = useState<string | null>(null);
  const [observacion, setObservacion] = useState("");

  const itemsPerPage = 6; // Mostrar 6 procedimientos inicialmente
  const [currentPage, setCurrentPage] = useState(0);
  const [displayCount, setDisplayCount] = useState(itemsPerPage);
  const currentProcedimientos = procedimientos.slice(0, displayCount);

  async function handleSearch() {
    setLoading(true);
    setError("");
    setExito(null);
    setProcedimientos([]);
    setDisplayCount(itemsPerPage); // Resetear el contador al buscar
    try {
      const resultado = await buscarProcedimientos(documento);
      console.log("Resultado de la búsqueda:", resultado);
      if (resultado?.length > 0) {
        setProcedimientos(resultado);
      } else {
        setError("No se encontraron procedimientos.");
      }
    } catch {
      setError("Error al buscar procedimientos.");
    } finally {
      setLoading(false);
    }
  }

  function handleClear() {
    setDocumento("");
    setProcedimientos([]);
    setError("");
    setExito(null);
  }

  async function handleAplicar(procedimiento: Procedimiento) {
    try {
      await cambiarEstadoProcedimientos([{ ...procedimiento, index: 0 }]);
      setExito("Procedimiento aplicado correctamente");
      const procedimientosActualizados = await buscarProcedimientos(documento);
      if (procedimientosActualizados?.length >= 0) {
        setProcedimientos(procedimientosActualizados);
      }
      setTimeout(() => setExito(null), 10000);
    } catch {
      setError("Error al aplicar el procedimiento.");
      setTimeout(() => setError(""), 10000);
    }
  }

  async function handleTramite(procedimiento: Procedimiento) {
    try {
      await cambiarEstadoProcedimientosTramite([{ ...procedimiento, index: 0 }]);
      setExito("Procedimiento puesto en trámite correctamente");
      const procedimientosActualizados = await buscarProcedimientos(documento);
      if (procedimientosActualizados?.length >= 0) {
        setProcedimientos(procedimientosActualizados);
      }
      setTimeout(() => setExito(null), 10000);
    } catch {
      setError("Error al poner el procedimiento en trámite.");
      setTimeout(() => setError(""), 10000);
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold text-blue-800 mb-6">
        Gestión de Procedimientos
      </h1>

      <div className="flex flex-col gap-4">

        {/* 📝 Cuadro de texto fijo */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg shadow-md px-6 py-4 max-w-2xl">
          <h3 className="text-lg font-semibold text-blue-800 mb-3 flex items-center">
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            Información Importante:
          </h3>
          <div className="space-y-2">
            <p className="text-blue-700 text-sm leading-relaxed">
              Antes de realizar el cambio de procedimiento, por favor asegúrese de
              que sea el correcto.
            </p>
            <p className="text-gray-600 text-sm leading-relaxed">
              En caso de error, debe realizar un ticket a sistemas incluyendo:
            </p>
            <ul className="list-disc list-inside text-gray-600 text-sm pl-2 space-y-1">
              <li>Número de documento del paciente</li>
              <li>Código del procedimiento</li>
              <li>Folio del procedimiento</li>
              <li>Estado cambiado por error</li>
              <li>Estado al que se debe cambiar</li>
              <li>Fecha de ordenado del procedimiento</li>
            </ul>
          </div>
        </div>

        {/* 🔍 Barra de búsqueda y leyenda */}
        <div className="flex items-start gap-3">
          <input
            type="text"
            placeholder="Documento del paciente..."
            value={documento}
            onChange={(e) => setDocumento(e.target.value)}
            className="border border-gray-400 rounded-lg p-2 w-64 focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
          />
          <button
            onClick={handleSearch}
            disabled={!documento}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg disabled:bg-blue-300"
          >
            Buscar
          </button>
          <button
            onClick={handleClear}
            className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg"
          >
            Limpiar
          </button>

          {/* 🎨 Leyenda */}
          <div className="bg-white border border-gray-300 rounded-lg shadow-md px-4 py-3 w-80">
            <h3 className="text-md font-semibold text-blue-700 mb-2">
              Cambiar procedimiento ordenado a:
            </h3>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-5 h-5 border border-gray-400 bg-white rounded"></div>
              <span className="text-gray-700 text-sm">En trámite (Blanco)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 bg-green-600 rounded"></div>
              <span className="text-gray-700 text-sm">Aplicado (Verde)</span>
            </div>
          </div>
        </div>
      </div>

      {/* ⚙️ Mensajes */}
      {loading && <p className="text-blue-600 font-medium">Cargando...</p>}
      {error && <p className="text-red-500">{error}</p>}
      {exito && (
        <div className="bg-green-100 border border-green-500 text-green-700 px-4 py-2 rounded mb-4">
          {exito}
        </div>
      )}

      {/* 📋 Resultados */}
      {procedimientos.length > 0 && (
        <div>
          <h2 className="text-2xl text-blue-700 font-semibold mb-4">
            Resultados de búsqueda
          </h2>
          <p className="mb-4 text-gray-700">
              Mostrando {currentProcedimientos.length} de {procedimientos.length} procedimientos
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {currentProcedimientos.map((p, idx) => (
              <div
                key={idx}
                className="bg-sky-50 hover:bg-sky-100 transition-all duration-200 shadow-lg rounded-xl border border-sky-200 p-4"
              >
                <p className="text-gray-700 mb-1">
                  Folio:{" "}
                  <span className="font-normal">{p.HISCSEC}</span>
                </p>
                <p className="text-gray-700 mb-1">
                  Código: <span className="font-normal">{p.HCPrcCod}</span>
                </p>
                <p className="text-gray-700 mb-3">
                  Fecha:{" "}
                  <span className="font-normal">
                    {new Date(p.HCFcHrOrd).toLocaleString("es-ES")}
                  </span>
                </p>

                <div className="flex justify-between">
                  <button
                    onClick={() => handleTramite(p)}
                    className="bg-white border border-gray-400 text-gray-700 px-4 py-2 rounded-lg shadow-sm hover:bg-gray-100 transition-colors"
                  >
                    En trámite
                  </button>
                  <button
                    onClick={() => handleAplicar(p)}
                    className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg text-sm"
                  >
                    Aplicar
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* ⏩ Navegación */}
          <div className="flex justify-center mt-6">
            <button
              onClick={() => setDisplayCount(prev => prev + itemsPerPage)}
              disabled={displayCount >= procedimientos.length}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg disabled:bg-blue-300 flex items-center gap-2"
            >
              Ver más
              <svg 
                className="w-4 h-4" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
