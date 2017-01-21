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

  login(event, username, password) {
    event.preventDefault();
    let body = JSON.stringify({ username, password });
    // this.http.post('http://localhost:3001/sessions/create', body, { headers: contentHeaders })
    //   .subscribe(
    //     response => {
    //       localStorage.setItem('id_token', response.json().id_token);
    //       this.router.navigate(['home']);
    //     },
    //     error => {
    //       alert(error.text());
    //       console.log(error.text());
    //     }
    //   );
    console.log('logging the user in')
    let example = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWUsImp0aSI6ImVkNTAyMThkLWJjNDAtNGVhNC1iZjJhLTNhYjA0ZWNlZDg4YSIsImlhdCI6MTQ4NTAxOTg0NCwiZXhwIjoxNDg1MDIzNDQ0fQ.OV8ds7LPQzPYA9PNuRYsuAHN0OVpmJ6ad86Jiz-2pwI';
    localStorage.setItem('id_token', example)
    this.router.navigate(['/home']);
  }
}
