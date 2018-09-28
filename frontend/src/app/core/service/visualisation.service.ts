import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { HttpErrorHandler, HandleError } from '../../shared/services/http-error-handler.service';
import { environment } from '../../../environments/environment';
import { Observable, from } from 'rxjs';
import { catchError, groupBy, map, mergeMap, tap, toArray } from 'rxjs/operators';
import {AnalysisItem, AnalysisSummary, AnalysisUserItem} from '../../shared/models/analysis-result';
import {CategoryData, CategoryMonthPivotItem} from '../../shared/models/pivot-data.model';

const httpOptions = {
  headers: new HttpHeaders( {
    'Content-Type':  'application/json'
  })
};

@Injectable()
export class VisualisationService {
  serviceUrl: string;
  private handleError: HandleError;

  constructor(private httpClient: HttpClient, private httpErrorHandler: HttpErrorHandler) {
    this.serviceUrl = `${environment.apiUrl}visualise/`;
    this.handleError = httpErrorHandler.createHandleError('visualisationService');
  }

  getDashboardSummary(year: any): Observable<AnalysisSummary> {
    return this.httpClient.get<AnalysisSummary>(`${this.serviceUrl}dashboard/${year}`)
      .pipe(
        catchError(this.handleError('Dashboard', null))
      );
  }

  getCategoryBreakdown(year: any): Observable<any[]> {
    return this.httpClient.get<any[]>(`${this.serviceUrl}categories/${year}`)
      .pipe(
        catchError(this.handleError('Category Breakdown', null))
      );
  }

  getThemeColours(numColours: number): Observable<any[]> {
    return this.httpClient.get<any[]>(`${this.serviceUrl}theme_colours/${numColours}`)
      .pipe(
        catchError(this.handleError('Theme Colours', null))
      );
  }

  getCategoryData(): Observable<CategoryData[]> {
    return this.httpClient.get<CategoryData[]>(`${this.serviceUrl}category_data`)
      .pipe(
        catchError(this.handleError('Category Data', null))
      );
  }

  getRawData(year: any): Observable<AnalysisItem[]> {
    return this.httpClient.get<AnalysisItem[]>(`${this.serviceUrl}get_raw_data/${year}`)
      .pipe(
        catchError(this.handleError('Raw Data Fetch', null))
      );
  }

  getCategoryTimeData(year: any): Observable<any[]> {
    return this.httpClient.get<any[]>( `${this.serviceUrl}category_time_data/${year}`)
      .pipe(
        catchError(this.handleError('Stack Area Data fetch', null))
      );
  }
}
