'use strict';

import { CognitoIdentity } from "aws-sdk";

export async function getFedIdentity(region, userPool, identityToken, accountId) {
    const identityProvider = getCognitoIdpURL(region, userPool);
    const logins = {
        [identityProvider] : identityToken
    };
    const params = {
        IdentityPoolId: process.env.cognitoIdentityPoolId, // the federated identity pool comes from an env. variable
        AccountId: accountId, // our AWS account
        Logins: logins
    };
    console.log("now to call getid %s", JSON.stringify(params, null, 2));
    const data = await new CognitoIdentity().getId(params).promise();
    return data.IdentityId;
}

function getCognitoIdpURL(region, userPoolId) {
    return 'cognito-idp.' + region.toLowerCase() + '.amazonaws.com/' + userPoolId;
}
