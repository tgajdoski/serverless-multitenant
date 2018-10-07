import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import {  CognitoService } from '../../core/cognito.service';

@Component({
  selector: 'app-confirm-email',
  templateUrl: './confirm-email.component.html',
  styleUrls: ['./confirm-email.component.css']
})
export class ConfirmEmailComponent implements OnInit {

  username: string;
  verificationCode: string;
  verified: boolean;
  errorMessage: string;

  constructor(private cognitoService: CognitoService,
                private router: Router, private route: ActivatedRoute ) {
      this.username = route.snapshot.queryParams['username'];
      this.verificationCode = route.snapshot.queryParams['code'];
  }

  ngOnInit() {
    this.verified = false;
    this.confirmEmail();
  }

  confirmEmail() {
    console.debug('Verification Code: %s', this.verificationCode);
    console.debug('Username is: %s', this.username);
    this.cognitoService.confirmRegistration(this.username, this.verificationCode).then(
      () => {
        console.log('verified!');
        this.verified = true;
      }
    ).catch(
      (err) => {
        console.log(err);
        this.errorMessage = err.message;
      }
    );
  }

}
