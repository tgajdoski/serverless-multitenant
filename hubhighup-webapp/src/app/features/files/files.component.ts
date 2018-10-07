import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'apollo-client';
import {Router, ActivatedRoute, Params} from '@angular/router';
import { GqlClientService } from '../../core/gql-client.service';
import { AuthenticationCheckService } from '../../core/authentication-check.service';
import { CognitoService } from '../../core/cognito.service';
import { S3 } from 'aws-sdk';
import { GFile, UploadAuthorization } from '../../schemas/gql-interface';
import gql from 'graphql-tag';

declare function require(moduleName: string): any;
const filesize = require('filesize');
import * as Sugar from 'sugar';

let projectId = null;

const listFiles = gql`
query {
  files {
    fileId
    owner
    signedUrl
    lastModified
    size
    filename
  }
}
`;

@Component({
  selector: 'app-files',
  templateUrl: './files.component.html',
  styleUrls: ['./files.component.css']
})
export class FilesComponent implements OnInit, OnDestroy {
  s3files: {filename: string, fileKey: string,  fileUrl: string, size: string,
     lastModified: string, uploaded: boolean, owner: string}[];
  uploadingFiles: {file: File, upload: AWS.S3.ManagedUpload, percentFinished: number, uploaded: boolean}[];
  errorMessage: string;
  s3Ref: S3 = new S3();

  filesSubscription: Subscription;


  constructor(private activatedRoute: ActivatedRoute, private cognitoService: CognitoService, public authCheckService: AuthenticationCheckService,
    private gqlClientService: GqlClientService) {  }

  openFile(url: string) {
    window.open(url);
  }

  ngOnDestroy() {
    this.filesSubscription.unsubscribe();
  }

  ngOnInit() {
    this.uploadingFiles = [];
    this.errorMessage = null;

     this.activatedRoute.params.subscribe((params: Params) => {
     projectId = params['projectId'];
     console.log(projectId);
     //    projectId = 'e0fa3d52-0744-4118-a287-8238adf67084';
     this.getFiles(projectId);
      });

  }

  getFiles(parentId: String) {
    try {
      this.filesSubscription = this.gqlClientService.apolloClient.watchQuery({
        query: listFiles,
        variables: {
          parentId: parentId
        },
        pollInterval: 1000 * 60 * 10
      }).subscribe(({loading, data}) => {
        const files: GFile[] = data['files'];
        console.log('yay!');
        this.s3files = [];
        for (const file of files) {
          this.s3files.push({
            filename: file.filename,
            fileKey: file.fileId,
            fileUrl: file.signedUrl,
            size: filesize(file.size),
            lastModified: Sugar.Date.create(file.lastModified).toLocaleString(),
            //    lastModified: file.lastModified,
            uploaded: false,
            owner: file.owner
          });
        }
        return this.s3files;
      });
    } catch (err) {
      console.log('error while subscribing:');
      console.log(JSON.stringify(err, null, 2));
    }
  }

  uploadThingy(file: File, parentIdparam: string) {
      if (!parentIdparam){
          parentIdparam = null;
      }
    this.gqlClientService.apolloClient.mutate({
      mutation: gql`
        mutation {
           getUploadAuthorization(filename: "${file.name}", parentId: "${parentIdparam}" ) {
            credentials {
              accessKey
              secretAccessKey
              sessionToken
            }
            fileId
            fileBucket
            parentId
          }
        }
      `})
    .then( ({data}) => {
      const result: UploadAuthorization = data['getUploadAuthorization'];
      console.log(JSON.stringify(result, null, 2));
      const creds = result.credentials;
      const bucket = result.fileBucket;
      const filename = result.fileId;
      const parentId = result.parentId;
       console.log(parentId);
      // s3 client will use the temporary credentials for the upload
      const bucketS3Service = new S3({
        credentials: {
          accessKeyId: creds.accessKey,
          secretAccessKey: creds.secretAccessKey,
          sessionToken: creds.sessionToken
        },
        s3BucketEndpoint: true,
        endpoint: `${bucket}.s3.amazonaws.com`
      });
      const upload = new S3.ManagedUpload( {
        service: bucketS3Service,
        queueSize: 1,
        params: {
          Bucket: bucket,
          Key: filename,
          Body: file,
          ContentType: file.type
        }
      });
      const uploadFile = { file: file, upload: upload, percentFinished: 0, uploaded: false};
      this.uploadingFiles.push(uploadFile);

      upload.on('httpUploadProgress', (evt) => {
        uploadFile.percentFinished = Math.floor(evt.loaded * 100 / evt.total);
        console.log('Progress:', evt.loaded, '/', evt.total);
      });
      upload.promise().then( (data2) => {
        uploadFile.uploaded = true;
        console.log(data2);
      }).catch( (err) => {
        console.log(JSON.stringify(err, null, 2));
      });
    })
    .catch( (err) => {
      console.log(JSON.stringify(err, null, 2));
    });
  }

  s3Upload(e: any) {
    const files: FileList = e.dataTransfer ? e.dataTransfer.files : e.target.files;
    if (!files) {
      return;
    }
    console.log(files);
       console.log(projectId);
    console.log('let the uploads begin');
    for (let i = 0; i < files.length; i++) {
      this.uploadThingy(files[i], projectId);
    }
  }
}
