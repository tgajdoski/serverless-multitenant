#! /usr/local/bin/node

'use strict';

const Dynatype = require('./Dynatype');

//we will need an array of "unimportant" things...

const ct = new Dynatype("us-west-2", "dev-project-service-Project", { created: "string", owner :"string" });
ct.write('Project', 'Projects');

// const ct = new Dynatype("us-west-2", "dev-user-service-Tenant", { Name: 'string' });
// ct.write('Tenant', 'Tenants');

// const ct = new Dynatype("us-west-2", "dev-file-service-File", { Size: "number", LastModified: "number", IsContainer: "boolean", Uploaded: "boolean", Owner: "string" });
// ct.write('File', 'Files');



