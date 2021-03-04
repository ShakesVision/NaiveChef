import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.page.html',
  styleUrls: ['./signup.page.scss'],
})
export class SignupPage implements OnInit {

  email: string;
  password: string;
  error: string;

  constructor(public fireauth: AngularFireAuth) { }

  ngOnInit() {
  }
  signup() {
    this.error = "";
    this.fireauth.auth.createUserWithEmailAndPassword(this.email, this.password)
      .then(res => {
        if (res.user) {
          console.log(res.user);
          this.error = "Account Successfully Created.";
        }
      })
      .catch(err => {
        console.log(`signup failed ${err}`);
        this.error = err.message;
      });
  }
}
