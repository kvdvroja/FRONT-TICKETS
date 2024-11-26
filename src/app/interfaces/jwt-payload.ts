export class JwtPayload {
    sub: string;
    client_id: string;
    constructor(sub: string, client_id: string) {
      this.sub = sub;
      this.client_id = client_id;
    }
}