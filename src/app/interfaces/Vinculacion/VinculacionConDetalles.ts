import { Ticket } from "../ticket";
import { Vinculacion } from "./Vinculacion";

export interface VinculacionConDetalles extends Vinculacion {
    ticket: Ticket;
  }
  