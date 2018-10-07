'use strict';

const AnalyzeTable = require('./analyzeTable');

const handlebars = require('handlebars');
const fs = require('fs');

class Dynatype {

    constructor(region, tableName, additionalAttributes) {
        this.region = region;
        this.tableName = tableName;
        this.additionalAttributes = additionalAttributes;
    }

    // constructor(tableData) {
    //     this.tableData = tableData;
    // }
    write(singular, plural, file) {
        let adt = new AnalyzeTable(this.region, this.tableName, this.additionalAttributes);
        return adt.getTableData()
        .then(tableData => {
            this.tableData = tableData;
            if (!file) {
                file = './' + singular + '.ts';
            }
            const template = this.getTemplate(singular, plural);
            fs.writeFileSync(file, template, 'UTF-8', {'flags': 'w+'} );
            return Promise.resolve();
        });
    }

    getTemplate(singular, plural) {
        let typescriptFile = '';
        typescriptFile +=
`
import * as aws from "aws-sdk";
`;

        // the fields
        let ti = this.getTemplateInterface(singular);
        typescriptFile += ti;

        typescriptFile +=
`
export class ${singular}DAO {

constructor(private tableName: string, private dynamoDbDoc: aws.DynamoDB.DocumentClient) {}
`;
        // TODO:
        // write tests using dynamodb local
        // write 'javadoc' function comments

        // a private method for copying data from the table into our class
        let tc = this.getTemplateCopy(singular);
        typescriptFile += tc;

        // Get method for the main index
        let tg = this.getTemplateGet(singular);
        typescriptFile += tg;

        // List method based on primary hash (if there is primary range key, otherwise just use simple GET)
        if (this.tableData.rangeKey) {
            let pk = this.getTemplateGetPK(singular, plural);
            typescriptFile += pk;
        }

        // List methods based on  Global Secondary Indexes
        for (const gsi of this.tableData.gsi) {
            // if the range-key of the GSI is same as the hash-key of the primary index
            // if (!gsi.rangeKey || gsi.rangeKey.name != this.tableData.hashKey) {
            let tgsi = this.getTemplateGetSI(singular,  plural, gsi);
            typescriptFile += tgsi;
        }

        console.log("before create");

        // Create method
        let cg = this.getTemplateCreate(singular);
        typescriptFile += cg;

        // Update method
        // TODO: 
        // Make the non-primary-key params optional
        // Differentiate between 'null' and 'undefined'? 
        // (null might mean delete?)
        let tu = this.getTemplateUpdate(singular);
        typescriptFile += tu;

        // Delete method
        let td = this.getTemplateDelete(singular);
        typescriptFile += td;

        typescriptFile += '}\n';
        return typescriptFile;
    }

    getTemplateInterface(name) {
        let className = this.capitalizeFirstLetter(name);
        let script = handlebars.compile(
`
export class ${name} {
    {{#each attributes}}
    {{this.varName}}: {{this.type}};
    {{/each}}
}
`);
        let result = script(this.tableData);
        return result;
    }

    getTemplateCopy(name) {
        let className = this.capitalizeFirstLetter(name);
        let varName = this.lowercaseFirstLetter(name) + 'Var';
        let script = handlebars.compile(
`
private init${className}(dataFromDb: any): ${className} {
    const ${varName}: ${className} = new ${className}();
{{#each attributes}}
    ${varName}.{{this.varName}} = dataFromDb['{{@key}}'];
{{/each}}
    return ${varName};
}
`);
        let result = script(this.tableData);
        return result;
    }

    getTemplateGet(name) {
        let className = this.capitalizeFirstLetter(name);
        let varName = this.lowercaseFirstLetter(name) + 'Var';

        let script = handlebars.compile(
`
get${className}({{hashKey.varName}}: {{hashKey.type}}
            {{~#if rangeKey~}} , {{rangeKey.varName}}: {{rangeKey.type}} {{~/if}}): Promise<${className}> {
    return this.dynamoDbDoc.get({
        TableName: this.tableName,
        Key: {
            '{{hashKey.name}}': {{hashKey.varName}}  {{~#if rangeKey~}} ,
            '{{rangeKey.name}}': {{rangeKey.varName}}  {{~/if}}
        }
    }).promise()
    .then((data) => {
        const ${varName} = this.init${className}(data.Item);
        return Promise.resolve(${varName});
    });
}
`
        );
        let result = script(this.tableData);
        return result;
    }


/**
 *  if the gsi is permutation , then it shouldn't get it's get method
 */
    getTemplateGetPK(name, plural) {
        let className = this.capitalizeFirstLetter(name);
        let varName = this.lowercaseFirstLetter(plural) + 'Var';

        let script = handlebars.compile(
`
get${plural}By{{hashKey.name}}({{hashKey.varName}}: {{hashKey.type~}}): Promise<${className}[]> {
    return this.dynamoDbDoc.query({
        TableName: this.tableName,
        KeyConditionExpression: '{{hashKey.name}} = :{{hashKey.varName}}',
        ExpressionAttributeValues: {
            ':{{hashKey.varName}}': {{hashKey.varName}}
        }
    }).promise()
    .then((data) => {
        const ${varName}List: ${className}[] = [];
        for (const item of data.Items) {
            ${varName}List.push(this.init${className}(item));
        }
        return Promise.resolve(${varName}List);
    });
}
`
        );
        let result = script(this.tableData);
        return result;
    }

/**
 *  if the gsi is permutation , then it shouldn't get it's get method
 */
    getTemplateGetSI(name, plural, gsi) {
        let className = this.capitalizeFirstLetter(name);
        let varName = this.lowercaseFirstLetter(plural) + 'Var';

        let script = handlebars.compile(
`
get${plural}By{{hashKey.name}}({{hashKey.varName}}: {{hashKey.type~}}): Promise<${className}[]> {
    return this.dynamoDbDoc.query({
        TableName: this.tableName,
        IndexName: '{{name}}',
        KeyConditionExpression: '{{hashKey.name}} = :{{hashKey.varName}}',
        ExpressionAttributeValues: {
            ':{{hashKey.varName}}': {{hashKey.varName}}
        }
    }).promise()
    .then((data) => {
        const ${varName}List: ${className}[] = [];
        for (const item of data.Items) {
            ${varName}List.push(this.init${className}(item));
        }
        return Promise.resolve(${varName}List);
    });
}
`
        );
        let result = script(gsi);
        return result;
    }

