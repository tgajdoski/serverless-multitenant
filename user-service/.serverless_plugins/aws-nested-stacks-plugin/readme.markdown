## Nested Stacks Plugin for Serverless
### Description

The plugin allows you to deploy nested CFN templates along with the serverless template.

### Instructions

- Place the `aws-nested-stacks` folder into the `.serverless_plugins` folder of your project.
- Add the following to your `serverless.yml` file (at root level, i.e. no indentation)

```
plugins:
  - aws-nested-stacks-plugin
```

- Create a `nested-stacks` folder in same place where your serverless.yml file is
- Place the files of your CFN nested stack  templates inside that folder
- Within your sls template use something like following code snippet. Note that part of the URL is replaced with `###path###` string.


```
    cognitoFormStack:
      Type: AWS::CloudFormation::Stack
      Properties:
        TemplateURL: 'https://s3-${self:custom.myRegion}.amazonaws.com/###path###/nested-stack-file.cform'
```

### What does it do

The plugin will upload all the CFN templates from the `nested-stacks` folder to the same folder where the serverless
deploy files are uploaded.
It will also modify the `###path###` string to point to that S3 folder.
