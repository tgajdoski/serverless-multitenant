'use strict';

let conf = require("./interservice-config.js").conf;

var program = require('commander');

program
    .option('-s, --stage <stage>', 'Stage to deploy to (default is \'dev\')')
    .option('-r, --region <region>', 'AWS Region (default us-west-2)')
    .parse(process.argv);

const aws = require("aws-sdk");
const cloudFormationExportedBucketID = 'HubHighUpUIDevBucketName';

let configStage = conf().stage;

let region = program.region || 'us-west-2';
let stage =  program.stage ||  configStage || 'dev';

let distFolder = './dist';

let cloudFormation = new aws.CloudFormation({region});
cloudFormation.listExports({}).promise()
.then( expValues => {
    // find the target bucket (it needs to be exported by CF)
    let uiBucket =  expValues.Exports.find( (value, index, object) => {
        return value.Name === cloudFormationExportedBucketID;
    });
    if (!uiBucket) throw("Can't find the bucket ID among exported cloudformation values");

    let s3Target = 's3://' + uiBucket.Value;
    if (stage && stage!='' && stage!='dev') s3Target = s3Target + "/" + stage;
    console.log("Upload target: " + s3Target);

    // execute aws s3 sync
    let awsS3SyncCommand = `aws s3 sync ${distFolder} ${s3Target} --delete`;

    let commandAndArgs = awsS3SyncCommand.split(' ');
    const spawn = require('child_process').spawn;
    let s3Sync = spawn(commandAndArgs.shift(), commandAndArgs);
    s3Sync.on('error', function(err) {
        console.log('error:' + err);
    });
    s3Sync.stdout.pipe(process.stdout);
    s3Sync.stderr.pipe(process.stderr);
    s3Sync.on('exit', (code, signal) => {
        console.log('\n> copy finished... /n');
        let setCacheCommand = `aws s3 cp ${s3Target}/ ${s3Target}/ --exclude '*' --include '*.bundle.*' --include '*.chunk.*' --cache-control 'max-age=31104000' --metadata-directive REPLACE --recursive`;
        let setNoCacheCommand = `aws s3 cp ${s3Target}/ ${s3Target}/ --exclude '*.bundle.*' --exclude '*.chunk.*' --cache-control 'max-age=0' --metadata-directive REPLACE --recursive`;

        console.log('\n> turn on caching for bundled files ...');
        const execSync = require('child_process').execSync;
        const buffer = execSync(setCacheCommand);
        console.log(buffer.toString('UTF-8'));

        console.log('\n> turn off caching for normal files ...');
        const buffer2 = execSync(setNoCacheCommand);
        console.log(buffer2.toString('UTF-8'));
    });
})
.catch( exc =>  {
    console.log(exc);
    process.exit(1);
});

