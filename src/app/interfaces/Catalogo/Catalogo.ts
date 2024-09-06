export interface Catalogo {
    id?: string;
    codi: string;
    nombre: string;
    padre: string;
    ind_estado: string;
    fechaActividad: string;
    idUsuario: string;
    children?: Catalogo[];
  }