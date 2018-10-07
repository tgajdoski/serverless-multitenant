import { graphql, introspectionQuery, buildSchema } from 'graphql';
import { FileResult, Transform, TransformedOptions, getTemplateGenerator } from 'gcg-tweaked';
import * as path from 'path';
import * as fs from 'fs';

const schemaFile = path.resolve(__dirname, 'fileservice.gql');
const outFile = path.resolve(__dirname, 'fileservice-types.ts');
const schemaString = fs.readFileSync(schemaFile, 'utf-8');
const schema = buildSchema(schemaString);

Promise.all([
  graphql(schema, introspectionQuery).then(res => res.data),
  getTemplateGenerator('typescript'),
]).then(([introspection, template]) => {
  // console.log(JSON.stringify(introspection, null, 2));
  return (<TransformedOptions>{
  introspection: introspection,
  documents: [],
  template: template,
  outPath: outFile,
  isDev: false,
  noSchema: false,
  noDocuments: false,
});
})
.then(Transform)
.then((files: FileResult[]) => {
  files.forEach((fileResult: FileResult) => {
    fs.writeFileSync(fileResult.path, fileResult.content);
  });
  return files;
});
