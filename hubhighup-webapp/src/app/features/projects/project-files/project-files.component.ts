
import { Component, OnInit, OnDestroy } from '@angular/core';
import {Router, ActivatedRoute, Params} from '@angular/router';
import { AuthenticationCheckService } from '../../../core/authentication-check.service';
import { GqlServiceService } from '../../gql-service.service';

import gql from 'graphql-tag';


declare function require(moduleName: string): any;
const filesize = require('filesize');
import * as Sugar from 'sugar';

let projectId = null;

@Component({
  selector: 'app-project-files',
  templateUrl: './project-files.component.html',
  styleUrls: ['./project-files.component.css'],
  providers: [GqlServiceService]
})

export class ProjectFilesComponent implements OnInit, OnDestroy {

 s3files: {filename: string, fileKey: string,  fileUrl: string, size: string,
  lastModified: string, uploaded: boolean, owner: string}[];

  constructor(private activatedRoute: ActivatedRoute, public authCheckService: AuthenticationCheckService, private gqlservice: GqlServiceService ) {  }

  openFile(url: string) {
    window.open(url);
  }

  ngOnDestroy() {
    this.gqlservice.filesSubscription.unsubscribe();
  }

  ngOnInit() {
    this.gqlservice.uploadingFiles = [];
    this.gqlservice.errorMessage = null;

     this.activatedRoute.params.subscribe((params: Params) => {
     projectId = params['projectId'];

      console.log(" prakam "  + projectId);

    // var projectfiles = this.gqlservice.getFiles(projectId, function(res){
    //     this.s3files = this.gqlservice.s3files;
    // }); 


   // CALLBACK kako da cekam od servisot
      this.s3files = [];
      this.gqlservice.getFiles(projectId);
      this.s3files = this.gqlservice.s3files;
      });
  }

  s3Upload(e: any) {
    const files: FileList = e.dataTransfer ? e.dataTransfer.files : e.target.files;
    if (!files) {
      return;
    }
    console.log(files);
    console.log('let the uploads begin');
    for (let i = 0; i < files.length; i++) {
      this.gqlservice.uploadThingy(files[i], projectId);
    }
  }
}
