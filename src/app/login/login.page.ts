import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { Router, ActivatedRoute } from "@angular/router"
import { ToastController } from '@ionic/angular';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {

  email: string;
  password: string;
  error: string;
  isLoggedin:boolean;
  user:any;

  constructor(private router: Router,public fireauth: AngularFireAuth,public toastController: ToastController) { }

  ngOnInit() {
  }

  async presentToast(message, show_button, position, duration) {
    const toast = await this.toastController.create({
      message: message,
      showCloseButton: show_button,
      position: position,
      duration: duration
    });
    toast.present();
  }

  login() {
    this.fireauth.auth.signInWithEmailAndPassword(this.email, this.password)
      .then(res => {
        if (res.user) {
          console.log(res.user);  
          this.router.navigate(['/tabs/tab1']);  
        }  
      })
      .catch(err => {  
        console.log(`login failed ${err}`);
        this.error = err.message;
      });
  }

  recover() {
    this.fireauth.auth.sendPasswordResetEmail(this.email)
      .then(data => {
        console.log(data);
        this.presentToast('Password reset email sent', false, 'bottom', 1000);
        this.router.navigateByUrl('/login');
      })
      .catch(err => {
        console.log(` failed ${err}`);
        this.error = err.message;
      });
  }

  logout() {
    this.fireauth.auth.signOut().then(() => {
      this.router.navigate(['/tabs/tab1']);
      console.log('Logged out!');
    })
  }
  
  ionViewDidEnter() {
    this.fireauth.auth.onAuthStateChanged((user) => {
      if (user) {
        this.user = user;
        console.log(this.user.email);
        this.isLoggedin = true;
      }
      else this.isLoggedin = false;
    })

  }
}
