'use strict';

const BbPromise = require('bluebird');
const fs = require('fs');
const path = require('path');

class AwsNestedStacksExtension {

	constructor(serverless, options) {
    this.serverless = serverless;
    this.options = options;
    this.provider = this.serverless.getProvider('aws');

    this.deployNestedStacks = this.deployNestedStacks.bind(this);
    this.uploadFile = this.uploadFile.bind(this);
    this.traverseJSON = this.traverseJSON.bind(this);


    this.hooks = {
      'before:deploy:deploy': this.deployNestedStacks,
    };
  }

  deployNestedStacks() {
    this.serverless.cli.log(`Deploy nested stacks`);

    if (this.options.noDeploy) {
      return BbPromise.resolve();
    }
    
    const nestedStacksPath = path.join(this.serverless.config.servicePath, 'nested-stacks');
    this.serverless.cli.log(`Checking for nested stacks in ${nestedStacksPath}`);
    if (!fs.existsSync(nestedStacksPath)) {
      return BbPromise.resolve();
    }

    return new BbPromise((resolve, reject) => {
      this.provider.getServerlessDeploymentBucketName(this.options.stage, this.options.region)
      .then((bucketName) => {
        this.bucketName = bucketName;
        this.s3Path = `${bucketName}/${this.serverless.service.package.artifactDirectoryName}`
        this.serverless.cli.log(`Uploading nested stacks to bucket: ${this.bucketName}`);
        
        //walk through the JSON structure, and if any key contains ###path### replace it with the absolute path
        this.traverseJSON(this.serverless.service.resources);
        this.traverseJSON(this.serverless.service.provider.compiledCloudFormationTemplate);

        const nestedStacksPaths = this.serverless.utils.walkDirSync(nestedStacksPath);
        return BbPromise.all(
          nestedStacksPaths.map(stackPath => 
            this.uploadFile(stackPath, stackPath.replace(nestedStacksPath, '').replace('\\', '/'))
          )
        )
      })
      .then( () => {
        return BbPromise.delay(10);
      })
      .then( () => resolve() )
      .catch( err => {
        reject(err);
      })
    });
  }

  uploadFile(artifactFilePath, relativeUploadPath) {
    if (!artifactFilePath) {
      throw new this.serverless.classes.Error('artifactFilePath was not supplied');
    }

    this.serverless.cli.log(`Uploading nested stack ${artifactFilePath} to ${this.serverless.service.package.artifactDirectoryName}${relativeUploadPath}`);

    const body = fs.readFileSync(artifactFilePath); 

    const params = {
      Bucket: this.bucketName,
      Key: `${this.serverless.service.package.artifactDirectoryName}${relativeUploadPath}`,
      Body: body,
      ContentType: 'application/json',
    };

    return this.provider.request('S3',
      'putObject',
      params,
      this.options.stage,
      this.options.region);
  }

  traverseJSON(jsonNode) {
    for (var childNode in jsonNode) {
      if (childNode==="TemplateURL") {
        let newValue = jsonNode[childNode].replace('###path###', this.s3Path);
        jsonNode[childNode] = newValue;
      }
      if (jsonNode[childNode] !== null && typeof(jsonNode[childNode])=="object") {
        this.traverseJSON(jsonNode[childNode]);
      }
    }
  }


}

module.exports = AwsNestedStacksExtension;