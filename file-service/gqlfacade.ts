'use strict';

import { graphql, buildSchema } from 'graphql';
import { readFileSync } from 'fs';
import { Query, Mutation, GFile, FileQueryArgs, FilesQueryArgs, GetUploadAuthorizationMutationArgs,
    UploadAuthorization} from './schemas/fileservice-types';
import { listFiles, getUploadAuthorization, _fileUploaded, _fileMetadataHandler } from './fileservice';

const gqlString = readFileSync('./schemas/fileservice.gql', 'utf-8');
const schema = buildSchema(gqlString);

class ImplRoot implements Query, Mutation {

    async files(filesArgs: FilesQueryArgs, ctx: GQLContext): Promise<GFile[]> {
        let parentId: string = filesArgs.parentId;
        if (!parentId) {
            parentId = ctx.tenantId;
        }

        let returnFiles: Array<GFile>;
        try {
            const childFiles = await listFiles(parentId);
            returnFiles =
                childFiles
                .filter(childFile => childFile.tenantId === ctx.tenantId && childFile.uploaded)
                .map(childFile => ({
                    fileId: childFile.fileId,
                    filename: childFile.filename,
                    signedUrl: childFile.signedUrl,
                    isContainer: childFile.isContainer,
                    lastModified: new Date(childFile.lastModified).toISOString(),
                    owner: childFile.owner,
                    parentId: childFile.parentId,
                    size: childFile.size,
                    uploaded: childFile.uploaded
                }));
        } finally {
            return returnFiles;
        }
    }

    async file(fileArgs: FileQueryArgs, ctx: GQLContext): Promise<GFile> {
        return null;
    }

    async getUploadAuthorization(uploadAuthorizationArgs: GetUploadAuthorizationMutationArgs,
        ctx: GQLContext): Promise<UploadAuthorization> {
        const authorization = await getUploadAuthorization(uploadAuthorizationArgs.filename, ctx.tenantId,
            ctx.fedIdentity, uploadAuthorizationArgs.parentId);
        const ua: UploadAuthorization = {
            credentials: {
                accessKey: authorization.credentials.AccessKeyId,
                secretAccessKey: authorization.credentials.SecretAccessKey,
                sessionToken: authorization.credentials.SessionToken
            },
            fileBucket: authorization.bucket,
            fileId: authorization.fileId,
            parentId: authorization.parentId
        };
        return ua;
    }
};


export class GQLContext {
    constructor(public fedIdentity: string, public tenantId: string, public email: string, public username: string) { }
}

async function handle(event, context, callback) {
    console.log(JSON.stringify(event, null, 2));
    console.log(JSON.stringify(context, null, 2));

    const executionContext = new GQLContext(
        event.cognitoPoolClaims.federatedID,
        event.cognitoPoolClaims.tenantID,
        event.cognitoPoolClaims.email,
        event.cognitoPoolClaims.username);

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


function fileUploaded(event, context, callback) {
    return _fileUploaded(event, context, callback);
}

function fileMetadataHandler(event, context, callback) {
    return _fileMetadataHandler(event, context, callback);
}

module.exports.handle = handle;
module.exports.fileUploaded = fileUploaded;
module.exports.fileMetadataHandler = fileMetadataHandler;
