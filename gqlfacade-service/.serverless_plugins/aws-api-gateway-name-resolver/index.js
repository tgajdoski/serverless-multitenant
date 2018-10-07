'use strict';

const BbPromise = require('bluebird');

class AwsApiGWNameExtension {

	constructor(serverless, options) {
    this.serverless = serverless;
    this.options = options;
    this.provider = this.serverless.getProvider('aws');

    this.resolveApiGWName = this.resolveApiGWName.bind(this);
    this.findAPIGWName = this.findAPIGWName.bind(this);
    this.replacePlaceholder = this.replacePlaceholder.bind(this);

    this.hooks = {
      'before:deploy:deploy': this.resolveApiGWName,
    };
  }

  resolveApiGWName() {
    this.serverless.cli.log(`Check for ApiGateway dependencies...`);
    let foundApiGWRealName = this.findAPIGWName(null, this.serverless.service.provider.compiledCloudFormationTemplate);
    if (foundApiGWRealName) {
      this.replacePlaceholder(this.serverless.service.resources, foundApiGWRealName);
    }
    return BbPromise.resolve();
  }

  findAPIGWName(childNodeName, childNodeObject) {
    if (childNodeObject["Type"]==='AWS::ApiGateway::Deployment') {
      return childNodeName;
    }
    for (let childNode in childNodeObject) {
      let childObject = childNodeObject[childNode];
      if (childObject && typeof(childObject)=="object") {
        let found = this.findAPIGWName(childNode, childObject);
        if (found) return found;
      }
    }
    return null;
  }

  replacePlaceholder(jsonNode, replaceWith) {
    for (var childNode in jsonNode) {
      if (childNode==="DependsOn" && typeof(jsonNode[childNode])=="string") {
        let newValue = jsonNode[childNode].replace('###ApiGW###', replaceWith);
        jsonNode[childNode] = newValue;
      }
      if (jsonNode[childNode] !== null && typeof(jsonNode[childNode])=="object") {
        this.replacePlaceholder(jsonNode[childNode], replaceWith);
      }
    }
  }
}

module.exports = AwsApiGWNameExtension;