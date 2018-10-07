'use strict';
import { Lambda } from 'aws-sdk';
import { graphql, buildSchema } from 'graphql';
import { readFileSync } from 'fs';

import {
    Configuration, FileQueryArgs, FilesQueryArgs, GFile, GTenant, GUser,
    GetUploadAuthorizationMutationArgs, IAMCredentials, InitializationResult,
    InviteUserMutationArgs, Mutation, Query, UploadAuthorization, GProject, ProjectQueryArgs, CreateProjectMutationArgs
} from './schemas/gql-interface';

import * as gqlFS from './client-fileservice/gql-fs';
import * as gqlUS from './client-userservice/gql-us';
import * as gqlPS from './client-projectservice/gql-ps';

const lambdaService = new Lambda();
const userServiceLambdaAuth = 'arn:aws:lambda:us-west-2:418554112357:function:dev-user-service-gql';
const userServiceLambdaUnauth = 'arn:aws:lambda:us-west-2:418554112357:function:dev-user-service-config';
const fileServiceLambdaAuth = 'arn:aws:lambda:us-west-2:418554112357:function:dev-file-service-gql';
const projectServiceLambdaAuth = 'arn:aws:lambda:us-west-2:418554112357:function:dev-project-service-gql';


const gqlStringUserService = readFileSync('./schemas/merged-schema.gql', 'utf-8');
const schemaFacadeService = buildSchema(gqlStringUserService);

class RootResolver implements Query, Mutation {
    /**
     *
     * @param authenticated If true, call lambdas for authenticated user, else the ones for unauthenticated user
     */
    constructor(private authenticated: boolean) {
    }

    async inviteUser(inviteUserArgs: InviteUserMutationArgs, ctx: any): Promise<string> {
        const gql = gqlUS.gqlInviteUser(inviteUserArgs.email);
        const result = await callLambdaGQL(userServiceLambdaAuth, gql, ctx);
        const ret: string = result.inviteUser;
        return ret;
    }
    async initializeMe(_, ctx: any): Promise<InitializationResult> {
        const gql = gqlUS.gqlInitializeMe();
        const result = await callLambdaGQL(userServiceLambdaAuth, gql, ctx);
        const initResult: InitializationResult = result.initializeMe;
        return initResult;
    }
    async getUploadAuthorization(getUploadAuthorizationArgs: GetUploadAuthorizationMutationArgs,
        ctx: any): Promise<UploadAuthorization | null> {
        const gql = gqlFS.gqlUploadAuthorization(getUploadAuthorizationArgs.filename, getUploadAuthorizationArgs.parentId);
        const result = await callLambdaGQL(fileServiceLambdaAuth, gql, ctx);
        const authorization: UploadAuthorization = result.getUploadAuthorization;
        return authorization;
    }
    async users(_, ctx: any): Promise<Array<GUser>> {
        const gql = gqlUS.gqlGetUsers();
        const result = await callLambdaGQL(userServiceLambdaAuth, gql, ctx);
        const users: Array<GUser> = result.users;
        return users;
    }
    async config(_, ctx: any): Promise<Configuration | null> {
        const gql = gqlUS.gqlGetConfiguration();
        const result = await callLambdaGQL(userServiceLambdaUnauth, gql, ctx);
        const config: Configuration = result.config;
        return config;
    }
    async files(filesArgs: FilesQueryArgs, ctx: any): Promise<Array<GFile>> {
        const gql = gqlFS.gqlGetFiles(filesArgs.parentId);
        const result = await callLambdaGQL(fileServiceLambdaAuth, gql, ctx);
        const files: Array<GFile> = result.files;
        return files;
    }
    async file(fileArgs: FileQueryArgs, ctx: any): Promise<GFile | null> {
        try {
            const gql = gqlFS.gqlGetFile(fileArgs.fileId);
            const result = await callLambdaGQL(fileServiceLambdaAuth, gql, ctx);
            const file: GFile = result.file;
            return file;
        } catch (exc) {
            console.log(JSON.stringify(exc, null, 2));
        }
    }


     async projects(_, ctx : Object) : Promise < Array < GProject >> {
       try {
            const gql = gqlPS.gqlGetProjects()
            const result = await callLambdaGQL(projectServiceLambdaAuth, gql, ctx);
            const projects: Array <GProject> = result.projects;
            return projects;
        } catch (exc) {
            console.log(JSON.stringify(exc, null, 2));
        }
    }

    async project(projectArgs : ProjectQueryArgs, ctx : Object) : Promise < GProject | null > {
        try {
            const gql = gqlPS.gqlGetProject(projectArgs.projectId)
            const result = await callLambdaGQL(projectServiceLambdaAuth, gql, ctx);
            const project: GProject = result.project;
            return project;
        } catch (exc) {
            console.log(JSON.stringify(exc, null, 2));
        }
    }
    async createProject(createProjectArgs : CreateProjectMutationArgs, ctx : Object) : Promise < GProject | null > {
       try {
            const gql = gqlPS.gqlCreateProject(createProjectArgs.projectname)
            const result = await callLambdaGQL(projectServiceLambdaAuth, gql, ctx);
            const project: GProject = result.createProject;
            return project;
        } catch (exc) {
            console.log(JSON.stringify(exc, null, 2));
        }
    };
};

async function callLambdaGQL(lambdaArn: string, gql: string, ctx: any): Promise<any> {
    console.log("Invoking lambda: " + lambdaArn);
    console.log("GQL query:\n " + gql);
    ctx.body.query = gql;
    const payload = JSON.stringify(ctx);
    console.log("ctx:" + payload);
    const result = await lambdaService.invoke({
        FunctionName: lambdaArn,
        Payload: payload
    }).promise();
    console.log("lambda invocation result:");
    console.log(JSON.stringify(result, null, 2));
    if (result.StatusCode === 200) {
        const retPayload = JSON.parse(result.Payload.toString());
        if (retPayload.errors && retPayload.errors[0]) {
            const errMessage = retPayload.errors[0].message;
            console.log('message:' + errMessage);
            throw new Error(errMessage);
        } else {
            return retPayload.data;
        }
    } else {
        return new Error('Issue with invoking lambda. Lambda returned status code: ' + result.StatusCode);
    }
}

async function handler(event, context, callback, authenticated: boolean) {
    console.log(JSON.stringify(event, null, 2));
    console.log(JSON.stringify(context, null, 2));

    try {
        const gqlQuery = event.body.query;
        const gqlVariables = event.body.variables;
        const response = await graphql(schemaFacadeService, gqlQuery, new RootResolver(authenticated),
            event, gqlVariables);
        console.log(JSON.stringify(response, null, 2));
        callback(null, response);
    } catch (err) {
        console.log(JSON.stringify(err, null, 2));
        callback(err);
    }
}

function handle(event, context, callback) {
    return handler(event, context, callback, true);
}
function config(event, context, callback) {
    return handler(event, context, callback, false);
}


module.exports.handle = handle;
module.exports.config = config;
