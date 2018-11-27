import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { HandleError, HttpErrorHandler } from './http-error-handler.service';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import {CustomDashboardInfo, CustomStoryInfo, CustomChartInfo, CustomInfoBox, BoundaryObject} from '../models/custom-dashboard.model';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  serviceUrl: string;
  handleError: HandleError;
  constructor(private httpClient: HttpClient, private httpErrorHandler: HttpErrorHandler) {
    this.serviceUrl = `${environment.apiUrl}dashboard/`;
    this.handleError = httpErrorHandler.createHandleError('dashboardService');
  }

  getUserDashboard(userID: string): Observable<CustomDashboardInfo> {
    return this.httpClient.get<CustomDashboardInfo>(`${this.serviceUrl}${userID}`)
      .pipe(
        catchError(this.handleError('getUserDashboard', null))
      );
  }

  saveUserDashboard(dashboardInfo: CustomDashboardInfo): Observable<CustomDashboardInfo> {
    return this.httpClient.post<CustomDashboardInfo>(`${this.serviceUrl}`, dashboardInfo, {responseType: 'json'})
      .pipe(
        catchError(this.handleError('saveUserDashboard', null))
      );
  }

  getBoundaryObjectByID(id: string): Observable<BoundaryObject> {
    return this.httpClient.get<BoundaryObject>(`${this.serviceUrl}boundaryObject/getByID/${id}`)
      .pipe(
        catchError(this.handleError('getBoundaryObjectByID', null))
      );
  }

  getBoundaryObjects(userID: string): Observable<BoundaryObject[]> {
    return this.httpClient.get<BoundaryObject[]>(`${this.serviceUrl}boundaryObject/${userID}`)
      .pipe(
        catchError(this.handleError('getBoundaryObjects', null))
      );
  }

  saveBoundaryObject(boundaryObject: BoundaryObject): Observable<BoundaryObject> {
    return this.httpClient.post<BoundaryObject>(`${this.serviceUrl}boundaryObject`, boundaryObject, {responseType: 'json'})
      .pipe(
        catchError(this.handleError('saveBoundaryObject', null))
      );
  }

  deleteBoundaryObject(boundaryObject: BoundaryObject): Observable<any> {
    return this.httpClient.post<any>(`${this.serviceUrl}boundaryObject/delete`, boundaryObject, {responseType: 'json'})
      .pipe(
        catchError(this.handleError('deleteBoundaryObject', null))
      );
  }

  getInfoBoxes(userID: string): Observable<CustomInfoBox[]> {
    return this.httpClient.get<CustomInfoBox[]>(`${this.serviceUrl}infobox/${userID}`)
      .pipe(
        catchError(this.handleError('getInfoBoxes', null))
      );
  }

  saveInfoBox(infoBox: CustomInfoBox): Observable<CustomInfoBox> {
    return this.httpClient.post<CustomInfoBox>(`${this.serviceUrl}infobox`, infoBox, {responseType: 'json'})
      .pipe(
        catchError(this.handleError('saveInfoBox', null))
      );
  }

  deleteInfoBox(infoBox: CustomInfoBox): Observable<any> {
    return this.httpClient.post<any>(`${this.serviceUrl}infobox/delete`, infoBox, {responseType: 'json'})
      .pipe(
        catchError(this.handleError('deleteInfoBox', null))
      );
  }

  getUserCharts(userID: string): Observable<CustomChartInfo[]> {
    return this.httpClient.get<CustomChartInfo[]>(`${this.serviceUrl}chart/${userID}`)
      .pipe(
        catchError(this.handleError('getUserCharts', null))
      );
  }

  saveUserChart(chartInfo: CustomChartInfo): Observable<CustomChartInfo> {
    return this.httpClient.post<CustomChartInfo>(`${this.serviceUrl}chart`, chartInfo, {responseType: 'json'})
      .pipe(
        catchError(this.handleError('saveUserChart', null))
      );
  }

  deleteUserChart(chartInfo: CustomChartInfo): Observable<any> {
    return this.httpClient.post<any>(`${this.serviceUrl}chart/delete`, chartInfo, {responseType: 'json'})
      .pipe(
        catchError(this.handleError('deleteUserChart', null))
      );
  }

  getUserStories(userID: string): Observable<CustomStoryInfo[]> {
    return this.httpClient.get<CustomStoryInfo[]>(`${this.serviceUrl}story/${userID}`)
      .pipe(
        catchError(this.handleError('getUserStories', null))
      );
  }

  saveUserStory(storyInfo: CustomStoryInfo): Observable<CustomStoryInfo> {
    return this.httpClient.post<CustomStoryInfo>(`${this.serviceUrl}story`, storyInfo, {responseType: 'json'})
      .pipe(
        catchError(this.handleError('saveUserStory', null))
      );
  }

  deleteUserStory(storyInfo: CustomStoryInfo): Observable<any> {
    return this.httpClient.post<any>(`${this.serviceUrl}story/delete`, storyInfo, {responseType: 'json'})
      .pipe(
        catchError(this.handleError('deleteUserStory', null))
      );
  }
}
