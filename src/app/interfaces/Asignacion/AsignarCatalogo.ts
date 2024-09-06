export interface AsignarCatalogo {
    id?: string;
    codi: string;
    cata_codi: string;
    usun_codi: string;
    fechaActividad: string;
    idUsuario: string;
    estado : string;
  }

  export interface AsignarCatalogoFull {
    id?: string;
    codi: string;
    cata_codi: string;
    cata_name: string;
    usun_codi: string;
    usun_name: string;
    fechaActividad: string;
    idUsuario: string;
    estado : string;
  }
  