function gqlus(literals) {
    const substitutions = Array.prototype.slice.call(arguments, gqlus.length);
    let result = "";
    for (let i = 0; i < substitutions.length; i++) {
        result += literals[i];
        result += substitutions[i];
    }
    result += literals[literals.length - 1];
    return result;
}

export function gqlInviteUser(name) {
    return gqlus`
        mutation {
            inviteUser( email: "${name}")
        }
`;
} 

export function gqlGetUsers() {
    return gqlus`
        query {
            users {
                userId,
                username
            }
        }
`;
}

export function gqlGetConfiguration() {
    return gqlus`
        query {
            config {
                userPoolId,
                userPoolClientAppId,
                identityPoolId
            }
        }
`;
}

export function gqlInitializeMe() {
    return gqlus`
        mutation {
            initializeMe {
                initialized,
                newTenant,
                tenantName
            }
        }
`;
}
