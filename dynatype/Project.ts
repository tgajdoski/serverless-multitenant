
import * as aws from "aws-sdk";

export class Project {
    tenantId: string;
    projectId: string;
    projectname: string;
    created: string;
    owner: string;
}

export class ProjectDAO {

constructor(private tableName: string, private dynamoDbDoc: aws.DynamoDB.DocumentClient) {}

private initProject(dataFromDb: any): Project {
    const projectVar: Project = new Project();
    projectVar.tenantId = dataFromDb['TenantId'];
    projectVar.projectId = dataFromDb['projectId'];
    projectVar.projectname = dataFromDb['projectname'];
    projectVar.created = dataFromDb['created'];
    projectVar.owner = dataFromDb['owner'];
    return projectVar;
}

getProject(projectId: string, tenantId: string): Promise<Project> {
    return this.dynamoDbDoc.get({
        TableName: this.tableName,
        Key: {
            'projectId': projectId,
            'TenantId': tenantId
        }
    }).promise()
    .then((data) => {
        const projectVar = this.initProject(data.Item);
        return Promise.resolve(projectVar);
    });
}

getProjectsByprojectId(projectId: string): Promise<Project[]> {
    return this.dynamoDbDoc.query({
        TableName: this.tableName,
        KeyConditionExpression: 'projectId = :projectId',
        ExpressionAttributeValues: {
            ':projectId': projectId
        }
    }).promise()
    .then((data) => {
        const projectsVarList: Project[] = [];
        for (const item of data.Items) {
            projectsVarList.push(this.initProject(item));
        }
        return Promise.resolve(projectsVarList);
    });
}

getProjectsByTenantId(tenantId: string): Promise<Project[]> {
    return this.dynamoDbDoc.query({
        TableName: this.tableName,
        IndexName: 'ParentId-Projectname-index',
        KeyConditionExpression: 'TenantId = :tenantId',
        ExpressionAttributeValues: {
            ':tenantId': tenantId
        }
    }).promise()
    .then((data) => {
        const projectsVarList: Project[] = [];
        for (const item of data.Items) {
            projectsVarList.push(this.initProject(item));
        }
        return Promise.resolve(projectsVarList);
    });
}

createProject( tenantId: string , projectId: string , projectname: string , created: string , owner: string ): Promise<any> {
    const item: any = {};
    if (tenantId != null) {
        item['TenantId'] = tenantId;
    }
    if (projectId != null) {
        item['projectId'] = projectId;
    }
    if (projectname != null) {
        item['projectname'] = projectname;
    }
    if (created != null) {
        item['created'] = created;
    }
    if (owner != null) {
        item['owner'] = owner;
    }
    return this.dynamoDbDoc.put({
        TableName: this.tableName,
        Item: item,
        ConditionExpression: 'attribute_not_exists(projectId)'
    }).promise();
}

updateProject( tenantId: string , projectId: string , projectname: string , created: string , owner: string ): Promise<Project> {
    const item: any = {};

    let setExpression = '';
    const expressionAttributeValues = {};
    expressionAttributeValues[':projectId'] = projectId;
    expressionAttributeValues[':tenantId'] = tenantId;

    if (projectname != null && projectname !== undefined) {
        setExpression += ', projectname = :projectname';
        expressionAttributeValues[':projectname'] = projectname;
    }

    if (created != null && created !== undefined) {
        setExpression += ', created = :created';
        expressionAttributeValues[':created'] = created;
    }

    if (owner != null && owner !== undefined) {
        setExpression += ', owner = :owner';
        expressionAttributeValues[':owner'] = owner;
    }


    if (!setExpression) {
        return Promise.resolve(null);
    }

    setExpression = 'SET ' + setExpression.slice(1);

    return this.dynamoDbDoc.update({
        TableName: this.tableName,
        Key: {
            'projectId': projectId,
            'TenantId': tenantId
        },
        UpdateExpression: setExpression,
        ConditionExpression: 'projectId = :projectId AND TenantId = :tenantId',
        ExpressionAttributeValues: expressionAttributeValues,
        ReturnValues: 'ALL_NEW'
    }).promise()
    .then((data) => {
        const projectVar = this.initProject(data.Attributes);
        return Promise.resolve(projectVar);
    })
}

deleteProject(projectId: string, tenantId: string): Promise<Project> {
    return this.dynamoDbDoc.delete({
        TableName: this.tableName,
        Key: {
            'projectId': projectId,
            'TenantId': tenantId
        },
        ReturnValues: 'ALL_OLD'
    }).promise()
    .then((data) => {
        if (data) {
            const projectVar = this.initProject(data.Attributes);
            return Promise.resolve(projectVar);
        } else {
            return Promise.resolve(null);
        }
    });
}
}
