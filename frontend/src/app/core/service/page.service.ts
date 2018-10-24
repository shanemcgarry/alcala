import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { HttpErrorHandler, HandleError } from '../../shared/services/http-error-handler.service';
import { AlcalaPage } from '../../shared/models/alcala-page.model';
import { environment } from '../../../environments/environment';

@Injectable()
export class PageService {
  pageServiceUrl: string;
  private handleError: HandleError;

  constructor(private http: HttpClient, private httpErrorHandler: HttpErrorHandler) {
    this.pageServiceUrl = `${environment.apiUrl}page/`;
    this.handleError = httpErrorHandler.createHandleError('PageService');
  }

  getPage(pageid: string): Observable<AlcalaPage> {
    return this.http.get<AlcalaPage>(`${this.pageServiceUrl}${pageid}`)
      .pipe(
          catchError(this.handleError('getPage', null))
        );
  }
}
