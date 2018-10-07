import {Injectable} from '@angular/core';
import {ConfigurationService} from './configuration.service';

import {CognitoUserPool, CognitoUser, CognitoUserAttribute, AuthenticationDetails, CognitoUserSession} from 'amazon-cognito-identity-js';

export class RegistrationUser {
  userName: string;
  tenantName: string;
  email: string;
  password: string;
}

export interface CognitoCallback {
  cognitoCallback(message: string, result: any): void;
}

export interface Callback {
  callback(): void;
  callbackWithParam(result: any): void;
}

@Injectable()
export class CognitoService {

  constructor(private configurationService: ConfigurationService) {
    console.log('Cognito service constructor');
  }

  getUserPool(): Promise<CognitoUserPool> {
    return this.configurationService.getCognitoData()
      .then(cognitoData =>
        new CognitoUserPool({ UserPoolId: cognitoData.UserPoolId, ClientId: cognitoData.ClientId })
      );
  }

  getCognitoUser(username: string): Promise<CognitoUser> {
    return new Promise((resolve, reject) => {
      this.getUserPool()
      .then((userPool) => {
        const userData = {
          Username: username,
          Pool: userPool
        };
        resolve(new CognitoUser(userData));
      })
      .catch(err => reject(err));
    });
  }

  getCurrentUser(): Promise<CognitoUser> {
    return this.getUserPool().then(
        userPool => userPool.getCurrentUser()
    );
  }

  getSession(): Promise<CognitoUserSession> {
    return new Promise((resolve, reject) => {
      this.getCurrentUser().then(user => {
        if ( user == null ) {
          reject('No authenticated user');
          return;
        }
        user.getSession(function (err, session) {
          if (err) {
            reject('Can\'t get the current session:' + err);
          } else {
            if (session.isValid()) {
              resolve(session);
            } else {
              reject('Invalid Session');
            }
          }
        });
      });
    });
  }

  /**
   * Force refresh the session to get the new claims
   */
  refreshSession(): Promise<any> {
    return new Promise( (resolve, reject) => {
      let session: CognitoUserSession;
      this.getSession()
      .then( _session => {
        session = _session;
        return this.getCurrentUser();
      })
      .then( user => {
        user.refreshSession( session.getRefreshToken(), (err, result) => {
          if (err) {
            reject(err);
          } else {
            console.log('succesful refresh');
            console.log(result);
            resolve();
          }
        });
      })
      .catch( err => reject(err));
    });
  }

  register(user: RegistrationUser): Promise<any> {
    console.log('user: ' + JSON.stringify(user));

    const attributeList = [];

    const dataEmail = {
      Name: 'email',
      Value: user.email
    };
    const tenantName = {
      Name: 'custom:suggestedTenantName',
      Value: user.tenantName
    };
    attributeList.push(new CognitoUserAttribute(dataEmail));
    attributeList.push(new CognitoUserAttribute(tenantName));

    return new Promise( (resolve, reject) => {
      this.getUserPool().then((userPool) => {
        userPool.signUp(user.userName, user.password, attributeList, null, function (err, result) {
          if (err) {
            reject(err);
          } else {
            resolve(result);
          }
        });
      });
    });
  }

  confirmRegistration(username: string, confirmationCode: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.getCognitoUser(username)
      .then(cognitoUser => {
        console.log('calling confirm registration with conf.code: %s', confirmationCode);
        console.log('cognito user:');
        console.log(cognitoUser);
        cognitoUser.confirmRegistration(confirmationCode, true, function (err, result) {
          if (err) {
            console.error(err);
            reject(err);
          } else {
            resolve(result);
          }
        });
      })
      .catch( err => {
        console.error(err);
        reject(err);
      });
    });
  }

  resendCode(username: string): Promise<any>  {
    return new Promise((resolve, reject) => {
      this.getCognitoUser(username)
      .then(cognitoUser => {
        cognitoUser.resendConfirmationCode(function (err, result) {
          if (err) {
            reject(err);
          } else {
            resolve(result);
          }
        });
      })
      .catch(err => reject(err));
    });
  }

  authenticate(username: string, password: string): Promise<any> {
    // Need to provide placeholder keys unless unauthorised user access is enabled for user pool

    const authenticationData = {
      Username: username,
      Password: password
    };
    const authenticationDetails = new AuthenticationDetails(authenticationData);

    console.log('Authenticating the user');
    return new Promise((resolve, reject) => {
      this.getCognitoUser(username)
      .then(cognitoUser => {
        cognitoUser.authenticateUser(authenticationDetails, {
          onSuccess: function (result) {
            resolve(result);
          },
          onFailure: function (err) {
            reject(err);
          },
          mfaRequired: function(codeDeliveryDetails) {
              // MFA is required to complete user authentication.
              // Get the code from user and call
              // TBD
              // cognitoUser.sendMFACode(mfaCode, this)
          },
          newPasswordRequired: function(userAttributes, requiredAttributes) {
              // User was signed up by an admin and must provide new
              // password and required attributes, if any, to complete
              // authentication.
              console.log('new password required');
              reject({
                code: 'PasswordChangeRequiredException',
                user: cognitoUser });
          }
        });
      })
      .catch ( err => reject(err));
    });
  }

  adminCreatedUserSetPassword(cognitoUser: CognitoUser, newPassword: string): Promise<any> {
    return new Promise( (resolve, reject) => {
      cognitoUser.completeNewPasswordChallenge(newPassword, null, {
          onSuccess: function (result) {
            resolve(result);
          },
          onFailure: function (err) {
            reject(err);
          }
      });
    });
  }

  forgotPassword(username: string, callback: CognitoCallback): Promise<any> {
    return new Promise( (resolve, reject) => {
      this.getCognitoUser(username)
      .then( cognitoUser => {
        cognitoUser.forgotPassword({
          onSuccess:  () => {
          },
          onFailure: (err) => {
            callback.cognitoCallback(err.message, null);
          },
          inputVerificationCode: () => {
            callback.cognitoCallback(null, null);
          }
        });
      }).catch(err => reject(err));
    });
  }

  confirmNewPassword(email: string, verificationCode: string, password: string, callback: CognitoCallback): Promise<any> {
    return new Promise((resolve, reject) => {
      this.getCognitoUser(email)
      .then(cognitoUser => {
        cognitoUser.confirmPassword(verificationCode, password, {
          onSuccess: () => {
            callback.cognitoCallback(null, 'success');
          },
          onFailure: function (err) {
            callback.cognitoCallback(err.message, null);
          }
        });
      }).catch(err => reject(err));
    });
  }

  logout() {
    console.log('Logging out');
    this.getCurrentUser().then(
      currentUser => {
        if (currentUser) {
          currentUser.signOut();
        }
      }
    );
  }

  globalLogout(): Promise<any> {
    console.log('Global Log Out');
    return new Promise((resolve, reject) => {
        this.getCurrentUser().then(
        currentUser => {
          currentUser.globalSignOut ({
            onSuccess: (msg) => {
              resolve(msg);
            },
            onFailure: (err) => {
              reject(err);
            }
          });
       });
    });
  }

}
