import { Usuarios } from "../usersUPAO/usuarios";
export interface ConfigUsuario {
    id: string;
    codi: string;
    pidm: string;
    idUsuario: string;
    rols_codi: string;
    fechaActividad: string;
    fechaVigencia: string;
    ind_estado: string;
    unid_codi: string;
    password: string;
    imagen?: string; 
}

export interface ExtendedConfigUsuario extends ConfigUsuario {
    userData?: Usuarios;  // This should not be an array
    userEstado?: string;
}

export interface ConfigFull {
    idUsuario : string;  // This should not be an array
    nombreUsuario: string;
    codi: string,
    fotoUsuario: string,
    unid_codi: string
}