    getTemplateCreate(name) {
        let className = this.capitalizeFirstLetter(name);
        let script = handlebars.compile(
`
create${className}(
    {{~#each attributes}} {{this.varName}}: {{this.type}} {{#unless @last}},{{/unless}}
    {{~/each~}}): Promise<any> {
    const item: any = {};
    {{#each attributes}}
    if ({{this.varName}} != null) {
        item['{{@key}}'] = {{this.varName}};
    }
    {{/each}}
    return this.dynamoDbDoc.put({
        TableName: this.tableName,
        Item: item,
        ConditionExpression: 'attribute_not_exists({{hashKey.name}})'
    }).promise();
}
`
        );
        let result = script(this.tableData);
        return result;
    }

    getTemplateUpdate(name) {
        let className = this.capitalizeFirstLetter(name);
        let varName = this.lowercaseFirstLetter(name) + 'Var';
        let script = handlebars.compile(
`
update${className}(
    {{~#each attributes}} {{this.varName}}: {{this.type}} {{#unless @last}},{{/unless}}
    {{~/each~}}): Promise<${className}> {
    const item: any = {};

    let setExpression = '';
    const expressionAttributeValues = {};
    expressionAttributeValues[':{{hashKey.varName}}'] = {{hashKey.varName}};
{{#if rangeKey}}
    expressionAttributeValues[':{{rangeKey.varName}}'] = {{rangeKey.varName}};
{{~/if}}

{{#each attributes}}{{#unless this.isHash}}{{#unless this.isRange}}
    if ({{this.varName}} != null && {{this.varName}} !== undefined) {
        setExpression += ', {{@key}} = :{{this.varName}}';
        expressionAttributeValues[':{{this.varName}}'] = {{this.varName}};
    }
{{/unless}}{{/unless}}{{/each}}

    if (!setExpression) {
        return Promise.resolve(null);
    }

    setExpression = 'SET ' + setExpression.slice(1);

    return this.dynamoDbDoc.update({
        TableName: this.tableName,
        Key: {
            '{{hashKey.name}}': {{hashKey.varName}}  {{~#if rangeKey~}} ,
            '{{rangeKey.name}}': {{rangeKey.varName}}  {{~/if}}
        },
        UpdateExpression: setExpression,
        ConditionExpression: '{{hashKey.name}} = :{{hashKey.varName}}  {{~#if rangeKey}} AND {{rangeKey.name}} = :{{rangeKey.varName}}  {{~/if}}',
        ExpressionAttributeValues: expressionAttributeValues,
        ReturnValues: 'ALL_NEW'
    }).promise()
    .then((data) => {
        const ${varName} = this.init${className}(data.Attributes);
        return Promise.resolve(${varName});
    })
}
`
        );
        let result = script(this.tableData);
        return result;
    }

    getTemplateDelete(name) {
        let className = this.capitalizeFirstLetter(name);
        let varName = this.lowercaseFirstLetter(name) + 'Var';

        let script = handlebars.compile(
`
delete${className}({{hashKey.varName}}: {{hashKey.type}}
            {{~#if rangeKey~}} , {{rangeKey.varName}}: {{rangeKey.type}} {{~/if}}): Promise<${className}> {
    return this.dynamoDbDoc.delete({
        TableName: this.tableName,
        Key: {
            '{{hashKey.name}}': {{hashKey.varName}}  {{~#if rangeKey~}} ,
            '{{rangeKey.name}}': {{rangeKey.varName}}  {{~/if}}
        },
        ReturnValues: 'ALL_OLD'
    }).promise()
    .then((data) => {
        if (data) {
            const ${varName} = this.init${className}(data.Attributes);
            return Promise.resolve(${varName});
        } else {
            return Promise.resolve(null);
        }
    });
}
`
        );
        let result = script(this.tableData);
        return result;
    }

// getUsersBetween(hash, rangeStart, rangeEnd)
// getUsers(limit, start)
// getUserByTenantId(tenantId)

    capitalizeFirstLetter(string) {
        string.split()
        return string[0].toUpperCase() + string.slice(1);
    }

    lowercaseFirstLetter(string) {
        return string[0].toLowerCase() + string.slice(1);
    }

}

module.exports = Dynatype;