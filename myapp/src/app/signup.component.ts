import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Http } from '@angular/http';
import { contentHeaders } from './common/headers';

@Component({
  selector: 'signup',
  templateUrl: './signup.component.html',
  styleUrls: []
})
export class Signup {
  constructor(public router: Router, public http: Http) {

  }

  signup(event, name, password) {
    event.preventDefault();
    let body = JSON.stringify({ name, password });
    console.log(body);
    this.http.post('http://localhost:3000/api/signup', body, { headers: contentHeaders })
      .subscribe(
        response => {
          console.log('successfully logged in' + response.json().token);
          localStorage.setItem('id_token', response.json().token);
          this.router.navigate(['home']);
        },
        error => {
          alert(error.text());
          console.log(error.text());
        }
      );
  }
}
