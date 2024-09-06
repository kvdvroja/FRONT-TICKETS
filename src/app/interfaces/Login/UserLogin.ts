export interface UserLogin {
  id: string;
  codi: string;
  pidm: string;
  idUsuario: string;
  rols_codi: string;
  fechaActividad: string;
  fechaVigencia: string;
  ind_estado: string;
  unid_codi: string;
  email: string;
  password?: string;// Solo si es necesario enviarlo para la autenticación, no para recibirlo
}
