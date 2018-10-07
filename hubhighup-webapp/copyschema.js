const fs = require('fs-extra');

fs.mkdirp('./src/app/schemas/');
fs.copySync('../gqlfacade-service/schemas/gql-interface.ts', './src/app/schemas/gql-interface.ts')
fs.copySync('../gqlfacade-service/schemas/merged-schema.gql', './src/app/schemas/merged-schema.gql')
fs.copySync('../gqlfacade-service/schemas/merged-schema.json', './src/app/schemas/merged-schema.json')
