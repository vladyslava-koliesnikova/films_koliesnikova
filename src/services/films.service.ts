import { inject, Injectable } from '@angular/core';
import { catchError, Observable, EMPTY } from 'rxjs';
import { Film } from '../entities/film';
import { HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { environment } from '../environments/environment';
import { UsersService } from './users.service';

@Injectable({
  providedIn: 'root'
})
export class FilmsService {
  url = environment.restServerUrl;
  http = inject(HttpClient);
  usersService = inject(UsersService);

  get token(): string {
    return this.usersService.token;
  }

  getTokenHeader(): { headers?: { [header: string]: string }, params?: HttpParams } | undefined {
    if (!this.token) {
      return undefined;
    }
    return { headers: { 'X-Auth-Token': this.token } };
  }

  getFilms(orderBy?: string, descending?: boolean, indexFrom?: number, indexTo?: number, search?: string): Observable<FilmsResponse> {
    let options = this.getTokenHeader();
    if (orderBy || descending || indexFrom || indexTo || search) {
      options = { ...(options || {}), params: new HttpParams() };
    }
    if (options && options.params) {
      if (orderBy) options.params = options.params.set('orderBy', orderBy);
      if (descending) options.params = options.params.set('descending', String(descending));
      if (indexFrom !== undefined) options.params = options.params.set('indexFrom', indexFrom);
      if (indexTo !== undefined) options.params = options.params.set('indexTo', indexTo);
      if (search) options.params = options.params.set('search', search);
    }
    return this.http.get<FilmsResponse>(this.url + 'films', options).pipe(
      catchError(error => this.processError(error))
    );
  }

  saveFilm(film: Film): Observable<Film> {
    return this.http.post<Film>(this.url + 'films', film, this.getTokenHeader()).pipe(
      catchError(error => this.processError(error))
    );
  }

  getFilmById(id: number): Observable<Film> {
    return this.http.get<Film>(this.url + 'films/' + id, this.getTokenHeader()).pipe(
      catchError(error => this.processError(error))
    );
  }

  private processError(error: any) {
    if (error instanceof HttpErrorResponse) {
      if (error.status === 0) {
        this.usersService.msgService.error('Server not available');
        return EMPTY;
      }
      if (error.status >= 400 && error.status < 500) {
        let message: string;
        try {
          message = error.error?.errorMessage
            ? error.error.errorMessage
            : JSON.parse(error.error).errorMessage;
        } catch {
          message = 'Client error';
        }
        this.usersService.msgService.error(message);
        return EMPTY;
      }
      console.error(error);
      this.usersService.msgService.error('Server error, please contact administrator');
    } else {
      console.error(error);
      this.usersService.msgService.error('Your angular developer did something wrong');
    }
    return EMPTY;
  }
}

export interface FilmsResponse {
  items: Film[];
  totalCount: number;
}