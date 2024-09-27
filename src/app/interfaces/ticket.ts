import { AdjuntoInfo } from "./AdjuntoInfo";

export interface Ticket {
    id?: string,
    ticketID: string,
    unidCodi: string,
    idUsuario: string,
    nombre: string,
    asunto: string,
    descripcion: string,
    organizacion: string,
    tipologia: string,
    viaRecepcion: string,
    prioridad: string;
    idUsuarioAdd: string,
    fechaActividad: string,
    fechaCierre: string,
    fechaCreacion: string,
    catalogo: string,
    mensaje_final: string,
    estado: string,
    urlImagenUsuario?: string,
    url_adjunto: string,
    ind_estado_adjunto: string,
    idUsuario_adjunto: string
    breq_codi_asignar?: string,
    cate_codi_asignar: string[],
    idUsuario_asignar: string,
    cantidadAdjuntos?: number,
    tieneAdjuntos?: boolean,
    fechaCreacionFormatted?: string,
    adjuntos: AdjuntoInfo[],
    selected?: boolean,
    PrioridadImagen?: string;
    PrioridadDescripcion?: string;
    ubicacion?: string;
    mostrarIconoParpadeante?: boolean;
  }
  