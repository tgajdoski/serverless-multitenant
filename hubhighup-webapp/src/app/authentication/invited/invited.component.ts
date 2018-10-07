import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { CognitoService } from '../../core/cognito.service';
import { AuthenticationCheckService } from '../../core/authentication-check.service';
@Component({
  selector: 'app-invited',
  templateUrl: './invited.component.html',
  styleUrls: ['./invited.component.css']
})
export class InvitedComponent implements OnInit {

static redirectUrl: string;

  username: string;
  password: string;
  errorMessage: string;
  resetPassword: boolean;
  cognitoUser: any;
  newPassword: string;

  constructor(private router: Router, private route: ActivatedRoute,
        private cognitoService: CognitoService, private authCheckService: AuthenticationCheckService) {
      this.username = route.snapshot.queryParams['username'];
      this.password = route.snapshot.queryParams['code'];
  }

  ngOnInit() {
    this.resetPassword = false;
    this.newPassword = '';
    this.login();
  }

  cancelChangePassword() {
    this.resetPassword = false;
    this.cognitoService.logout();
  }

  evaluateLoginPromise(promise: Promise<any>) {
    // promise is a promise that the cognito user pool user will be logged in.
    // if it is (or if there is a problem), still there is bunch of things to do
    promise.then(
       (result) => {
          this.errorMessage = null;
          console.log('result:' + result);
          return this.authCheckService.initBasedOnCognitoToken();
    }).then(
      () => {
        console.log('Authentication process finished!');
        if (InvitedComponent.redirectUrl && InvitedComponent.redirectUrl !== 'auth/login') {
          this.router.navigateByUrl(InvitedComponent.redirectUrl);
        } else {
          this.router.navigate(['/feat']);
        }
      }
    ).catch(
      (error) => {
        this.errorMessage = error.message;
        console.log(error);
        if (error.code === 'UserNotConfirmedException') {
          console.log('User Not Confirmed');
          this.router.navigate(['/auth/confirm', this.username]);
        } else if (error.code === 'PasswordChangeRequiredException') {
          this.resetPassword = true;
          this.cognitoUser = error.user;
        } else if (error.code === 'PasswordResetRequiredException') {
          // TODO: Need to handle this as a part of the admin created users workflow
          console.log('Password Reset Required');
        } else if (error.code === 'NotAuthorizedException') {
          console.log('User Not Authorized');
        } else if (error.code === 'ResourceNotFoundException') {
          console.log('Resource Not Found');
        } else if (error.code === 'UserNotFoundException') {
          console.log('User Not Found');
        } else {
            // Unknown
        }
      }
    );
  }

  login() {
    console.debug('Username: %s', this.username);
    console.debug('Password: %s', this.password);
    // logout any user that was currently logged in
    if (this.cognitoService.getCurrentUser()) {
      this.cognitoService.logout();
    }
    this.evaluateLoginPromise(this.cognitoService.authenticate(this.username, this.password));
  }

  setNewPassword() {
    this.evaluateLoginPromise(this.cognitoService.adminCreatedUserSetPassword(this.cognitoUser, this.newPassword));
  }
}
