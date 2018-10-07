const gqlmerge = require('gql-merge');
const gql = require('graphql');
const fs = require('fs');

const MERGED_SCHEMA_FILE = 'schemas/merged-schema.gql';

const entrySchemas = [ 
    { 
        sourceSchema: '../user-service/schemas/userservice.gql',
        targetFolder: './client-userservice'
    },
    {
        sourceSchema: '../file-service/schemas/fileservice.gql',
        targetFolder: './client-fileservice'
    },
      { 
        sourceSchema: '../project-service/schemas/projectservice.gql',
        targetFolder: './client-projectservice'
    }
];

function produceIntrospectionFiles(schemasData) {
    return Promise.all(schemasData.map( ({sourceSchema: schemaPath, targetFolder: targetFolder}) => {
        let schemaName = schemaPath.slice(schemaPath.lastIndexOf('/'), schemaPath.lastIndexOf('.'));
        const schemaReadString = fs.readFileSync(schemaPath, 'utf-8');
        const schema = gql.buildSchema(schemaReadString);
        return gql.graphql(schema, gql.introspectionQuery)
            .then(res => res.data)
            .then(introspection => {
                fs.writeFileSync(targetFolder + '/' + schemaName + '.json', JSON.stringify(introspection, null, 2));
            });
    }));
}

function mergeSchemas(schemasData) {
    return gqlmerge.mergeFilePaths(schemasData.map(x=>x.sourceSchema))
        .then(output => {
            return fs.writeFileSync( MERGED_SCHEMA_FILE, output, { encoding: 'UTF-8' });
        })
        .catch(exc => {
            console.log(JSON.stringify(exc, null, 2));
        });
}

mergeSchemas(entrySchemas)
    .then(produceIntrospectionFiles(entrySchemas))
    .then(produceIntrospectionFiles([{sourceSchema: MERGED_SCHEMA_FILE, targetFolder:'schemas'}]));
