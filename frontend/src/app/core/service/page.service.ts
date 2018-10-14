import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { HttpHeaders } from '@angular/common/http';

import { Observable } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';

import { HttpErrorHandler, HandleError } from '../../shared/services/http-error-handler.service';
import { AlcalaPage } from '../../shared/models/alcala-page.model';
import { environment } from '../../../environments/environment';
import { PageResult } from '../../shared/models/page-result.model';
import { PageSearch } from '../../shared/models/page-search.model';

const httpOptions = {
  headers: new HttpHeaders( {
    'Content-Type':  'application/json'
  })
};

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

  search(phrase: string, pageIndex: number, resultLimit: number, userID?: string): Observable<PageResult> {
    const searchObj = new PageSearch(phrase, pageIndex, resultLimit, userID);
    return this.http.post<PageResult>(`${this.pageServiceUrl}search`, searchObj, {responseType: 'json'})
      .pipe(
        catchError(this.handleError('searchPage', null))
      );
  }
}
