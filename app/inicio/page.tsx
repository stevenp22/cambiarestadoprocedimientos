"use client"; // Indica que este archivo es un componente cliente en Next.js.
import { useState } from "react"; // Importa el hook useState para manejar estados en el componente.
import {
  buscarProcedimientos,
  cambiarEstadoProcedimientos,
} from "../lib/actions"; // Importa la función para buscar procedimientos desde una librería externa.
import { Procedimiento, ProcedimientoWithIndex } from "../lib/definitions"; // Importa las definiciones de tipos para procedimientos.

export default function Page() {
  // Define el componente principal de la página.
  const [documento, setDocumento] = useState(""); // Estado para almacenar el documento ingresado por el usuario.
  const [procedimientos, setProcedimientos] = useState<Procedimiento[]>([]); // Estado para almacenar los procedimientos obtenidos.
  const [error, setError] = useState(""); // Estado para manejar mensajes de error.
  const [loading, setLoading] = useState(false); // Estado para indicar si se está cargando información.
  const [procedimientosSeleccionados, setProcedimientosSeleccionados] =
    useState<ProcedimientoWithIndex[]>([]); // Estado para almacenar los procedimientos seleccionados.
  const [currentPage, setCurrentPage] = useState(0); // Estado para manejar la página actual en la paginación.
  const [exito, setExito] = useState(false); // Estado para manejar mensajes de éxito.

  const itemsPerPage = 10; // Número de procedimientos que se mostrarán por página.

  // Función para buscar procedimientos basados en el documento ingresado.
  function handleSearch() {
    setLoading(true); // Activa el estado de carga.
    setExito(false); // Limpia el estado de éxito.
    setError(""); // Limpia cualquier mensaje de error.
    setProcedimientos([]); // Limpia los procedimientos obtenidos.
    setCurrentPage(0); // Reinicia la página actual a la primera.
    setProcedimientosSeleccionados([]); // Limpia los procedimientos seleccionados.
    buscarProcedimientos(documento) // Llama a la función para buscar procedimientos.
      .then((resultado) => {
        setExito(false); // Limpia el estado de éxito.
        if (resultado) {
          // Si se obtienen resultados...
          setProcedimientos(resultado); // Actualiza el estado con los procedimientos obtenidos.
          setError(""); // Limpia cualquier mensaje de error.
        } else {
          // Si no hay resultados...
          setError("No se encontraron procedimientos."); // Muestra un mensaje de error.
        }
      })
      .catch((error) => {
        // Maneja errores en la búsqueda.
        console.error("Error al buscar procedimientos:", error); // Muestra el error en la consola.
      })
      .finally(() => {
        // Ejecuta esto al finalizar la búsqueda, sin importar si tuvo éxito o no.
        setLoading(false); // Desactiva el estado de carga.
        if (procedimientos.length === 0) {
          // Si no hay procedimientos...
          setError("No se encontraron procedimientos."); // Muestra un mensaje de error.
        }
      });
  }

  // Función para limpiar los resultados y reiniciar los estados.
  function handleClear() {
    setProcedimientos([]); // Limpia los procedimientos.
    setError(""); // Limpia los mensajes de error.
    setDocumento(""); // Limpia el documento ingresado.
    setCurrentPage(0); // Reinicia la página actual a la primera.
    setLoading(false); // Desactiva el estado de carga.
    setProcedimientosSeleccionados([]); // Limpia los procedimientos seleccionados.
    setExito(false); // Limpia el estado de éxito.
  }

  // Función para manejar el cambio de estado de los checkboxes.
  function handleCheckboxChange(
    event: React.ChangeEvent<HTMLInputElement>, // Evento del checkbox.
    index: number // Índice del procedimiento en la lista.
  ) {
    if (event.target.checked) {
      // Si el checkbox se selecciona...
      setProcedimientosSeleccionados((prev) => [
        ...prev, // Mantiene los procedimientos seleccionados previamente.
        { ...procedimientos[index], index }, // Agrega el nuevo procedimiento seleccionado.
      ]);
    } else {
      // Si el checkbox se deselecciona...
      setProcedimientosSeleccionados(
        (prev) => prev.filter((item) => item.index !== index) // Elimina el procedimiento deseleccionado.
      );
    }
    console.log("Procedimientos seleccionados:", procedimientosSeleccionados); // Muestra los procedimientos seleccionados en la consola.
  }

  // Función para cambiar de página en la paginación.
  function changePage(direction: "next" | "prev") {
    if (
      direction === "next" && // Si se quiere avanzar a la siguiente página...
      (currentPage + 1) * itemsPerPage < procedimientos.length // Y hay más procedimientos disponibles...
    ) {
      setCurrentPage(currentPage + 1); // Avanza a la siguiente página.
    } else if (direction === "prev" && currentPage > 0) {
      // Si se quiere retroceder y no está en la primera página...
      setCurrentPage(currentPage - 1); // Retrocede a la página anterior.
    }
  }

  // Obtiene los procedimientos que se mostrarán en la página actual.
  const currentProcedimientos = procedimientos.slice(
    currentPage * itemsPerPage, // Índice inicial basado en la página actual.
    (currentPage + 1) * itemsPerPage // Índice final basado en la página actual.
  );

  const handleAplicarProcedimientos = () => {
    // Función para aplicar los procedimientos seleccionados.
    cambiarEstadoProcedimientos(procedimientosSeleccionados) // Llama a la función para cambiar el estado de los procedimientos seleccionados.
      .then((response) => {
        console.log("Procedimientos aplicados:", response); // Muestra la respuesta en la consola.
      })
      .catch((error) => {
        console.error("Error al aplicar procedimientos:", error); // Maneja errores al aplicar procedimientos.
      })
      .finally(() => {
        setProcedimientosSeleccionados([]); // Limpia los procedimientos seleccionados después de aplicar.
        setExito(true); // Muestra un mensaje de éxito.
      });
  };

  return (
    <div className="items-center justify-top h-screen bg-gray-100 pl-3 pt-3 pr-3">
      {/* Contenedor principal de la página */}
      {/* Título de la página */}
      <h1 className="text-2xl text-black font-bold mb-4">
        Buscar Procedimientos
      </h1>
      {/* Campo de entrada para el documento */}
      <input
        type="text"
        placeholder="Ingrese el documento del paciente"
        className="border border-black rounded p-2 mb-4 w-1/3 placeholder:text-black text-black"
        value={documento} // Valor actual del documento.
        onChange={(e) => setDocumento(e.target.value)} // Actualiza el estado al cambiar el valor.
        required
        autoComplete="off"
      />
      {/* Botón para buscar procedimientos */}
      <button
        type="submit"
        className="bg-blue-500 text-white rounded p-2 hover:bg-blue-600 ml-3"
        onClick={handleSearch} // Llama a la función de búsqueda.
        disabled={!documento} // Desactiva el botón si no hay un documento ingresado.
      >
        Buscar
      </button>
      {/* Botón para limpiar resultados */}
      <button
        className="bg-red-500 text-white rounded p-2 hover:bg-red-600 ml-3"
        onClick={handleClear} // Llama a la función para limpiar resultados.
      >
        Limpiar Resultados
      </button>
      {/* Mensaje de carga */}
      {loading && !exito && <p className="text-black">Cargando...</p>}
      {/* Mensaje de error si no hay procedimientos */}
      {procedimientos.length === 0 && error && (
        <p className="text-red-500">{error}</p>
      )}
      {/* Tabla de resultados si hay procedimientos */}
      {procedimientos.length > 0 && !exito && (
        <div className="mt-4">
          <h2 className="text-xl text-black font-bold mb-2">
            Resultados de la búsqueda:
          </h2>
          <table className="table-auto border-collapse border border-gray-400 w-full">
            <thead>
              <tr className="bg-blue-600 text-white">
                <th className="border border-gray-400 px-4 py-2">Folio</th>
                <th className="border border-gray-400 px-4 py-2">Código</th>
                <th className="border border-gray-400 px-4 py-2">Fecha</th>
                <th className="border border-gray-400 px-4 py-2">Acción</th>
              </tr>
            </thead>
            <tbody>
              {currentProcedimientos.map((procedimiento, index) => (
                <tr
                  key={index} // Clave única para cada fila.
                  className={index % 2 === 0 ? "bg-blue-100" : "bg-blue-200"} // Alterna el color de fondo de las filas.
                >
                  <td className="border border-gray-400 text-black px-4 py-2">
                    {procedimiento.HISCSEC}{" "}
                    {/* Muestra el folio del procedimiento */}
                  </td>
                  <td className="border border-gray-400 text-black px-4 py-2">
                    {procedimiento.HCPrcCod}{" "}
                    {/* Muestra el código del procedimiento */}
                  </td>
                  <td className="border border-gray-400 text-black px-4 py-2">
                    {new Date(procedimiento.HCFcHrOrd).toLocaleString("es-ES", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}{" "}
                    {/* Formatea y muestra la fecha */}
                  </td>
                  <td className="border border-gray-400 text-black px-4 py-2">
                    <input
                      type="checkbox" // Checkbox para seleccionar el procedimiento.
                      onChange={(e) =>
                        handleCheckboxChange(
                          e,
                          currentPage * itemsPerPage + index // Calcula el índice global del procedimiento.
                        )
                      }
                      checked={procedimientosSeleccionados.some(
                        (item) =>
                          item.index === currentPage * itemsPerPage + index // Verifica si el procedimiento está seleccionado.
                      )}
                    />
                    {/* Checkbox para seleccionar el procedimiento */}
                    <label className="ml-2 text-black">
                      Seleccionar para aplicar
                      {/* Etiqueta para el checkbox */}
                    </label>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {/* Botones de paginación */}
          <div className="flex justify-between mt-4">
            <button
              className="bg-gray-500 text-white rounded p-2 hover:bg-gray-600"
              onClick={() => changePage("prev")} // Cambia a la página anterior.
              disabled={currentPage === 0} // Desactiva si está en la primera página.
            >
              Anterior
            </button>
            <button
              className="bg-green-500 text-white rounded p-2 hover:bg-green-600"
              onClick={handleAplicarProcedimientos} // Llama a la función para cambiar el estado de los procedimientos seleccionados.
              disabled={procedimientosSeleccionados.length === 0} // Desactiva si no hay procedimientos seleccionados.
            >
              {" "}
              Aplicar Procedimientos
            </button>
            <button
              className="bg-gray-500 text-white rounded p-2 hover:bg-gray-600"
              onClick={() => changePage("next")} // Cambia a la página siguiente.
              disabled={
                (currentPage + 1) * itemsPerPage >= procedimientos.length // Desactiva si no hay más páginas.
              }
            >
              Siguiente
            </button>
          </div>
        </div>
      )}
      {/* Mensaje de éxito si se aplicaron procedimientos */}
      {exito && (
        <div className="mt-4 bg-green-200 text-green-800 p-4 rounded">
          Procedimientos aplicados exitosamente.
        </div>
      )}
    </div>
  );
}
