import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiSSOService {

  private urlApiSSO1 = "http://localhost:7681/Token";
  private urlApiSSO2 = "http://localhost:7681/Account/Login?";

  constructor(private http: HttpClient) { }

  public postSSOToken(parametros: any): Observable<any> {
    const headers = new HttpHeaders({
      'Content-type': 'application/json'

    });
    return this.http.post(this.urlApiSSO1, parametros, { headers });
  }

  public getSSO(url: string): Observable<any> {
    const urlWithCod = `${this.urlApiSSO2}${url}`;
    return this.http.get<any>(urlWithCod);
  }

}
