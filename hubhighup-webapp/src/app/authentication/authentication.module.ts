import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { RouterModule } from '@angular/router';

import { ToastyModule } from 'ng2-toasty';

import { AuthenticationRoutingModule } from './authentication-routing.module';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { InvitedComponent } from './invited/invited.component';
import { ConfirmEmailComponent } from './confirm-email/confirm-email.component';
import { AuthenticationComponent } from './authentication.component';
import { SharedModule } from '../shared/shared.module';
import { CheckEmailComponent } from './check-email/check-email.component';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    SharedModule,
    AuthenticationRoutingModule,
    ToastyModule.forRoot()
  ],
  declarations: [
    LoginComponent,
    RegisterComponent,
    InvitedComponent,
    ConfirmEmailComponent,
    AuthenticationComponent,
    CheckEmailComponent
  ]
})
export class AuthenticationModule { }
