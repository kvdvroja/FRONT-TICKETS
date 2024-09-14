import { AdjuntoInfo } from "../AdjuntoInfo";
export interface ResponsesU {
    Id?: string,
    codi?: string,
    breq_codi: string,
    descripcion: string,
    visto: string,
    url?: string,
    padre_codi: string,
    fechaActividad: string,
    idUsuario: string,
    imagenUsuarioR? : string,
    nombreUsuario? : string,
    adjuntosRespuesta?: AdjuntoInfo[];
  }
  