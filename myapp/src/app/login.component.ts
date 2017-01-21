import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Http } from '@angular/http';
import { contentHeaders } from './common/headers';

@Component({
  selector: 'login',
  templateUrl: './login.component.html',
  styleUrls: []
})
export class Login {
  constructor(public router: Router, public http: Http) {

  }

  login(event, name, password) {
    event.preventDefault();
    let body = JSON.stringify({ name, password });
    this.http.post('http://localhost:3000/api/authenticate', body, { headers: contentHeaders })
      .subscribe(
        response => {
          console.log('logged in '+ response.json().token)
          localStorage.setItem('id_token', response.json().token);
          this.router.navigate(['home']);
        },
        error => {
          alert(error.text());
          console.log(error.text());
        }
      );
    this.router.navigate(['/home']);
  }
}
