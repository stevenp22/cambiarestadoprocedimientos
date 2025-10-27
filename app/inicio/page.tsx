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

  const itemsPerPage = 10;
  const [currentPage, setCurrentPage] = useState(0);
  const currentProcedimientos = procedimientos.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage
  );

  async function handleSearch() {
    setLoading(true);
    setError("");
    setExito(null);
    setProcedimientos([]);
    try {
      const resultado = await buscarProcedimientos(documento);
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

{/* 🔍 Buscador + leyenda al lado derecho */}
      <div className="flex items-start mb-6">
        {/* Buscador y leyenda en línea */}
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
          <div className="flex justify-between mt-6">
            <button
              onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
              disabled={currentPage === 0}
              className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded-lg disabled:bg-gray-300"
            >
              Anterior
            </button>
            <button
              onClick={() =>
                setCurrentPage((p) =>
                  (p + 1) * itemsPerPage < procedimientos.length ? p + 1 : p
                )
              }
              disabled={(currentPage + 1) * itemsPerPage >= procedimientos.length}
              className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded-lg disabled:bg-gray-300"
            >
              Siguiente
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
