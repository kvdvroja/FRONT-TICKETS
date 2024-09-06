import { Ticket } from "./ticket";
export interface PaginatedResponse {
    totalItems: number;
    tickets: Ticket[];
}

  