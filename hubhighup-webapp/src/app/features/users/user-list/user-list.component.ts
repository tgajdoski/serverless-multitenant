import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CognitoService } from '../../../core/cognito.service';
import { AuthenticationCheckService } from '../../../core/authentication-check.service';
import { GqlClientService } from '../../../core/gql-client.service';
import { GUser } from '../../../schemas/gql-interface';
import gql from 'graphql-tag';

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.css']
})
export class UserListComponent implements OnInit {
  users: GUser[];

  constructor(private router: Router,
    public authCheckService: AuthenticationCheckService, private gqlClientService: GqlClientService) { }

  ngOnInit() {
    console.log('list-users-component init-ed');
    this.list();
  }

  list() {
    this.gqlClientService.apolloClient.query(
      {
        query: gql`
          query {
            users {
              userId
              username
            }
          }
        `
      }
    )
    .then( ({data}) => {
      const retUsers: Array<GUser> = data['users'];
      this.users = [];
      for (const user of retUsers) {
        this.users.push(user);
      }
    });
  }

}
