import sql from "mssql"; // Importa el módulo mssql para manejar conexiones a SQL Server
import mysql from "mysql2/promise"; // Importa el módulo mysql2/promise para manejar conexiones a MySQL de manera asíncrona
import { User } from "./definitions"; // Importa las definiciones de tipos Trabajador y User

const sqlConfig = {
  user: process.env.SQL_USERNAME || "",
  password: process.env.SQL_PASSWORD || "",
  server: process.env.SQL_HOST || "",
  port: parseInt(process.env.SQL_PORT || ""),
  database: process.env.SQL_DATABASE || "",
  options: {
    encrypt: false,
  },
};

// Configuración de la conexión a MySQL utilizando variables de entorno
const mySqlConfig = {
  user: process.env.MYSQL_USERNAME || "", // Usuario de la base de datos
  password: process.env.MYSQL_PASSWORD || "", // Contraseña de la base de datos
  host: process.env.MYSQL_HOST || "", // Host de la base de datos
  port: parseInt(process.env.MYSQL_PORT || ""), // Puerto de la base de datos
  database: process.env.MYSQL_DATABASE || "", // Nombre de la base de datos
};

let connectionPool: sql.ConnectionPool | null = null; // Inicializa la conexión a SQL Server como nula
async function initializeDBConnection() {
  try {
    if (!connectionPool) {
      connectionPool = await sql.connect(sqlConfig);
      console.log("Database connection established successfully");
    }
    return connectionPool;
  } catch (err) {
    console.error("Error establishing database connection:", err);
    throw err;
  }
}

// Función para obtener un usuario por su documento
export async function usuario(documento: string): Promise<User | undefined> {
  const connection = await mysql.createConnection(mySqlConfig); // Crea una conexión a la base de datos
  try {
    const [results] = await connection.query(
      "SELECT * FROM Usuarios WHERE documento = ?",
      [documento]
    ); // Ejecuta la consulta para obtener el usuario por documento
    const resultados = results as User[]; // Convierte los resultados a un array de User
    return resultados[0]; // Retorna el primer usuario encontrado
  } catch (error) {
    console.error("Failed to fetch users:", error); // Muestra un error en la consola si la consulta falla
    throw new Error("Failed to fetch users."); // Lanza un error
  } finally {
    if (connection) {
      await connection.end(); // Cierra la conexión a la base de datos
    }
  }
}

export async function buscarProcedimientosDB(documento: string) {
  try {
    await initializeDBConnection();
    const resultado =
      await sql.query`select HISCSEC, HCPrcCod, HCPrcEst, HCFcHrOrd from HCCOM51 where HISCKEY = ${documento} and HCPrcEst = 'O'`;
    return resultado.recordset;
  } catch (error) {
    console.log("Error al conectar con SQLServer", error);
  } finally {
    if (connectionPool) {
      await connectionPool.close();
      connectionPool = null;
    }
  }
}

export async function cambiarEstadoProcedimientosDB(
  HISCSEC: string,
  HCPrcCod: string,
  HCFcHrOrd: string,
  horaActual: string
) {
  try {
    await initializeDBConnection();
    await sql.query`update HCCOM51 set HCPrcEst = 'A', HCFcHrAp = ${horaActual} where HISCSEC = ${HISCSEC} and HCPrcCod = ${HCPrcCod} and HCFcHrOrd = ${HCFcHrOrd}`;
  } catch (error) {
    console.log("Error al conectar con SQLServer", error);
  } finally {
    if (connectionPool) {
      await connectionPool.close();
      connectionPool = null;
    }
  }
}
