import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { RouterModule, PreloadAllModules } from '@angular/router';

import { AppComponent } from './app.component';
import { AuthenticationModule } from './authentication/authentication.module';
import { AuthenticationComponent } from './authentication/authentication.component';
import { CoreModule } from './core/core.module';
import { AuthenticationCheckService } from './core/authentication-check.service';
import { SharedModule } from './shared/shared.module';
import { LocationStrategy, HashLocationStrategy} from '@angular/common';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    RouterModule.forRoot([
      {
        path: 'auth',
        loadChildren: 'app/authentication/authentication.module#AuthenticationModule',
      },
      {
        path: 'feat',
        loadChildren: 'app/features/features.module#FeaturesModule',
        canActivate: [ AuthenticationCheckService ]
      },
      { path: '', redirectTo: '/feat', pathMatch: 'full' }
    ],
    // https://vsavkin.com/angular-router-preloading-modules-ba3c75e424cb#.co1o9ra18 for more complex preloading strategies
    { useHash: true, preloadingStrategy: PreloadAllModules }),
    BrowserModule,
    CoreModule,
    SharedModule,
    AuthenticationModule
  ],
  providers: [
    {provide: LocationStrategy, useClass: HashLocationStrategy}
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
