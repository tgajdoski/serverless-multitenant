function gqlps(literals) {
    const substitutions = Array.prototype.slice.call(arguments, gqlps.length);
    let result = "";
    for (let i = 0; i < substitutions.length; i++) {
        result += literals[i];
        result += substitutions[i];
    }
    result += literals[literals.length - 1];
    return result;
}

export function gqlGetProjects() {
    return gqlps`
            query {
                projects {
                    projectId,
                    projectname,
                    created,
                    owner
                }
            }
    `;
}

export function gqlGetProject(projectId) {
    return gqlps`
            query {
                project(projectId: "${projectId}") {
                    projectId,
                    projectname,
                    created,
                    owner
                }
            }
    `;
}

export function gqlCreateProject(projectname) {
    return gqlps`
        mutation {
            createProject(projectname: "${projectname}") {
                    projectId,
                    projectname,
                    created,
                    owner
            }
        }
    `;
}