
import * as aws from "aws-sdk";

export class User {
    tenantId: string;
    userId: string;
    userName: string;
}

export class UserDAO {

constructor(private tableName: string, private dynamoDbDoc: aws.DynamoDB.DocumentClient) {}

private initUser(dataFromDb: any): User {
    const userVar: User = new User();
    userVar.tenantId = dataFromDb['TenantId'];
    userVar.userId = dataFromDb['UserId'];
    userVar.userName = dataFromDb['UserName'];
    return userVar;
}

getUser(userId: string): Promise<User> {
    return this.dynamoDbDoc.get({
        TableName: this.tableName,
        Key: {
            'UserId': userId
        }
    }).promise()
    .then((data) => {
        const userVar = this.initUser(data.Item);
        return Promise.resolve(userVar);
    });
}

getUsersByTenantId(tenantId: string): Promise<User[]> {
    return this.dynamoDbDoc.query({
        TableName: this.tableName,
        IndexName: 'TenantId-UserId-index',
        KeyConditionExpression: 'TenantId = :tenantId',
        ExpressionAttributeValues: {
            ':tenantId': tenantId
        }
    }).promise()
    .then((data) => {
        const usersVarList: User[] = [];
        for (const item of data.Items) {
            usersVarList.push(this.initUser(item));
        }
        return Promise.resolve(usersVarList);
    });
}

createUser( tenantId: string , userId: string , userName: string ): Promise<any> {
    const item: any = {};
    if (tenantId != null) {
        item['TenantId'] = tenantId;
    }
    if (userId != null) {
        item['UserId'] = userId;
    }
    if (userName != null) {
        item['UserName'] = userName;
    }
    return this.dynamoDbDoc.put({
        TableName: this.tableName,
        Item: item,
        ConditionExpression: 'attribute_not_exists(UserId)'
    }).promise();
}

updateUser( tenantId: string , userId: string , userName: string ): Promise<User> {
    const item: any = {};

    let setExpression = '';
    const expressionAttributeValues = {};
    expressionAttributeValues[':userId'] = userId;


    if (tenantId != null && tenantId !== undefined) {
        setExpression += ', TenantId = :tenantId';
        expressionAttributeValues[':tenantId'] = tenantId;
    }

    if (userName != null && userName !== undefined) {
        setExpression += ', UserName = :userName';
        expressionAttributeValues[':userName'] = userName;
    }


    if (!setExpression) {
        return Promise.resolve(null);
    }

    setExpression = 'SET ' + setExpression.slice(1);

    return this.dynamoDbDoc.update({
        TableName: this.tableName,
        Key: {
            'UserId': userId
        },
        UpdateExpression: setExpression,
        ConditionExpression: 'UserId = :userId',
        ExpressionAttributeValues: expressionAttributeValues,
        ReturnValues: 'ALL_NEW'
    }).promise()
    .then((data) => {
        const userVar = this.initUser(data.Attributes);
        return Promise.resolve(userVar);
    })
}

deleteUser(userId: string): Promise<User> {
    return this.dynamoDbDoc.delete({
        TableName: this.tableName,
        Key: {
            'UserId': userId
        },
        ReturnValues: 'ALL_OLD'
    }).promise()
    .then((data) => {
        if (data) {
            const userVar = this.initUser(data.Attributes);
            return Promise.resolve(userVar);
        } else {
            return Promise.resolve(null);
        }
    });
}
}
