'use strict';


import {graphql, buildSchema} from 'graphql';
import {readFileSync} from 'fs';
import {Query, Mutation, GProject, ProjectQueryArgs, CreateProjectMutationArgs} from './schemas/projectservice-types';
import {Project, ProjectDAO} from './Project';
import {DynamoDB} from 'aws-sdk';
const uuid = require('uuid');

const gqlString = readFileSync('./schemas/projectservice.gql', 'utf-8');
const schema = buildSchema(gqlString);
const docClient = new DynamoDB.DocumentClient();

const pDAO = new ProjectDAO(process.env.projectDynDBTable, docClient);


class ImplRoot implements Query,
Mutation {

    async projects(_, ctx : GQLContext) : Promise < Array < GProject >> {
        const projects = await pDAO.getProjectsByTenantId(ctx.tenantId);
        return projects;
    }

    async project(projectArgs : ProjectQueryArgs, ctx : GQLContext) : Promise < GProject | null > {
        const project = await pDAO.getProject(projectArgs.projectId, ctx.tenantId);
        return project;
    }
    async createProject(createProjectArgs : CreateProjectMutationArgs, ctx : GQLContext) : Promise < GProject | null > {
        const pid: string = uuid.v4();
        await pDAO.createProject(ctx.tenantId, pid, createProjectArgs.projectname, new Date().getTime().toString() , ctx.username );
        const q = await pDAO.getProject(pid, ctx.tenantId);
        return q;
    };
}

export class GQLContext {
    constructor(public fedIdentity : string, public tenantId : string, public email : string, public username : string) {}
}

async function handle(event, context, callback) {
    console.log(JSON.stringify(event, null, 2));
    console.log(JSON.stringify(context, null, 2));

    const executionContext = new GQLContext(event.cognitoPoolClaims.federatedID, event.cognitoPoolClaims.tenantID, event.cognitoPoolClaims.email, event.cognitoPoolClaims.username);

    if (!event.cognitoPoolClaims.tenantID || !event.cognitoPoolClaims.federatedID) {
        throw 'Unidentified caller';
    }

    const gqlQuery = event.body.query;
    const gqlVariables = event.body.variables;

    try {
        const response = await graphql(schema, gqlQuery, new ImplRoot(), executionContext, gqlVariables);
        console.log(JSON.stringify(response, null, 2));
        callback(null, response);
    } catch (err) {
        console.log(JSON.stringify(err, null, 2));
        callback(err);
    }
}

module.exports.handle = handle;
