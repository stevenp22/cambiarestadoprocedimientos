"use server";
import { signIn } from "@/auth"; // Ajusta la ruta según la ubicación de tu módulo de autenticación
import { AuthError } from "next-auth";  // Asegúrate de tener esta importación correcta
import {
  buscarProcedimientosDB, // Importa la función para buscar procedimientos en la base de datos
  usuario, // Importa la función para buscar usuarios en la base de datos
  cambiarEstadoProcedimientosDB, // Importa la función para cambiar el estado de los procedimientos en la base de datos
  cambiarEstadoProcedimientosTramiteDB, // Importa la función para poner en trámite los procedimientos en la base de datos
} from "./data"; // Ajusta la ruta según la ubicación del archivo data.ts
import { ProcedimientoWithIndex } from "./definitions"; // Importa la definición del tipo ProcedimientoWithIndex

// Función para autenticar al usuario (Server Action)
export async function authenticate(
  prevState: string | undefined, // Evita el warning de variable no usada
  formData: FormData // Recibe el FormData del cliente
) {
  try {
    await signIn("credentials", formData); // Llama a la función signIn con el proveedor "credentials"
  } catch (error) {
    // Manejo de errores de autenticación
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return "Invalid credentials."; // Credenciales inválidas
        default:
          return "Something went wrong."; // Retorna un mensaje de error genérico
      }
    }
    throw error; // Lanza cualquier otro error no manejado
  }
}

// Buscar usuario por documento
export async function buscarUsuario(documento: string) {
  try {
    const resultado = await usuario(documento); // Llama a la función usuario para buscar el usuario en la base de datos
    console.log("Resultado de la busqueda de usuarios", resultado); //Imprime el resultado en la consola
    return resultado; // Devuelve el resultado (puede ser undefined si no se encuentra el usuario)
  } catch (error) {
    console.error("Error al buscar usuario", error); // Imprime el error en la consola
    throw error;
  }
}

// Buscar procedimientos por documento
export async function buscarProcedimientos(documento: string) {
  try {
    const resultado = await buscarProcedimientosDB(documento); // Llama a la función buscarProcedimientosDB para buscar los procedimientos en la base de datos
    console.log("Resultado de la busqueda de procedimientos", resultado); //Imprime el resultado en la consola
    return resultado ?? []; // Devuelve el resultado o un arreglo vacío si no hay resultados
  } catch (error) {
    console.error("Error al buscar procedimientos", error);
    // devolver arreglo vacío para evitar undefined en el cliente
    return [];
  }
}

// Cambiar estado de procedimientos (recibe array de ProcedimientoWithIndex)
export async function cambiarEstadoProcedimientos(
  procedimientos: ProcedimientoWithIndex[] // Recibe un arreglo de procedimientos con índice
) {
  try {
    // iteramos de forma síncrona (si DB espera múltiples updates, podrías usar Promise.all)
    for (const procedimiento of procedimientos) { // Recorre cada procedimiento en el arreglo
      const horaActual = new Date(); // Obtiene la hora actual
      const horaActualString = `${horaActual.getFullYear()}-${String( // Formatea la fecha y hora actual en formato YYYY-MM-DD HH:MM:SS
        horaActual.getMonth() + 1
      ).padStart(2, "0")}-${String(horaActual.getDate()).padStart( 
        2,
        "0"
      )} ${String(horaActual.getHours()).padStart(2, "0")}:${String( 
        horaActual.getMinutes()
      ).padStart(2, "0")}:${String(horaActual.getSeconds()).padStart(2, "0")}`;

      console.log("Hora actual", horaActualString);

      // Asegúrate que cambiarEstadoProcedimientosDB devuelva una promesa
      await cambiarEstadoProcedimientosDB(
        procedimiento.HISCSEC,
        procedimiento.HCPrcCod,
        procedimiento.HCFcHrOrd,
        horaActualString
      );

      console.log("Procedimiento actualizado", procedimiento); // Imprime en la consola que el procedimiento ha sido actualizado
    }
    return { success: true };
  } catch (error) {
    console.error("Error al cambiar el estado del procedimiento", error); // Imprime el error en la consola
    throw error;
  }
}

// Poner en trámite procedimientos (recibe array de ProcedimientoWithIndex)
export async function cambiarEstadoProcedimientosTramite(
  procedimientos: ProcedimientoWithIndex[] // Recibe un arreglo de procedimientos con índice
) {
  try {
    // iteramos de forma síncrona (si DB espera múltiples updates, podrías usar Promise.all)
    for (const procedimiento of procedimientos) { // Recorre cada procedimiento en el arreglo
      const horaActual = new Date(); // Obtiene la hora actual
      const horaActualString = `${horaActual.getFullYear()}-${String( // Formatea la fecha y hora actual en formato YYYY-MM-DD HH:MM:SS
        horaActual.getMonth() + 1
      ).padStart(2, "0")}-${String(horaActual.getDate()).padStart( 
        2,
        "0"
      )} ${String(horaActual.getHours()).padStart(2, "0")}:${String( 
        horaActual.getMinutes()
      ).padStart(2, "0")}:${String(horaActual.getSeconds()).padStart(2, "0")}`;

      console.log("Hora actual", horaActualString);

      await cambiarEstadoProcedimientosTramiteDB(
        procedimiento.HISCSEC,
        procedimiento.HCPrcCod,
        procedimiento.HCFcHrOrd,
        horaActualString
      );

      console.log("Procedimiento actualizado", procedimiento);
    }
    return { success: true };
  } catch (error) {
    console.error("Error al cambiar el estado del procedimiento", error);
    throw error;
  }
}

