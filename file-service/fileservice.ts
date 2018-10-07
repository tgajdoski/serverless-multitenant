'use strict';

import { FileDAO, File } from './File';
import { S3, DynamoDB, STS, CloudFront } from 'aws-sdk';
import { Client } from 'elasticsearch';

const uuid = require('uuid');
const sts = new STS();
const s3 = new S3();
const docClient = new DynamoDB.DocumentClient();

const esInstanceHOST: string = process.env.esInstance;


const fileDAO = new FileDAO(process.env.fileDynDBTable, docClient);
const filesURL = process.env.filesURL;

export class SignedAccess {
    signedUrl?: string;
}

export type FileWithAccess = File & SignedAccess;

export async function getUploadAuthorization(filename: string, tenantId: string, fedIdentityId: string, parentId: string):
    Promise<{credentials: STS.Credentials, bucket: string, fileId: string, parentId: string}> {

    const mediaBucket: string = process.env.theFileBucket;
    const s3RoleArn = process.env.theBaseS3Role;

    const fileId: string = uuid.v4();

    // if parentId is not provided, use tenant as a parent of the file
    if (!parentId) {
        parentId = tenantId;
    }

    await fileDAO.createFile(fileId, filename, parentId, tenantId, null, null, false, false, fedIdentityId);
    console.log("will call assume role for fileid:" + fileId);
    const credentialsData = await sts.assumeRole({
            DurationSeconds: 900,
            RoleArn: s3RoleArn,
            Policy: `{
                "Version": "2012-10-17",
                "Statement": [
                    {
                        "Sid": "AllowBucketAccess",
                        "Action": [
                            "s3:*"
                        ],
                        "Effect": "Allow",
                        "Resource": [
                            "arn:aws:s3:::${mediaBucket}/${fileId}"
                        ]
                    }
                ]
            }`,
            RoleSessionName: `role_temp_stsassigned`
        }).promise();
    console.log("sts returned credentials");
    const credentials = credentialsData.Credentials;

    console.log({credentials, bucket: mediaBucket, fileId, parentId});
    return ({credentials, bucket: mediaBucket, fileId, parentId});
}

export async function listFiles(parentId: string) {
    const files: FileWithAccess[] = await fileDAO.getFilesByParentId(parentId);
    const data = await s3.getObject(
            {
                Bucket: "com.hubhighup.deploymentkeys",
                Key: "cf-acc-keys.json"
            }
        ).promise();
    const accessFileIdBody = data.Body.toString();
    const object = JSON.parse(accessFileIdBody);
    const accessId = object.AccessId;
    const privateKeyBody = object.PrivateKey;
    const signer = new CloudFront.Signer(accessId, privateKeyBody);
    // presigned CF URLs are good for the next 15 minutes:
    const utcTS = Math.floor((new Date()).getTime() / 1000) + 15 * 60;

    for (const file of files) {
        const signedURL = signer.getSignedUrl({
            url: filesURL + file.fileId,
            expires: utcTS
        });
        file.signedUrl = signedURL;
    }

    return files;
}

export async function _fileUploaded(event, context, callback) {
    console.log(JSON.stringify(event, null, 2));
    console.log(JSON.stringify(context, null, 2));

    const fileBucket: string = process.env.theFileBucket;
    const filesAdded = [];

    // gather all the SNS events originating from an s3 bucket
    if (event.Records) {
        for (const snsEvent of event.Records) {
            if (snsEvent.EventSource === "aws:sns") {
                const msgTxt = snsEvent.Sns.Message;
                const msg = JSON.parse(msgTxt);
                if (msg.Records) {
                    for (const s3Event of msg.Records) {
                        // make sure the events are from the designated file bucket
                        if (s3Event.eventSource === "aws:s3" && s3Event.s3.bucket.name === fileBucket ) {
                            filesAdded.push({ key: s3Event.s3.object.key, size: s3Event.s3.object.size});
                        }
                    }
                }
                console.log(JSON.stringify(msg, null, 2));
            }
        }
    }

    const promises = filesAdded.map(fileAdded => {
            const fileKey = fileAdded.key;
            const size = fileAdded.size;
            return fileDAO.getFilesByFileId(fileKey)
            .then( files =>
                fileDAO.updateFile(fileKey, undefined, undefined, files[0].tenantId, size,
                            new Date().getTime(), undefined, true, undefined)
            );
    });

    try {
        await Promise.all(promises);
        callback(null, {});
    } catch (err) {
        callback(err);
    }
}

export async function _fileMetadataHandler(event, context, callback) {
    console.log(JSON.stringify(event, null, 2));
    console.log(JSON.stringify(context, null, 2));

    const mdFileBucket: string = process.env.theMDFileBucket;
    const filesAdded: Array<string> = [];

    // gather all the SNS events originating from an s3 bucket
    if (event.Records) {
        for (const snsEvent of event.Records) {
            if (snsEvent.EventSource === "aws:sns") {
                const msgTxt = snsEvent.Sns.Message;
                const msg = JSON.parse(msgTxt);
                if (msg.Records) {
                    for (const s3Event of msg.Records) {
                        // make sure that the events are from the designated metadata bucket
                        if (s3Event.eventSource === "aws:s3" && s3Event.s3.bucket.name === mdFileBucket) {
                            filesAdded.push( s3Event.s3.object.key);
                        }
                    }
                }
                console.log(JSON.stringify(msg, null, 2));
            }
        }
    }

    const promises = filesAdded.map(fileAdded => {
        if (fileAdded.endsWith('.tika.extract')) {
            const key = fileAdded.slice(0, fileAdded.lastIndexOf('.tika.extract'));
            console.log('will index doc with key:' + key);
            return fileDAO.getFilesByFileId(key)
            .then( files => {
                return indexDoc(mdFileBucket, fileAdded, key, files[0].filename, files[0].tenantId);
            });
        } else {
            return Promise.resolve();
        }
    });

    try {
        await Promise.all(promises);
        callback(null, {});
    } catch (err) {
        callback(err);
    }
}

async function indexDoc(bucketName: string, metadataFile: string, id: string, originalFilename: string, tenantId: string) {
    const s3File = await s3.getObject({
        Bucket: bucketName,
        Key: metadataFile,
    }).promise();
    const parsedBody = JSON.parse(s3File.Body.toString());
    const text = parsedBody.Text;
    const contentType: string = parsedBody['ContentType'];
    let primaryCT = '';
    let secondaryCT = '';
    if (contentType) {
        const ctList = contentType.split('/');
        if (ctList.length === 2) {
            primaryCT = ctList[0];
            secondaryCT = ctList[1];
        }
    }
    const esClient: Client = require('elasticsearch').Client({
        connectionClass: require('http-aws-es'),
        hosts: esInstanceHOST,
        amazonES: {
            region: process.env.AWS_REGION,
            credentials: s3.config.credentials
        }
    });
    const indexThis = await esClient.index({
        index: 'documents',
        type: 'text-docs',
        id: id,
        body: {
            filename: originalFilename,
            contentTypePrimary: primaryCT,
            contentTypeSecondary: secondaryCT,
            tenantId: tenantId,
            text: text
        }});
    console.log('indexing result:' + JSON.stringify(indexThis, null, 2));
}
