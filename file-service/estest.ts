import { Client } from 'elasticsearch';
import { S3 } from 'aws-sdk';
const HOST = 'search-hubhighup-es-2acknamy5rhlvcgnykzomsntde.us-west-2.es.amazonaws.com';

const awscred = require('awscred');


/**
 * A script for playing with ES, uses locally configured credentials
 * Start using ts-node:
 * ```
 * ts-node estest.ts
 * ```
 */
async function createIndices() {
    const promiseForClient = new Promise<Client>((resolve, reject) => {
        awscred.load((err, data) => {
            if (err) {
                reject(err);
            } else {
                const cl: Client = require('elasticsearch').Client({
                    connectionClass: require('http-aws-es'),
                    hosts: HOST,
                    amazonES: {
                        region: data.region,
                        accessKey: data.credentials.accessKeyId,
                        secretKey: data.credentials.secretAccessKey
                    }
                });
                resolve(cl);
            }
        });
    });
    const cl = await promiseForClient;

    // check if the index exists
    const indexExists = await cl.indices.exists({
        index: 'documents'
    });
    if (!indexExists) {
        console.log(`Index 'documents' doesn't exist. Creating...`);
        await cl.indices.create({
            index: 'documents'
        });
    }

    // check if the type exists
    const typeExists = await cl.indices.existsType({
        type: 'text-docs',
        index: 'documents'
    });
    if (!typeExists) {
        console.log(`Type 'text-docs' doesn't exist. Creating...`);
        await cl.indices.putMapping({
            index: 'documents',
            type: 'text-docs',
            body: {
                properties: {
                    tenantId: {
                        type: "keyword"
                    },
                    filename: {
                        type: "keyword"
                    },
                    contentTypePrimary: {
                        type: "keyword"
                    },
                    contentTypeSecondary: {
                        type: "keyword"
                    },
                    text: {
                        type: "text"
                    }
                }
            }
        });
    }

    // list the indices
    const indices = await cl.indices.get({
        index: 'documents',
        human: true
    });
    // const jsonInd = JSON.parse(indices);
    console.log('indices:\n' + JSON.stringify(indices, null, 2));

    // let's see some info
    // const result = await cl.info({
    //     requestTimeout: 10000
    // });
    // console.log(JSON.stringify(result, null, 2));

    // indexing some document
//     const indexThis = await cl.index({
//         index: 'documents',
//         type: 'text-docs',
//         id: 'a12cda46-6019-4e35-a61a-823111d300a2',
//         body: {
//             title: 'file-name',
//             tenantId: 'a12cda46-0000-4e35-abab-823111d300a1',
//             text: `Woman wins the Internet with her perfect response to a troll who said she'd look better with lighter skin
//             An aspiring model has won the Internet after shutting down a racist Twitter troll who said she’d be more attractive if her skin was ‘lighter.’
// It’s a pretty sa and her stunning shots, one particularly unpleasant user felt the need to throw down their insulting opinion on her skin colour.

// “[If] she was lighter, she’d be fire,” they wrote.`
//         }});
//     console.log('indexing result:' + JSON.stringify(indexThis, null, 2));

    const searchResult = await cl.search({
        index: 'documents',
        type: 'text-docs',
        // q: 'Twain'
        _sourceExclude: 'text',
        body: {
            "query": {
                "match": { "text": "woman" }
            },
            "highlight": {
                "fields": {
                    "text": {}
                }
            }
        }
    });

    // const searchResult = await cl.get({
    //     id: 'f80808e6-a527-42b2-9224-4a6a5c2da13c',
    //     index: 'documents',
    //     type: 'text-docs'
    // });

    console.log('search result:' + JSON.stringify(searchResult, null, 2));
}

async function getFromS3() {
    const promiseForS3Client = new Promise<S3>((resolve, reject) => {
        awscred.load((err, data) => {
            if (err) {
                reject(err);
            } else {
                const cl = new S3({
                    region: data.region,
                    accessKeyId: data.credentials.accessKeyId,
                    secretAccessKey: data.credentials.secretAccessKey
                 });
                resolve(cl);
            }
        });
    });
    const s3 = await promiseForS3Client;
    const s3Obj = await s3.getObject({
        Bucket: 'com-hubhighup-mdfiles-dev',
        Key: 'e77d02f2-32b5-4f87-a9f7-0ab4ccf6c174.tika.extract'
    }).promise();
    const str = s3Obj.Body.toString();
    const parsed = JSON.parse(str);
    console.log(parsed['ContentType']);
    const text: string = parsed.Text;
    console.log(text.length);
    // console.log(JSON.stringify(parsed, null, 2));
}

// https://www.elastic.co/guide/en/elasticsearch/reference/5.x/mapping.html
// https://gist.github.com/StephanHoyer/b9cd6cbc4cc93cee8ea6



// getFromS3();
createIndices();


