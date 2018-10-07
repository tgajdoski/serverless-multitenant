import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { GqlClientService } from './gql-client.service';
import { CognitoService } from './cognito.service';
import { InitializationResult } from '../schemas/gql-interface';
import gql from 'graphql-tag';

@Injectable()
export class AuthenticationCheckService implements CanActivate {
  public redirectUrl: string;
  public tenantName: string;
  public userName: string;

  constructor(private router: Router, private gqlService: GqlClientService,
    private cognitoService: CognitoService) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean> {

    return this.initBasedOnCognitoToken()
      .then(() => { return true; })
      .catch(() => {
        console.log('url before redirect to login:\"' + state.url + '"');
        this.redirectUrl = state.url;
        // not logged in so redirect to login page
        this.router.navigate(['/auth/login']);
        return false;
      }
      );
  }


  /**
    * This is the method that gets the initial data if needed....
    */
  initBasedOnCognitoToken(): Promise<any> {
    console.log('init based on cognito token');
    return this.cognitoService.getSession()
      .then(() => this.gqlService.apolloClient.mutate({
        mutation: gql`
    mutation {
        initializeMe {
        initialized
        newTenant
        tenantName
        }
    }
`
      }))
      .then(({ data }) => {
        console.log(JSON.stringify(data, null, 2));
        const result: InitializationResult = data['initializeMe'];
        this.tenantName = result.tenantName;
        if (result.newTenant) {
          return this.cognitoService.refreshSession();
        } else {
          return Promise.resolve();
        }
      })
      .then(() => this.cognitoService.getCurrentUser())
      .then(user => {
        this.userName = user.getUsername();
        return Promise.resolve();
      });
  }
}
