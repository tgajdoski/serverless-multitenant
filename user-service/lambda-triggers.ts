import { setUserProperty, cleanUserProperty } from './cognito-user';
const HOST_URL = process.env.uiBaseURL;
const PROPOSED_TENANT_NAME = "custom:suggestedTenantName";
const TENANT_NAME = "custom:tenantName";

/**
 * Lambda for handling the custom messages for:
 *  -Invited Users (Created by administrator)
 *  -Users who sign-up themselves, in order to confirm the email
 *  -TODO: Password reset
 */
export function _customMessage(event, context, callback) {
    console.log("trigger source:" + event.triggerSource);
    console.log("full event:" + JSON.stringify(event, null, 2));

    if (event.triggerSource === "CustomMessage_AdminCreateUser") {
        userInvited(event, context, callback);
    } else if (event.triggerSource === "CustomMessage_SignUp"
        || event.triggerSource === "CustomMessage_ResendCode") {
        confirmEmail(event, context, callback);
    }
}


function userInvited(event, context, callback) {
    const emailMessage = String.raw`<html>Click <a href="${HOST_URL}/invited?code=${event.request.codeParameter}&username=${event.request.usernameParameter}">here</a> to finish registration.</html>`;
    console.log("raw email string:" + emailMessage);
    event.response.emailSubject = "You've been invited...";
    event.response.emailMessage = emailMessage;

    callback(null, event);
}

async function confirmEmail(event, context, callback) {
    const poolId = event.userPoolId;
    const username = event.userName;
    const emailMessage = String.raw`<html>Click <a href="${HOST_URL}/confirm?code=${event.request.codeParameter}&username=${username}">here</a> to finish registration.</html>`;
    console.log("raw email string:" + emailMessage);
    event.response.emailSubject = "Finish Registration";
    event.response.emailMessage = emailMessage;

    // Copy suggestedTenantName attribute (which can be set by the client, and might be checked upon initial registration)
    // into tenantName attribute (which can't be set by the client in the later workflow)
    // We use 'tenantName' as a hint that a new tenant needs to be Created, and this happens only once the user is logged in
    const ppTN = event.request.userAttributes[PROPOSED_TENANT_NAME];
    if (ppTN) {
        try {
            await setUserProperty(username, poolId, TENANT_NAME, ppTN);
            await cleanUserProperty(username, poolId, PROPOSED_TENANT_NAME);
            callback(null, event);
        } catch (err) {
            callback(err, null);
        }
    } else {
        callback(null, event);
    }
}

/**
 * Ensure the soundness of the user attributes,
 * before we continue with the sign-up process
 */
export function _preSignUp(event, context, callback) {
    // TODO: Any additional logic about email/tenant name should go here...
    console.log("Pre Sign Up");
    console.log("trigger source:" + event.triggerSource);
    console.log("full event:" + JSON.stringify(event, null, 2));

    callback(null, event);
};

export function _newUserConfirmed(event, context, callback) {
    console.log("User Confirmed");
    if (event.triggerSource === "PostConfirmation_ConfirmSignUp") {
        const poolId = event.userPoolId;
        const userId = event.userName;
        const tenantName = event.request.userAttributes[PROPOSED_TENANT_NAME];
        console.log("PoolId:%s UserId:%s TenantName:%s", poolId, userId, tenantName);
    }

    console.log("trigger source:" + event.triggerSource);
    console.log("full context:" + JSON.stringify(context, null, 2));
    console.log("full event:" + JSON.stringify(event, null, 2));

    callback(null, event);
};
