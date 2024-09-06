export interface UserDetail {
  idUsuario: string;
  nombre: string;
  apellido: string;
  pidm: string;
  nombre_completo: string;
  rols_codi: string;
  cate_codi: string;
  unid_codi?: string;
  orgn_codi?: string;
  cargo_codi?: string;
  nivel_atencion?: string;
  token: string;
}