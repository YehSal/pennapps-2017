import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Observable } from 'rxjs';
import { contentHeaders } from './common/headers';

import { Food } from './food';

@Injectable()
export class FoodSearchService {
  constructor(private http: Http) { }

  search(term: string): Observable<Food[]> {
    let url = window.location.host + '/api/foodsearch';
    let body = JSON.stringify({ term });
    return this.http
              .post(url, body, { headers: contentHeaders })
              .map((r: Response) => r.json().data as Food[]);
  }

}
