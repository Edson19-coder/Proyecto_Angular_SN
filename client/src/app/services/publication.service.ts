import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { GLOBAL } from './global';
import { Publication } from '../models/publication';

@Injectable()
export class PublicationService {
  public url: string;

  constructor(private _http: HttpClient) {
    this.url = GLOBAL.url;
  }

  addPublication(token, publication): Observable<any> {
    let params = JSON.stringify(publication);
    console.log(params);
    let headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', token);

    return this._http.post(this.url + 'create-publication', params, { headers });
  }

  getPublications(token, page = 1): Observable<any> {
    let headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', token);

    return this._http.get(this.url + 'publications/' + page, { headers });
  }
}
