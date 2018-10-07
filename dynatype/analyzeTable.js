'use strict';

const aws = require('aws-sdk');
const handlebars = require('handlebars');

class AnalyzeDBTable {
    constructor(region, tableName, additionalAttributes) {
        this.region = region;
        this.tableName = tableName;
        this.additionalAttributes = additionalAttributes;
    }

    getTableData() {
        const dynamoDb = new aws.DynamoDB({region: this.region});
        console.log("analyzing :" + this.tableName);
        return dynamoDb.describeTable({
            TableName: this.tableName
        }).promise()
        .then( (tableDescription) => {
            this.tableData = {};
            this.tableData.attributes = {};
            this.tableData.gsi = [];
            const attDefinitions = tableDescription.Table.AttributeDefinitions;
            for (const attribute of attDefinitions) {
                let attData = {};
                attData.type = this.toTypescriptType(attribute.AttributeType);
                attData.varName = this.lowercaseFirstLetter(attribute.AttributeName);
                this.tableData.attributes[attribute.AttributeName] = attData;
            }
            const keySchema = tableDescription.Table.KeySchema;
            for (const attKeys of keySchema) {
                if (attKeys.KeyType === 'HASH') {
                    this.tableData.hashKey = this.getKeyObject(attKeys.AttributeName);
                    this.tableData.attributes[attKeys.AttributeName].isHash = true;
                }
                if (attKeys.KeyType === 'RANGE') {
                    this.tableData.rangeKey = this.getKeyObject(attKeys.AttributeName);
                    this.tableData.attributes[attKeys.AttributeName].isRange = true;
                }
                console.log(`Key:
                ${attKeys.AttributeName} : ${attKeys.KeyType}
                `);
            }
            const gsIndexes = tableDescription.Table.GlobalSecondaryIndexes;
            if (gsIndexes) {
                for(const gsIndex of gsIndexes) {
                    let gsIndexData = {};
                    this.tableData.gsi.push(gsIndexData);
                    console.log("index-name:" + gsIndex.IndexName);
                    gsIndexData.name = gsIndex.IndexName;
                    for (const attKeys of gsIndex.KeySchema) {
                        if (attKeys.KeyType === 'HASH') {
                            gsIndexData.hashKey = this.getKeyObject(attKeys.AttributeName);
                        }
                        if (attKeys.KeyType === 'RANGE') {
                            gsIndexData.rangeKey = this.getKeyObject(attKeys.AttributeName);
                        }
                        console.log(`GSI Key:  ${attKeys.AttributeName} : ${attKeys.KeyType}
                        `);
                    }
                }
            }
            console.log(this.additionalAttributes);
            for(const attributeKey of Object.keys(this.additionalAttributes)) {
                this.tableData.attributes[attributeKey] = {};
                this.tableData.attributes[attributeKey].type = this.additionalAttributes[attributeKey];
                this.tableData.attributes[attributeKey].varName = this.lowercaseFirstLetter(attributeKey);
            }
            // this.tableData.attributes = Object.assign( {}, this.tableData.attributes, this.additionalAttributes);
            return Promise.resolve(this.tableData);
        })
        .catch(err => console.log(err));
    }

    getKeyObject(propertyName) {
        let obj = {};
        obj.name = propertyName;
        obj.type = this.tableData.attributes[propertyName].type;
        obj.varName = this.tableData.attributes[propertyName].varName;
        return obj;
    }

    toTypescriptType(dynamoDbType) {
        let type;
        switch (dynamoDbType) {
        case 'S':
            type = 'string';
            break;
        case 'N':
            type = 'number';
            break;
        case 'B':
            type = 'boolean';
            break;
        default:
            break;
        }
        return type;
    }

    capitalizeFirstLetter(string) {
        return string[0].toUpperCase() + string.slice(1);
    }

    lowercaseFirstLetter(string) {
        return string[0].toLowerCase() + string.slice(1);
    }

}

module.exports = AnalyzeDBTable;