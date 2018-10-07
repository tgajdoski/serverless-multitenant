
import * as aws from "aws-sdk";

export class Tenant {
    tenantId: string;
    name: string;
}

export class TenantDAO {

constructor(private tableName: string, private dynamoDbDoc: aws.DynamoDB.DocumentClient) {}

private initTenant(dataFromDb: any): Tenant {
    const tenantVar: Tenant = new Tenant();
    tenantVar.tenantId = dataFromDb['TenantId'];
    tenantVar.name = dataFromDb['Name'];
    return tenantVar;
}

getTenant(tenantId: string): Promise<Tenant> {
    return this.dynamoDbDoc.get({
        TableName: this.tableName,
        Key: {
            'TenantId': tenantId
        }
    }).promise()
    .then((data) => {
        const tenantVar = this.initTenant(data.Item);
        return Promise.resolve(tenantVar);
    });
}

createTenant( tenantId: string , name: string ): Promise<any> {
    const item: any = {};
    if (tenantId != null) {
        item['TenantId'] = tenantId;
    }
    if (name != null) {
        item['Name'] = name;
    }
    return this.dynamoDbDoc.put({
        TableName: this.tableName,
        Item: item,
        ConditionExpression: 'attribute_not_exists(TenantId)'
    }).promise();
}

updateTenant( tenantId: string , name: string ): Promise<Tenant> {
    const item: any = {};

    let setExpression = '';
    const expressionAttributeValues = {};
    expressionAttributeValues[':tenantId'] = tenantId;


    if (name != null && name !== undefined) {
        setExpression += ', Name = :name';
        expressionAttributeValues[':name'] = name;
    }


    if (!setExpression) {
        return Promise.resolve(null);
    }

    setExpression = 'SET ' + setExpression.slice(1);

    return this.dynamoDbDoc.update({
        TableName: this.tableName,
        Key: {
            'TenantId': tenantId
        },
        UpdateExpression: setExpression,
        ConditionExpression: 'TenantId = :tenantId',
        ExpressionAttributeValues: expressionAttributeValues,
        ReturnValues: 'ALL_NEW'
    }).promise()
    .then((data) => {
        const tenantVar = this.initTenant(data.Attributes);
        return Promise.resolve(tenantVar);
    })
}

deleteTenant(tenantId: string): Promise<Tenant> {
    return this.dynamoDbDoc.delete({
        TableName: this.tableName,
        Key: {
            'TenantId': tenantId
        },
        ReturnValues: 'ALL_OLD'
    }).promise()
    .then((data) => {
        if (data) {
            const tenantVar = this.initTenant(data.Attributes);
            return Promise.resolve(tenantVar);
        } else {
            return Promise.resolve(null);
        }
    });
}
}
