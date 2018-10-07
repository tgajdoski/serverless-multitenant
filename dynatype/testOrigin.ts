import {User, UserDAO} from './User';
import * as aws from 'aws-sdk';

let docClient = new aws.DynamoDB.DocumentClient({region: 'us-west-2'});

let ud = new UserDAO('dev-user-service-User', docClient);
// ud.updateUser('tenant-XYZ', 'UserA', null, null);
ud.getUser('UserA').then
( user => {
    console.log(JSON.stringify(user, null, 2));
    console.log('\n');
});
// ud.getUser('UserB').then
// ( user => {
//     console.log(JSON.stringify(user, null, 2));
//     console.log('\n');
// });
// ud.getUser('UserC').then
// ( user => {
//     console.log(JSON.stringify(user, null, 2));
//     console.log('\n');
// });
// ud.createUser('tenant-ABC', 'UserA', true, 12);
// ud.createUser('tenant-ABC', 'UserB', false, null);
// ud.createUser('tenant-ABC', 'UserC', null, null);

ud.getUsersByTenantId('tenant-ABC')
.then( users => {
    for(const user of users) {
        console.log(JSON.stringify(user, null, 2));
    }
})

ud.deleteUser('UserC')
.then( () => console.log('done deleting'));