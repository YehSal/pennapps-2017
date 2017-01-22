import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Observable } from 'rxjs';
import { contentHeaders } from './common/headers';

import { Food } from './food';
import { Analysis } from './analysis';

@Injectable()
export class FoodSearchService {
  constructor(private http: Http) { }

  search(term: string): Observable<Food[]> {
    let url = 'http://' + window.location.host + '/api/foodsearch';
    let body = JSON.stringify({ term });
    return this.http
              .post(url, body, { headers: contentHeaders })
              .map((r: Response) => {
                console.log(r.json().results)
                return r.json().results as Food[];
              });
  }

  searchByItemId(id: string): Promise<Analysis> {
    let url = 'http://' + window.location.host + '/api/analyze';
    let body = JSON.stringify({ id });
    return this.http
              .post(url, body, { headers: contentHeaders })
              .toPromise()
              .then(response => response.json().data as Analysis)
              .catch(this.handleError);
  }

  private handleError(error: any): Promise<any> {
    console.error('An error occurred', error); // for demo purposes only
    return Promise.reject(error.message || error);
  }



}
