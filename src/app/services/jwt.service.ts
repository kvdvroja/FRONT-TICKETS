import { Injectable } from '@angular/core';
import * as CryptoJS from 'crypto-js';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class JwtService {

  private secretKey = environment.jwtSSOKey; // Debe estar en base64

  constructor() { }

  generarJWT(clientId: string): string {
    const header = {
      alg: 'HS256',
      typ: 'JWT'
    };
    const payload = {
      clientId,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 3600 // Expira en 1 hora
    };

    const base64Header = this.base64UrlEncode(CryptoJS.enc.Utf8.parse(JSON.stringify(header)).toString(CryptoJS.enc.Base64));
    const base64Payload = this.base64UrlEncode(CryptoJS.enc.Utf8.parse(JSON.stringify(payload)).toString(CryptoJS.enc.Base64));

    // Crear la firma usando HMAC SHA-256
    const keyBytes = CryptoJS.enc.Base64.parse(this.secretKey);
    const signature = CryptoJS.HmacSHA256(`${base64Header}.${base64Payload}`, keyBytes);
    const base64Signature = this.base64UrlEncode(signature.toString(CryptoJS.enc.Base64));

    const token = `${base64Header}.${base64Payload}.${base64Signature}`;
    //console.log("Token generado:", token);
    return token;
  }

  private base64UrlEncode(base64: string): string {
    return base64.replace(/=+$/, '').replace(/\+/g, '-').replace(/\//g, '_');
  }
}