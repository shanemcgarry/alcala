import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { HandleError, HttpErrorHandler } from './http-error-handler.service';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { LocalStorageService } from 'ngx-store';

@Injectable({
  providedIn: 'root'
})
export class SiteService {
  serviceUrl: string;
  private handleError: HandleError;

  constructor(private httpClient: HttpClient, private httpError: HttpErrorHandler, private localStorage: LocalStorageService) {
    this.serviceUrl = environment.apiUrl;
    this.handleError = httpError.createHandleError('SiteService');
  }

  private getColourPaletteFromServer(numColours: number): Observable<any[]> {
    return this.httpClient.get<any[]>(`${this.serviceUrl}colour_palette/${numColours}`)
      .pipe(
        catchError(this.handleError('Get Colour Palette', null))
      );
  }

  getColourPalette(numColours: number): any[] {
    const key = `cPalette[${numColours}]`
    let palette = this.localStorage.get(key);
    if (!palette) {
      palette = this.calculateColourPalette(3, false);
    }

    return palette;
  }

  clearCache() {
    this.localStorage.clear();
  }

  private calculateColourPalette(numItems: number, useRandomSL: boolean): any[] {
    const diff = Math.round(360 / numItems );
    const baseHSL = [0, 18, 28];
    let newHue = baseHSL[0],
        newSaturation = baseHSL[1],
        newLightness = baseHSL[2],
        i = 1;

    const results = [];
    results.push({'index': 0, 'hex': this.hslToHex(newHue, newSaturation, newLightness)});
    while (i < numItems) {
      newHue += diff;
      if (newHue > 359) {
        newHue = 0 + this.getRandomNumber(15);
      }

      if (useRandomSL) {
        newSaturation += baseHSL[1] + Math.round(baseHSL[1] * (diff / 100));
        if (newSaturation > 100) {
          newSaturation = 1 + this.getRandomNumber(25);
        }

        newLightness += baseHSL[2] + Math.round(baseHSL[2] * (diff / 100));
        if (newLightness > 90) {
          newLightness = 10 + this.getRandomNumber(40);
        }
      }

      results.push({'index': i, 'hex': this.hslToHex(newHue, newSaturation, newLightness)});
      i++;
    }

    return results;

  }

  private getRandomNumber(max): number {
    return Math.floor(Math.random() * max);
  }

  /* ====================================================================================================

    Taken from stackoverflow.com: https://stackoverflow.com/questions/36721830/convert-hsl-to-rgb-and-hex
   ==================================================================================================== */
  private hslToHex(h, s, l) {
    h /= 360;
    s /= 100;
    l /= 100;
    let r, g, b;
    if (s === 0) {
      r = g = b = l; // achromatic
    } else {
      const hue2rgb = (p, q, t) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1 / 6) return p + (q - p) * 6 * t;
        if (t < 1 / 2) return q;
        if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
        return p;
      };
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h + 1 / 3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1 / 3);
    }
    const toHex = x => {
      const hex = Math.round(x * 255).toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    };
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  }
}
