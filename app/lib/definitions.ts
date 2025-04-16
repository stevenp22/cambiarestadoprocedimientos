export type User = {
    id: string;
    documento: string;
    contraseña: string;
  };

  export type Procedimiento = {
    HISCSEC: string;
    HCPrcCod: string;
    HCPrcEst: string;
    HCFcHrOrd: string;
  }

  export type ProcedimientoWithIndex = {
    index: number;
    HISCSEC: string;
    HCPrcCod: string;
    HCPrcEst: string;
    HCFcHrOrd: string;
  }