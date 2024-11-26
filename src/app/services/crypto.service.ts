import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import * as CryptoJS from 'crypto-js';
@Injectable({
  providedIn: 'root'
})
export class CryptoService {
  private key = CryptoJS.enc.Utf8.parse(environment.cryptoKey);
  private iv = CryptoJS.enc.Utf8.parse(environment.cryptoIv);
  decrypt(value: string): string {
    const decrypted = CryptoJS.AES.decrypt(value, this.key, {
      keySize: 128 / 8,
      iv: this.iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
      format: CryptoJS.format.Hex
    });
    return CryptoJS.enc.Utf8.stringify(decrypted);
  }
  encrypt(value: string): string {
    const encrypted = CryptoJS.AES.encrypt(value, this.key, {
      iv: this.iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
      format: CryptoJS.format.Hex
    });
    return encrypted.toString();
  }
}