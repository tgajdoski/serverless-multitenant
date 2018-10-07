import { Injectable } from '@angular/core';
import { Configuration } from '../schemas/gql-interface';
import { ApolloClient, createNetworkInterface } from 'apollo-client';
import gql from 'graphql-tag';

declare var require: any;
const conf = require('../../../interservice-config.js').conf;

export let _FACADE_SERVICE_URL = conf().facadeServiceURL;

@Injectable()
export class ConfigurationService {
  private cognitoIDsPromise: Promise<{IdentityPoolId: string, UserPoolId: string, ClientId: string}>;

  constructor() {
    const configNI = createNetworkInterface({ uri: _FACADE_SERVICE_URL + '/gqls' });
    let configApolloClient = new ApolloClient({
      networkInterface: configNI,
      connectToDevTools: false
    });
    console.log('require: ' + JSON.stringify(conf(), null, 2));
    console.log('YAY, constructing Cognito Resources');

    this.cognitoIDsPromise = new Promise( (resolve, reject) => {
      console.log('GOT A REQUEST!');
      configApolloClient.query({
        query: gql`
query {
  config {
    userPoolId
    userPoolClientAppId
    identityPoolId
  }
}
`
      }).then( ({data}) => {
        console.log('GOT CONFIG DATA!!!');
        console.log(JSON.stringify(data, null, 2));
        const configuration: Configuration = data['config'];
        resolve(
          {
          IdentityPoolId: configuration.identityPoolId,
          UserPoolId: configuration.userPoolId,
          ClientId : configuration.userPoolClientAppId
          }
        );
      });
    });
  }

  getCognitoData(): Promise<{IdentityPoolId: string, UserPoolId: string, ClientId: string}> {
    return this.cognitoIDsPromise;
  }


}
