import { AdjuntoInfo } from "../AdjuntoInfo";
export interface Responses {
    Id?: string,
    codi?: string,
    breq_codi: string,
    descripcion: string,
    url?: string,
    padre_codi: string,
    fechaActividad: string,
    idUsuario: string,
    imagenUsuarioR? : string,
    nombreUsuario? : string,
    adjuntosRespuesta?: AdjuntoInfo[];
  }
  