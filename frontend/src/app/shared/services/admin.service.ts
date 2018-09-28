import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { HandleError, HttpErrorHandler } from './http-error-handler.service';
import {environment} from '../../../environments/environment';
import {Observable} from 'rxjs';
import {TrainingData} from '../models/training-data.model';
import {catchError} from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  serviceUrl: string;
  private handleError: HandleError;

  constructor(private httpClient: HttpClient, private httpError: HttpErrorHandler) {
    this.serviceUrl = `${environment.apiUrl}admin/`;
    this.handleError = httpError.createHandleError('AdminService');
  }

  getTrainingData(userid: string): Observable<TrainingData[]> {
    return this.httpClient.get<TrainingData[]>(`${this.serviceUrl}training_data/${userid}`)
      .pipe(
        catchError(this.handleError('Get Training Data', null))
      );
  }
}
