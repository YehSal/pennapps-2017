import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { Subject } from 'rxjs';

import { FoodSearchService } from './food-search-service';
import { Food } from './food';

@Component({
  selector: 'food-search',
  templateUrl: './food-search.component.html',
  styleUrls: ['./food-search.component.css'],
  providers: [FoodSearchService]
})
export class FoodSearchComponent implements OnInit {
  foods: Observable<Food[]>;
  private searchTerms = new Subject<string>();

  constructor(private foodSearchService: FoodSearchService,
              private router: Router) {}

  search(term: string): void {
    this.searchTerms.next(term);
  }

  ngOnInit(): void {
    this.foods = this.searchTerms
        .debounceTime(300)
        .distinctUntilChanged()
        .switchMap(term => term ? this.foodSearchService.search(term) : Observable.of<Food[]>([]))
        .catch(error => {
          console.log(error);
          return Observable.of<Food[]>([]);
        })
  }

  goToDetail(food: Food): void {
    let link = ['/analyze', food.item_id];
    this.router.navigate(link);
  }
}
