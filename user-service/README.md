## Deploying to AWS

Run `sls deploy` to upload the product to the API Gateway

### Prerequisites

   - Make sure that you have initialized things using `setup` script in `base`
   - At least once, and then after any dependencies change in `package.json` 
   run `npm install` to make sure dependencies are updated

### 


## Running tests on CI

npm test

*all the tests are currently deactived, there is just one default test which will pass*

## Testing while doing local development ##
 
 Do once:
 - Install DynamoDb local: `sls dynamodb install`
 - Start DynamoDb: `sls dynamodb start`
 
 Once DynamoDB is setup

- start on change tests with `npm run test-local`