'use strict';

import { DynamoDB } from "aws-sdk";
import { graphql, buildSchema } from 'graphql';
import { readFileSync } from 'fs';

import { Query, Mutation, GUser, InviteUserMutationArgs, InitializationResult, Configuration } from './schemas/userservice-types';

import { UserDAO } from './User';
import { TenantDAO} from './Tenant';

import { createUser } from './cognito-user';
import { getFedIdentity } from './cognito-federated';
import { TenantAssignmentModule } from './tenant-assignment';

import { _customMessage, _preSignUp, _newUserConfirmed } from './lambda-triggers';

const userDAO = new UserDAO(process.env.userDynDBTable, new DynamoDB.DocumentClient());
const tenantDAO = new TenantDAO(process.env.tenantDynDBTable, new DynamoDB.DocumentClient());
const userTenantWorkflow = new TenantAssignmentModule(userDAO, tenantDAO);

const gqlStringUserService = readFileSync('./schemas/userservice.gql', 'utf-8');
const schemaUserService = buildSchema(gqlStringUserService);

class RootUserService implements Query, Mutation {
    async users(_, ctx: GQLContext): Promise<GUser[]> {
        const dbUsers = await userDAO.getUsersByTenantId(ctx.tenantId);
        console.log(dbUsers);
        const returnUsers = new Array<GUser>();
        for (const dbUser of dbUsers) {
            if (dbUser.tenantId === ctx.tenantId) {
                const returnUser: GUser = {
                    userId: dbUser.userId,
                    username: dbUser.userName
                };
                returnUsers.push(returnUser);
            }
        }
        return returnUsers;
    }

    async inviteUser(inviteUserArgs: InviteUserMutationArgs, ctx: GQLContext): Promise<string> {
        const tenantId = ctx.tenantId;
        const email = inviteUserArgs.email;
        const userPool = process.env.cognitoUserPoolId;
        const username = email.replace(/[@.]/g, "-");
        await createUser(username, email, userPool, tenantId);
        return username;

    }

    async initializeMe(_, ctx: GQLContext): Promise<InitializationResult> {
        console.log("initialize me!");
        console.log(ctx);
        const userPool = process.env.cognitoUserPoolId;
        let tenantId = ctx.tenantId;

        if (tenantId) {
            const tt = await tenantDAO.getTenant(tenantId);
            return {initialized: true, newTenant: false, tenantName: tt.name};
        }

        try {
            const fedIdentityId = await getFedIdentity(ctx.region, userPool, ctx.accessIdToken, ctx.accountId);
            tenantId = await userTenantWorkflow.acceptTenant(fedIdentityId, ctx.username, userPool);
            if (!tenantId) {
                tenantId = await userTenantWorkflow.acceptNewTenant(fedIdentityId, ctx.username, userPool);
            }
            if (!tenantId) {
                return { initialized: false, newTenant: false, tenantName: '' };
            } else {
                const tt = await tenantDAO.getTenant(tenantId);
                return { initialized: true, newTenant: true, tenantName: tt.name };
            }
        } catch (exc) {
            console.log(exc);
            return { initialized: true, newTenant: true, tenantName: ''};
        }
    }

    async config(_, ctx: GQLContext): Promise<Configuration> {
        const config: Configuration = {
            identityPoolId: process.env.cognitoIdentityPoolId,
            userPoolClientAppId: process.env.cognitoPoolClientId,
            userPoolId: process.env.cognitoUserPoolId
        };
        return config;
    }
};

class RootUserServiceUnauth implements Query, Mutation {
    async config(_, ctx: GQLContext): Promise<Configuration> {
        const config: Configuration = {
            identityPoolId: process.env.cognitoIdentityPoolId,
            userPoolClientAppId: process.env.cognitoPoolClientId,
            userPoolId: process.env.cognitoUserPoolId
        };
        return config;
    }
    async initializeMe(_, ctx: GQLContext): Promise<InitializationResult> { return null; }
    async inviteUser(inviteUserArgs: InviteUserMutationArgs, ctx: GQLContext): Promise<string> { return null; }
    async users(_, ctx: GQLContext): Promise<GUser[]> { return null; }
};


export class GQLContext {
    constructor(public fedIdentity: string, public tenantId: string,
        public email: string, public username: string, public accessIdToken: string,
        public region: string, public accountId: string) { }
}

async function handle(event, context, callback) {
    console.log(JSON.stringify(event, null, 2));
    console.log(JSON.stringify(context, null, 2));

    const executionContext = new GQLContext(
        event.cognitoPoolClaims.federatedID,
        event.cognitoPoolClaims.tenantID,
        event.cognitoPoolClaims.email,
        event.cognitoPoolClaims.username,
        event.headers.Authorization,
        getRegion(context), getAccountId(context));

    const gqlQuery = event.body.query;
    const gqlVariables = event.body.variables;

    try {
        const response = await graphql(schemaUserService, gqlQuery, new RootUserService(), executionContext, gqlVariables);
        console.log(JSON.stringify(response, null, 2));
        callback(null, response);
    } catch (err) {
        console.log(JSON.stringify(err, null, 2));
        callback(err);
    }
}

async function config(event, context, callback) {
    console.log(JSON.stringify(event, null, 2));
    console.log(JSON.stringify(context, null, 2));
    console.log(JSON.stringify(process.env, null, 2));

    const gqlQuery = event.body.query;

    try {
        const response = await graphql(schemaUserService, gqlQuery, new RootUserServiceUnauth());
        console.log(JSON.stringify(response, null, 2));
        callback(null, response);
    } catch (err) {
        console.log(JSON.stringify(err, null, 2));
        callback(err);
    }
}


function getAccountId(context) {
    return context.invokedFunctionArn.split(':')[4];
}

function getRegion(context) {
    return context.invokedFunctionArn.split(':')[3];
}

export function preSignUp(event, context, callback ) {
    return _preSignUp(event, context, callback);
}

export function newUserConfirmed(event, context, callback) {
    return _newUserConfirmed(event, context, callback);
}

export function customMessage(event, context, callback) {
    return _customMessage(event, context, callback);
}
module.exports.handle = handle;
module.exports.config = config;
module.exports.preSignUp = preSignUp;
module.exports.newUserConfirmed = newUserConfirmed;
module.exports.customMessage = customMessage;
