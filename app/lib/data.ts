import sql from "mssql";
import mysql from "mysql2/promise";
import { User } from "./definitions";

const sqlConfig = {
  user: process.env.SQL_USERNAME || "",
  password: process.env.SQL_PASSWORD || "",
  server: process.env.SQL_HOST || "",
  port: Number(process.env.SQL_PORT || 1433),
  database: process.env.SQL_DATABASE || "",
  options: {
    encrypt: false,
  },
};

const mySqlConfig = {
  user: process.env.MYSQL_USERNAME || "",
  password: process.env.MYSQL_PASSWORD || "",
  host: process.env.MYSQL_HOST || "",
  port: Number(process.env.MYSQL_PORT || 3306),
  database: process.env.MYSQL_DATABASE || "",
};

let connectionPool: sql.ConnectionPool | null = null;

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

export async function usuario(documento: string): Promise<User | undefined> {
  const connection = await mysql.createConnection(mySqlConfig);
  try {
    const [results] = await connection.query(
      "SELECT * FROM Usuarios WHERE documento = ?",
      [documento]
    );
    const resultados = results as User[];
    return resultados[0];
  } catch (error) {
    console.error("Failed to fetch users:", error);
    throw new Error("Failed to fetch users.");
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

export async function buscarProcedimientosDB(documento: string) {
  try {
    await initializeDBConnection();
    const resultado = await sql.query`select HISCSEC, HCPrcCod, HCPrcEst, HCFcHrOrd from HCCOM51 where HISCKEY = ${documento} and HCPrcEst = 'O'`;
    return resultado.recordset ?? [];
  } catch (error) {
    console.error("Error al conectar con SQLServer", error);
    throw error;
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
    return { success: true };
  } catch (error) {
    console.error("Error al conectar con SQLServer", error);
    throw error;
  } finally {
    if (connectionPool) {
      await connectionPool.close();
      connectionPool = null;
    }
  }
}

export async function cambiarEstadoProcedimientosTramiteDB(
  HISCSEC: string,
  HCPrcCod: string,
  HCFcHrOrd: string,
  horaActual: string
) {
  try {
    await initializeDBConnection();
    await sql.query`update HCCOM51 set HCPrcEst = 'E', HCFcHrAp = ${horaActual} where HISCSEC = ${HISCSEC} and HCPrcCod = ${HCPrcCod} and HCFcHrOrd = ${HCFcHrOrd}`;
    return { success: true };
  } catch (error) {
    console.error("Error al conectar con SQLServer", error);
    throw error;
  } finally {
    if (connectionPool) {
      await connectionPool.close();
      connectionPool = null;
    }
  }
}
