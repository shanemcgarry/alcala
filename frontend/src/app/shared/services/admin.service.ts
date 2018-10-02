import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { HandleError, HttpErrorHandler } from './http-error-handler.service';
import {environment} from '../../../environments/environment';
import {Observable} from 'rxjs';
import {TrainingData} from '../models/training-data.model';
import {catchError, map} from 'rxjs/operators';

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

  saveTrainingData(data: TrainingData): Observable<any> {
    return this.httpClient.post<any>(`${this.serviceUrl}training_data/update`, { _id: data._id, categories: data.categories }, { responseType: 'json'})
      .pipe(map( result => {
        return result;
      }),
        catchError(this.handleError('saveTrainingData'))
      );
  }

  getTrainingData(userid: string): Observable<TrainingData[]> {
    return this.httpClient.get<TrainingData[]>(`${this.serviceUrl}training_data/${userid}`)
      .pipe(
        catchError(this.handleError('Get Training Data', null))
      );
  }
}
