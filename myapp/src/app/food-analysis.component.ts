import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { Location } from '@angular/common';

import { Analysis } from './analysis';
import { FoodSearchService } from './food-search-service';

@Component({
  selector: 'food-analysis',
  templateUrl: './food-analysis.component.html',
  providers: [FoodSearchService]
})
export class FoodAnalysisComponent implements OnInit {
  analysis: Analysis
  diseasename: any

  constructor(private foodSearchService: FoodSearchService,
              private route: ActivatedRoute,
              private location: Location) {

    this.diseasename = {};
    this.diseasename["high_blood_pressure"] = "high blood pressure";
    this.diseasename["diabetes"] = "diabetes";
    this.diseasename["heart_disease"] = "heart disease";
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
