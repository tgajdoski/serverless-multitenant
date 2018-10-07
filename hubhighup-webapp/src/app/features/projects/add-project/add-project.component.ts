import { Component, OnInit, ElementRef, ViewChild, Renderer} from '@angular/core';
import { Router } from '@angular/router';
import gql from 'graphql-tag';
import { CognitoService } from '../../../core/cognito.service';
import { GqlClientService } from '../../../core/gql-client.service';
import { ToastyService, ToastyConfig, ToastOptions } from 'ng2-toasty';
import { GProject, ProjectQueryArgs } from '../../../schemas/gql-interface';

@Component({
  selector: 'app-add-project',
  templateUrl: './add-project.component.html',
  styleUrls: ['./add-project.component.css']
})


export class AddProjectComponent implements OnInit {
  projectname: string;
  creatingProject: boolean;

  @ViewChild('myButt') button: ElementRef;

  constructor(private cognitoService: CognitoService, private router: Router, private toastyService: ToastyService,
    private toastyConfig: ToastyConfig, private renderer: Renderer, private gqlClientService: GqlClientService ) {
      this.toastyConfig.showClose = false;
      this.toastyConfig.theme = 'bootstrap';
      this.toastyConfig.timeout = 4000;
      this.toastyConfig.position = 'top-center';
  }

  ngOnInit() {
    console.log('add-project-components init-ed');
    this.creatingProject = false;
  }

  createproject() {
    this.renderer.invokeElementMethod(this.button.nativeElement, 'focus');
    this.creatingProject = true;
 //   console.debug('projectname: ' + this.projectname);

    this.gqlClientService.apolloClient.mutate({
      mutation: gql`
        mutation {
          createProject (projectname: "${this.projectname}"){
            projectId
            owner
            created
          }
        }
      `
    })
    .then( result => {
      console.log(result);
      this.creatingProject = false;
      const toastOptions: ToastOptions = {
          title: 'Project Created!',
          msg: 'Project ' + this.projectname + ' was succesfully created'
      };
      this.toastyService.success(toastOptions);
      this.projectname = null;
      console.log('project creation finished');
    })
    .catch( (err) => {
      this.creatingProject = false;
      console.log(err);
      const toastOptions: ToastOptions = {
          title: 'Whoops!',
          msg: err.message
      };
      this.toastyService.error(toastOptions);
    });
  }
}
