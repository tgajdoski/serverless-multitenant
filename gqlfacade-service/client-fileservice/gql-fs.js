function gqlfs(literals) {
    const substitutions = Array.prototype.slice.call(arguments, gqlfs.length);
    let result = "";
    for (let i = 0; i < substitutions.length; i++) {
        result += literals[i];
        result += substitutions[i];
    }
    result += literals[literals.length - 1];
    return result;
}

export function gqlGetFiles(parent) {
    if (parent) {
        return gqlfs`
            query {
                files( parentId: "${parent}") {
                    fileId,
                    filename,
                    signedUrl,
                    parentId,
                    size,
                    lastModified,
                    isContainer,
                    uploaded,
                    owner
                }
            }
    `;
    } else {
        return gqlfs`
            query {
                files {
                    fileId,
                    filename,
                    signedUrl,
                    parentId,
                    size,
                    lastModified,
                    isContainer,
                    uploaded,
                    owner
                }
            }
    `;
    }
}

export function gqlGetFile(fileId) {
    return gqlfs`
            query {
                file(fileId: "${fileId}") {
                    fileId,
                    filename,
                    signedUrl,
                    parentId,
                    size,
                    lastModified,
                    isContainer,
                    uploaded,
                    owner
                }
            }
    `;
}

export function gqlUploadAuthorization(filename, parentIdparam) {
    return gqlfs`
        mutation {
            getUploadAuthorization(filename: "${filename}", parentId: "${parentIdparam}" ) {
                credentials {
                    accessKey,
                    secretAccessKey,
                    sessionToken
                },
                fileBucket,
                fileId,
                parentId
            }
        }
    `;
}