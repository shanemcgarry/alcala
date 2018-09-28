import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

import { Observable } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';

import { HttpErrorHandler, HandleError } from './http-error-handler.service';
import { SiteUser } from '../models/site-user.model';

@Injectable()
export class UserService {
  serviceUrl: string;
  private handleError: HandleError;

  constructor(private http: HttpClient, private httpError: HttpErrorHandler) {
    this.serviceUrl = environment.apiUrl;
    this.handleError = httpError.createHandleError('UserService');
  }
  login(username: string, password: string): Observable<any> {
    return this.http.post<any>( `${this.serviceUrl}login`, { username: username, password: password}, {responseType: 'json'})
      .pipe(map( user => {
        if (user && user.loginToken) {
          sessionStorage.setItem('currentUser', JSON.stringify(user));
        }

        return user;
      }),
        catchError(this.handleError('login', username))
      );
  }
  logout() {
    sessionStorage.removeItem('currentUser');
  }
  setPreferences(id: string, useDashboard: boolean): Observable<any> {
    return this.http.post( `${this.serviceUrl}user/update`, { _id: id, useDashboard: useDashboard })
      .pipe(map( user => {
        return user;
      }),
        catchError(this.handleError('setPreferences', id))
      );
  }
  getLoggedInUser(): SiteUser {
    if (sessionStorage.length > 0) {
      const user = JSON.parse(sessionStorage.getItem('currentUser'));
      return user as SiteUser;
    } else {
      return null;
    }
  }
}
