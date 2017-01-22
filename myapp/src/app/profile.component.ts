import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Http, Response } from '@angular/http';
import { contentHeaders } from './common/headers';

// Import user class
import { User } from './user'

@Component({
  selector: 'profile',
  templateUrl: './profile.component.html',
  styleUrls: []
})

export class ProfileComponent implements OnInit {
  diseasename: any
  constructor(private http: Http) {
    this.diseasename = {};
    this.diseasename["high_blood_pressure"] = "high blood pressure";
    this.diseasename["diabetes"] = "diabetes";
    this.diseasename["heart_disease"] = "heart disease";
  }

  user: User;
  ngOnInit(): void {
    let url = 'http://' + window.location.host + '/api/profile';
    this.http.get(url, { headers: contentHeaders })
    .toPromise()
    .then(response => {
      this.user = response.json().profile
      console.log(this.user.diseases);

    })
    .catch(error => {
      console.log(error);
      return Promise.reject(error.message || error);
    })
  };
}
