
import * as aws from "aws-sdk";

export class File {
    fileId: string;
    filename: string;
    parentId: string;
    tenantId: string;
    size: number;
    lastModified: number;
    isContainer: boolean;
    uploaded: boolean;
    owner: string;
}

export class FileDAO {

constructor(private tableName: string, private dynamoDbDoc: aws.DynamoDB.DocumentClient) {}

private initFile(dataFromDb: any): File {
    const fileVar: File = new File();
    fileVar.fileId = dataFromDb['FileId'];
    fileVar.filename = dataFromDb['Filename'];
    fileVar.parentId = dataFromDb['ParentId'];
    fileVar.tenantId = dataFromDb['TenantId'];
    fileVar.size = dataFromDb['Size'];
    fileVar.lastModified = dataFromDb['LastModified'];
    fileVar.isContainer = dataFromDb['IsContainer'];
    fileVar.uploaded = dataFromDb['Uploaded'];
    fileVar.owner = dataFromDb['Owner'];
    return fileVar;
}

getFile(fileId: string, tenantId: string): Promise<File> {
    return this.dynamoDbDoc.get({
        TableName: this.tableName,
        Key: {
            'FileId': fileId,
            'TenantId': tenantId
        }
    }).promise()
    .then((data) => {
        const fileVar = this.initFile(data.Item);
        return Promise.resolve(fileVar);
    });
}

getFilesByFileId(fileId: string): Promise<File[]> {
    return this.dynamoDbDoc.query({
        TableName: this.tableName,
        KeyConditionExpression: 'FileId = :fileId',
        ExpressionAttributeValues: {
            ':fileId': fileId
        }
    }).promise()
    .then((data) => {
        const filesVarList: File[] = [];
        for (const item of data.Items) {
            filesVarList.push(this.initFile(item));
        }
        return Promise.resolve(filesVarList);
    });
}

getFilesByParentId(parentId: string): Promise<File[]> {
    return this.dynamoDbDoc.query({
        TableName: this.tableName,
        IndexName: 'ParentId-Filename-index',
        KeyConditionExpression: 'ParentId = :parentId',
        ExpressionAttributeValues: {
            ':parentId': parentId
        }
    }).promise()
    .then((data) => {
        const filesVarList: File[] = [];
        for (const item of data.Items) {
            filesVarList.push(this.initFile(item));
        }
        return Promise.resolve(filesVarList);
    });
}

getFilesByTenantId(tenantId: string): Promise<File[]> {
    return this.dynamoDbDoc.query({
        TableName: this.tableName,
        IndexName: 'TenantId-index',
        KeyConditionExpression: 'TenantId = :tenantId',
        ExpressionAttributeValues: {
            ':tenantId': tenantId
        }
    }).promise()
    .then((data) => {
        const filesVarList: File[] = [];
        for (const item of data.Items) {
            filesVarList.push(this.initFile(item));
        }
        return Promise.resolve(filesVarList);
    });
}

createFile( fileId: string , filename: string , parentId: string , tenantId: string , size: number , lastModified: number , isContainer: boolean , uploaded: boolean , owner: string ): Promise<any> {
    const item: any = {};
    if (fileId != null) {
        item['FileId'] = fileId;
    }
    if (filename != null) {
        item['Filename'] = filename;
    }
    if (parentId != null) {
        item['ParentId'] = parentId;
    }
    if (tenantId != null) {
        item['TenantId'] = tenantId;
    }
    if (size != null) {
        item['Size'] = size;
    }
    if (lastModified != null) {
        item['LastModified'] = lastModified;
    }
    if (isContainer != null) {
        item['IsContainer'] = isContainer;
    }
    if (uploaded != null) {
        item['Uploaded'] = uploaded;
    }
    if (owner != null) {
        item['Owner'] = owner;
    }
    return this.dynamoDbDoc.put({
        TableName: this.tableName,
        Item: item,
        ConditionExpression: 'attribute_not_exists(FileId)'
    }).promise();
}

updateFile( fileId: string , filename: string , parentId: string , tenantId: string , size: number , lastModified: number , isContainer: boolean , uploaded: boolean , owner: string ): Promise<File> {
    const item: any = {};

    let setExpression = '';
    const expressionAttributeValues = {};
    expressionAttributeValues[':fileId'] = fileId;
    expressionAttributeValues[':tenantId'] = tenantId;

    if (filename != null && filename !== undefined) {
        setExpression += ', Filename = :filename';
        expressionAttributeValues[':filename'] = filename;
    }

    if (parentId != null && parentId !== undefined) {
        setExpression += ', ParentId = :parentId';
        expressionAttributeValues[':parentId'] = parentId;
    }

    if (size != null && size !== undefined) {
        setExpression += ', Size = :size';
        expressionAttributeValues[':size'] = size;
    }

    if (lastModified != null && lastModified !== undefined) {
        setExpression += ', LastModified = :lastModified';
        expressionAttributeValues[':lastModified'] = lastModified;
    }

    if (isContainer != null && isContainer !== undefined) {
        setExpression += ', IsContainer = :isContainer';
        expressionAttributeValues[':isContainer'] = isContainer;
    }

    if (uploaded != null && uploaded !== undefined) {
        setExpression += ', Uploaded = :uploaded';
        expressionAttributeValues[':uploaded'] = uploaded;
    }

    if (owner != null && owner !== undefined) {
        setExpression += ', Owner = :owner';
        expressionAttributeValues[':owner'] = owner;
    }


    if (!setExpression) {
        return Promise.resolve(null);
    }

    setExpression = 'SET ' + setExpression.slice(1);

    return this.dynamoDbDoc.update({
        TableName: this.tableName,
        Key: {
            'FileId': fileId,
            'TenantId': tenantId
        },
        UpdateExpression: setExpression,
        ConditionExpression: 'FileId = :fileId AND TenantId = :tenantId',
        ExpressionAttributeValues: expressionAttributeValues,
        ReturnValues: 'ALL_NEW'
    }).promise()
    .then((data) => {
        const fileVar = this.initFile(data.Attributes);
        return Promise.resolve(fileVar);
    })
}

deleteFile(fileId: string, tenantId: string): Promise<File> {
    return this.dynamoDbDoc.delete({
        TableName: this.tableName,
        Key: {
            'FileId': fileId,
            'TenantId': tenantId
        },
        ReturnValues: 'ALL_OLD'
    }).promise()
    .then((data) => {
        if (data) {
            const fileVar = this.initFile(data.Attributes);
            return Promise.resolve(fileVar);
        } else {
            return Promise.resolve(null);
        }
    });
}
}
