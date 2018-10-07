import { Component, OnInit, ElementRef, Renderer, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { ToastyService, ToastyConfig, ToastOptions } from 'ng2-toasty';

import { RegistrationUser, CognitoService } from '../../core/cognito.service';
import { UtilFunctionsService } from '../../core/util-functions.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {

  registration: RegistrationUser;
  errorMessage: string;
  registeringUser: boolean;
  @ViewChild('myButt') button: ElementRef;

  constructor(private cognitoService: CognitoService, private router: Router,
    private renderer: Renderer, private utilFunctions: UtilFunctionsService,
    private toastyService: ToastyService, private toastyConfig: ToastyConfig) {
    this.toastyConfig.showClose = false;
    this.toastyConfig.theme = 'bootstrap';
    this.toastyConfig.timeout = 4000;
    this.toastyConfig.position = 'top-center';
  }

  ngOnInit() {
    this.registration = new RegistrationUser();
    this.registeringUser = false;
  }

  registerUser() {
    this.renderer.invokeElementMethod(this.button.nativeElement, 'focus');

    this.registeringUser = false;
    this.toastyService.clearAll();
    this.errorMessage = null;
    if (!this.registration.email || !this.registration.password || !this.registration.tenantName) {
      // this.errorMessage = 'All fields are required';
      const toastOptions: ToastOptions = {
        title: 'Whoops!',
        msg: 'All fields are required.'
      };
      this.toastyService.error(toastOptions);
      return;
    }
    this.registeringUser = true;
    this.registration.userName = this.utilFunctions.defaultUsernameForEmail(this.registration.email);

    console.debug('Tenant Name: %s', this.registration.tenantName);
    console.debug('Email: %s', this.registration.email);
    console.debug('Password: %s', this.registration.password);

    this.cognitoService.register(this.registration).then(
      (result) => {
        this.errorMessage = null;
        console.log('result:' + result);
        this.registeringUser = false;
        if (result.UserConfirmed) {
          this.router.navigate(['/login']);
        } else {
          console.log('Email needs to be confirmed!');
          this.router.navigate(['/checkemail']);
        }
      }).catch(
      (err) => {
        this.registeringUser = false;
        this.errorMessage = err.message;
        console.log('result: ' + err.message);
      });
  }
}
