import { NgModule, Optional, SkipSelf } from '@angular/core';
import { CommonModule } from '@angular/common';

import { throwIfAlreadyLoaded } from './module-import-guard';

import { ConfigurationService } from './configuration.service';
import { CognitoService } from './cognito.service';
import { GqlClientService } from './gql-client.service';
import { AuthenticationCheckService } from './authentication-check.service';
import { UtilFunctionsService } from './util-functions.service';

/**
 * CoreModule holds all the resources which need to be provided as singletons
 * from the top level (App Module), down to the leaf components
 */
@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [],
  providers: [
    ConfigurationService,
    CognitoService,
    GqlClientService,
    AuthenticationCheckService,
    UtilFunctionsService
  ]
})
export class CoreModule {
  constructor( @Optional() @SkipSelf() parentModule: CoreModule) {
    throwIfAlreadyLoaded(parentModule, 'CoreModule');
  }
}
