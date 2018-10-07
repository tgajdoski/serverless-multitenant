#! /usr/local/bin/node

'use strict';

const fs = require("fs");

/**
 * To deploy separate stage within dev do the following:
 * 1. edit the value of this variable ( e.g. const stage = "some-branch" )
 * 2. execute `node setup.js`
 * 3. go into each of the services, rebuild and redeploy them
 * 4. go to the webapp, and rebuild and deploy it
 * 
 * TODO: Get stage as a parameter
 */ 
const stage = "dev";

//let the default 'dev' stage reside in the root of dev.hubhighup.com
let stageInWebApp = stage + '/';
if (stage==='dev') {
    stageInWebApp = '';
}

const config = `
module.exports.conf = function() {
    return {
        stage: '${stage}',
        uiBaseURL: 'https://dev.hubhighup.com/${stageInWebApp}#/',
        facadeServiceURL: 'https://api.hubhighup.com/${stage}-gqlfacade',
        filesURL: 'https://files-dev.hubhighup.com/'
    };
}
`;

/**
 * When new services are added, add them here too
 * TODO: Maybe we can just copy in all sibiling folders by default
 */
const targets = [ "../hubhighup-webapp", "../file-service", "../user-service","../project-service", "../tika-service" ];

for (const target of targets) {
    if (!fs.existsSync(target)) {
        console.error(`Target folder ${target} doesn't exist. Aborting.`);
        process.exit(1);
    }
    let targetFile = target + '/interservice-config.js';
    console.log(`copying into... ${targetFile} ...`);
    fs.writeFileSync(targetFile, config, 'UTF-8', {'flags': 'w+'} );
}

