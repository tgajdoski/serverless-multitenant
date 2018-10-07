

import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'apollo-client';
import { GqlClientService } from '../../../core/gql-client.service';
import { AuthenticationCheckService } from '../../../core/authentication-check.service';
import { CognitoService } from '../../../core/cognito.service';
import { S3 } from 'aws-sdk';
import { GProject, CreateProjectMutationArgs } from '../../../schemas/gql-interface';
import gql from 'graphql-tag';
import { Router } from '@angular/router';

import * as Sugar from 'sugar';


const listProjects = gql`
query {
  projects {
    projectId
    projectname
    created
    owner
  }
}
`;


@Component({
  selector: 'app-project-list',
  templateUrl: './project-list.component.html',
  styleUrls: ['./project-list.component.css']
})
export class ProjectListComponent implements OnInit, OnDestroy {

  projects: {projectId: string, projectname: string, created: string, owner: string}[];
  errorMessage: string;

  projectsSubscription: Subscription;

  constructor(private router: Router, private cognitoService: CognitoService, public authCheckService: AuthenticationCheckService,
    private gqlClientService: GqlClientService ) { }

ngOnDestroy() {
    this.projectsSubscription.unsubscribe();
  }

  ngOnInit() {
    this.errorMessage = null;
    this.getProjects();
  }


   getProjects() {
    try {
      this.projectsSubscription = this.gqlClientService.apolloClient.watchQuery({
        query: listProjects,
        pollInterval: 1000 * 60 * 10
      }).subscribe(({loading, data}) => {
        const projects: GProject[] = data['projects'];
     //   console.log(projects);
        console.log('yay!');
        this.projects = [];
        for (const project of projects) {
          this.projects.push({
            projectId: project.projectId,
            projectname: project.projectname,
            created: Sugar.Date.create(+project.created).toLocaleString(),
            owner: project.owner
          });
        }
      });
    } catch (err) {
      console.log('error while subscribing:');
      console.log(JSON.stringify(err, null, 2));
    }
  }

   onSelect(project: GProject) {
//      console.log(project);
       this.router.navigate(['/feat/project', project.projectId]);
  }

}
