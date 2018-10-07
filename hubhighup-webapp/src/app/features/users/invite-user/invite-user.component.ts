import { Component, OnInit, ElementRef, ViewChild, Renderer} from '@angular/core';
import { Router } from '@angular/router';
import gql from 'graphql-tag';
import { CognitoService } from '../../../core/cognito.service';
import { GqlClientService } from '../../../core/gql-client.service';
import { ToastyService, ToastyConfig, ToastOptions } from 'ng2-toasty';

@Component({
  selector: 'app-invite-user',
  templateUrl: './invite-user.component.html',
  styleUrls: ['./invite-user.component.css']
})
export class InviteUserComponent implements OnInit {
  email: string;
  sendingInvitation: boolean;

  @ViewChild('myButt') button: ElementRef;

  constructor(private cognitoService: CognitoService, private router: Router, private toastyService: ToastyService,
    private toastyConfig: ToastyConfig, private renderer: Renderer, private gqlClientService: GqlClientService ) {
      this.toastyConfig.showClose = false;
      this.toastyConfig.theme = 'bootstrap';
      this.toastyConfig.timeout = 4000;
      this.toastyConfig.position = 'top-center';
  }

  ngOnInit() {
    console.log('invite-user-components init-ed');
    this.sendingInvitation = false;
  }

  invite() {
    this.renderer.invokeElementMethod(this.button.nativeElement, 'focus');
    this.sendingInvitation = true;
    console.debug('Email: ' + this.email);
    this.gqlClientService.apolloClient.mutate({
      mutation: gql`
        mutation {
          inviteUser(email: "${this.email}")
        }
      `
    })
    .then( result => {
      console.log(result);
      this.sendingInvitation = false;
      const toastOptions: ToastOptions = {
          title: 'Invitation sent!',
          msg: 'Succesfully sent invitation to ' + this.email
      };
      this.toastyService.success(toastOptions);
      this.email = null;
      console.log('invitation finished');
    })
    .catch( (err) => {
      this.sendingInvitation = false;
      console.log(err);
      const toastOptions: ToastOptions = {
          title: 'Whoops!',
          msg: err.message
      };
      this.toastyService.error(toastOptions);
    });
  }
}
