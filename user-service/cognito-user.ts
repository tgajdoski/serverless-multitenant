'use strict';

import { CognitoIdentityServiceProvider } from 'aws-sdk';
import { randomBytes as cryptoRandomBytes } from 'crypto';

const cognitoIdentitySP = new CognitoIdentityServiceProvider();

export function setUserProperty(userName: string, userPool: string, propertyName: string, value: string) {
    return cognitoIdentitySP.adminUpdateUserAttributes({
        UserAttributes : [{
            Name: propertyName,
            Value : value
        }],
        Username: userName ,
        UserPoolId: userPool
    }).promise();
}

export function getUserProperty(userName: string, userPool: string, propertyName: string) {
    return new Promise((resolve, reject) => {
        cognitoIdentitySP.adminGetUser( { Username: userName, UserPoolId: userPool } ).promise()
        .then( (data) => {
            const newTenantNameAtt = data.UserAttributes.find(item => item.Name === propertyName );
            if (newTenantNameAtt) {
                const newTenantName = newTenantNameAtt.Value;
                resolve(newTenantName);
            } else {
                resolve(null);
            }
        }).catch((err) => {
            reject(err);
        });
    });
}

export function cleanUserProperty(userName: string, userPool: string, propertyName: string) {
    return cognitoIdentitySP.adminDeleteUserAttributes(
        {
            Username: userName,
            UserPoolId: userPool,
            UserAttributeNames: [propertyName]
        }).promise();
}

export function createUser(username, email, userPool, tenantId) {
    return cognitoIdentitySP.adminCreateUser({
        Username: username,
        UserPoolId: userPool,
        TemporaryPassword: "A1a-" + cryptoRandomBytes(12).toString('hex'),
        DesiredDeliveryMediums: ['EMAIL'],
        UserAttributes: [
            {
                Name: "email_verified",
                Value: "true"  },
            {
                Name: "email",
                Value: email },
            {
                Name: "custom:invitedTenantID",
                Value: tenantId }
        ]
    }).promise();
}
