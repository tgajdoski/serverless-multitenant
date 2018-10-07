## Api Gateway Name Resolver Plugin for Serverless
### Description

The plugin allows you to introduce dependencies on the API GW creation

### Instructions

- Place the `aws-api-gateway-name-resolver` folder into the `.serverless_plugins` folder of your project.
- Add the following to your `serverless.yml` file (at root level, i.e. no indentation)

```
plugins:
  - aws-api-gateway-name-resolver
```

- Within your sls template use something like following code snippet in resources that need to be created after API Gateway creation

```
  DependsOn: "###ApiGW###"         
```

### What does it do

The plugin will modify the `###ApiGW###` string to the actual name of the API GW within the CFN created by serverless.
