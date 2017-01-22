import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { Location } from '@angular/common';

import { Analysis } from './analysis';
import { FoodSearchService } from './food-search-service';

@Component({
  selector: 'food-analysis',
  templateUrl: './food-analysis.component.html'
})
export class FoodAnalysisComponent implements OnInit {
  analysis: Analysis

  constructor(private foodSearchService: FoodSearchService,
              private route: ActivatedRoute,
              private location: Location) {
  }

  ngOnInit(): void {
    this.route.params
      .switchMap((params: Params) => this.foodSearchService.searchByItemId(params['id']))
      .subscribe(analysis => this.analysis = analysis);
  }

  goBack(): void {
    this.location.back();
  }
}
