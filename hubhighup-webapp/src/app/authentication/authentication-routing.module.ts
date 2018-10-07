import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AuthenticationComponent } from './authentication.component';
import { ConfirmEmailComponent } from './confirm-email/confirm-email.component';
import { InvitedComponent } from './invited/invited.component';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { CheckEmailComponent } from './check-email/check-email.component';

const routes: Routes = [{
    path: '',
    component: AuthenticationComponent,
    children: [
      { path: 'login', component: LoginComponent },
      { path: 'register', component: RegisterComponent },
      { path: 'checkemail', component: CheckEmailComponent },
      { path: 'invited', component: InvitedComponent},
      { path: 'confirm', component: ConfirmEmailComponent },
      { path: '', redirectTo: 'login', pathMatch: 'full' },
    ]
}]
;

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: []
})
export class AuthenticationRoutingModule { }
