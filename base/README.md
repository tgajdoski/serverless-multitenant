
# Instructions

## Do Once

You need to have AWS CLI installed and set up

Execute CloudFormation scripts for all the Buckets/Cloudfront/Route53 we use.
Each of these exports the resources in question, so they can be imported in other CloudFormation stacks.

TODO: Plan is to have at least three of those - prod, staging and dev.
The Dev are reused by all dev stages. 

### Bucket for logs 
(other resources will reference it through Cross-Stack references:

```
aws s3 cp base-accesslogs-dev.cfn.json s3://hubhighup.cloudformation.templates
aws cloudformation create-stack --stack-name baseLogsDev --template-url https://s3-us-west-2.amazonaws.com/hubhighup.cloudformation.templates/base-accesslogs-dev.cfn.json
```

### Resources for the UI

```
aws s3 cp base-ui-dev.cfn.json s3://hubhighup.cloudformation.templates
aws cloudformation create-stack --stack-name baseUIDev --template-url https://s3-us-west-2.amazonaws.com/hubhighup.cloudformation.templates/base-ui-dev.cfn.json
```

FIXME: IPv6 support needs to be turned on manually!

### Resources for the file-service

```
aws s3 cp base-file-dev.cfn.json s3://hubhighup.cloudformation.templates
aws cloudformation create-stack --stack-name baseFilesDev --template-url https://s3-us-west-2.amazonaws.com/hubhighup.cloudformation.templates/base-file-dev.cfn.json --capabilities CAPABILITY_NAMED_IAM
```


### for modification, change "create-stack" to "update-stack":

```
Logs:
aws cloudformation update-stack --stack-name baseLogsDev --template-url https://s3-us-west-2.amazonaws.com/hubhighup.cloudformation.templates/base-accesslogs-dev.cfn.json
UI:
aws cloudformation update-stack --stack-name baseUIDev --template-url https://s3-us-west-2.amazonaws.com/hubhighup.cloudformation.templates/base-ui-dev.cfn.json
Files:
aws cloudformation update-stack --stack-name baseFilesDev --template-url https://s3-us-west-2.amazonaws.com/hubhighup.cloudformation.templates/base-file-dev.cfn.json --capabilities CAPABILITY_NAMED_IAM
```


## Do For Each Dev stages

Change the `stage` variable within `setup.js` , and then execute it:
```
node setup.js
```

## Do For Prod and Staging stages

TODO: ....