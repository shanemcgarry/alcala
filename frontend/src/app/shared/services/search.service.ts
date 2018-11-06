import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { HandleError, HttpErrorHandler } from './http-error-handler.service';
import { environment } from '../../../environments/environment';
import {SearchFeatures, SearchParams, PageSearch, SearchLogEntry} from '../models/search.model';
import { DataSummaryPackage } from '../models/analysis-result';
import { PageResult } from '../models/page-result.model';

@Injectable({
  providedIn: 'root'
})
export class SearchService {
  handleError: HandleError;
  serviceUrl: string;

  constructor(private httpClient: HttpClient, private errorHandler: HttpErrorHandler) {
    this.serviceUrl = `${environment.apiUrl}search/`;
    this.handleError = errorHandler.createHandleError('Search Service');
  }

  logSearchFeatures(searchID: string, searchFeatures: SearchFeatures): Observable<any> {
    return this.httpClient.post<any>(`${this.serviceUrl}log/features`, {searchID: searchID, features: searchFeatures}, {responseType: 'json'})
      .pipe(
        catchError(this.handleError('Log Search Features', null))
      );
  }

  visualiseSearch(searchParams: SearchParams, userID?: string, logSearch: boolean = true): Observable<DataSummaryPackage> {
    return this.httpClient.post<any>(`${this.serviceUrl}visualise`, {userID: userID, params: searchParams, logSearch: logSearch}, {responseType: 'json'})
      .pipe(
        catchError(this.handleError('generateSearch', null))
      );
  }

  keywordSearch(searchParams: SearchParams, pageIndex: number, resultLimit: number, userID?: string, searchID?: string, logSearch: boolean = true): Observable<PageResult> {
    const searchObj = new PageSearch(pageIndex, resultLimit, userID);
    return this.httpClient.post<PageResult>(`${this.serviceUrl}page`, { info: searchObj, params: searchParams, searchID: searchID, logSearch: logSearch }, {responseType: 'json'})
      .pipe(
        catchError(this.handleError('searchPage', null))
      );
  }

  getSearchHistory(userID: string, type: string): Observable<SearchLogEntry[]> {
    return this.httpClient.post<SearchLogEntry[]>(`${this.serviceUrl}logs`, { userID: userID, type: type }, { responseType: 'json' })
      .pipe(
        catchError(this.handleError('searchHistory', null))
      );
  }
}
