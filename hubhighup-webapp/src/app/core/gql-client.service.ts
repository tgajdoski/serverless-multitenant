import { Injectable } from '@angular/core';
import { ApolloClient, createNetworkInterface } from 'apollo-client';
import { rxify } from 'apollo-client-rxjs';

import { CognitoService } from './cognito.service';
import { _FACADE_SERVICE_URL } from './configuration.service';

@Injectable()
export class GqlClientService {
  public apolloClient: ApolloClient;

  constructor(private cognitoService: CognitoService) {
    const networkInterface = createNetworkInterface( { uri: _FACADE_SERVICE_URL + '/gql'} );
    networkInterface.use([{
      applyMiddleware: (req, next) => {
        if (!req.options.headers) {
          req.options.headers = {};  // Create the header object if needed.
        }
        // get the authentication token from local storage if it exists
        this.cognitoService.getSession()
        .then( session => {
          const jwt = session.getIdToken().getJwtToken();
          req.options.headers['Authorization'] = jwt;
          next();
        });
      }
    }]);
    this.apolloClient = rxify(new ApolloClient({
      networkInterface,
    }));
  }

}
