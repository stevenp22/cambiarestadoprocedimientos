"use server";
import { signIn } from "@/auth"; // Importa la función signIn desde el módulo de autenticación
import { AuthError } from "next-auth"; // Importa la clase AuthError desde next-auth
import {
  buscarProcedimientosDB,
  usuario,
  cambiarEstadoProcedimientosDB,
} from "./data"; // Importa las funciones buscarProcedimientosDB, usuario y cambiarEstado desde el módulo de datos
import { ProcedimientoWithIndex } from "../lib/definitions"; // Importa la definición de tipo ProcedimientoWithIndex desde el módulo de definiciones

// Función para autenticar al usuario
export async function authenticate(
  prevState: string | undefined, // Estado previo de la autenticación
  formData: FormData // Datos del formulario de autenticación
) {
  try {
    await signIn("credentials", formData); // Intenta iniciar sesión con las credenciales proporcionadas
  } catch (error) {
    if (error instanceof AuthError) {
      // Si ocurre un error de autenticación
      switch (error.type) {
        case "CredentialsSignin":
          return "Invalid credentials."; // Retorna un mensaje de error si las credenciales son inválidas
        default:
          return "Something went wrong."; // Retorna un mensaje de error genérico para otros tipos de errores
      }
    }
    throw error; // Lanza el error si no es un AuthError
  }
}

// Función para buscar un usuario por su documento
export async function buscarUsuario(documento: string) {
  try {
    const resultado = await usuario(documento); // Busca el usuario en la base de datos
    console.log("Resultado de la busqueda de usuarios", resultado); // Imprime el resultado en la consola
    return resultado; // Retorna el resultado de la búsqueda
  } catch (error) {
    console.log("Error al buscar usuario", error); // Imprime el error en la consola
  }
}

// Función para buscar procedimientos por documento
export async function buscarProcedimientos(documento: string) {
  try {
    const resultado = await buscarProcedimientosDB(documento); // Busca los procedimientos en la base de datos
    console.log("Resultado de la busqueda de procedimientos", resultado); // Imprime el resultado en la consola
    return resultado; // Retorna el resultado de la búsqueda
  } catch (error) {
    console.log("Error al buscar procedimientos", error); // Imprime el error en la consola
  }
}

// Función para cambiar el estado de un procedimiento
export async function cambiarEstadoProcedimientos(
  procedimientos: ProcedimientoWithIndex[] // Array de procedimientos a actualizar
) {
  try {
    procedimientos.forEach((procedimiento) => {
      const horaActual = new Date(); // Obtiene la fecha y hora actual
      const horaActualString = `${horaActual.getFullYear()}-${String(
        horaActual.getMonth() + 1
      ).padStart(2, "0")}-${String(horaActual.getDate()).padStart(
        2,
        "0"
      )} ${String(horaActual.getHours()).padStart(2, "0")}:${String(
        horaActual.getMinutes()
      ).padStart(2, "0")}:${String(horaActual.getSeconds()).padStart(2, "0")}`; // Formato 'YYYY-MM-DD HH:mm:ss'

      console.log("Hora actual", horaActualString); // Imprime la hora actual en la consola
      cambiarEstadoProcedimientosDB(
        procedimiento.HISCSEC,
        procedimiento.HCPrcCod,
        procedimiento.HCFcHrOrd,
        horaActualString
      ); // Cambia el estado de cada procedimiento en la base de datos
      console.log("Procedimiento actualizado", procedimiento); // Imprime el procedimiento actualizado en la consola
    });
  } catch (error) {
    console.log("Error al cambiar el estado del procedimiento", error); // Imprime el error en la consola
  }
}
