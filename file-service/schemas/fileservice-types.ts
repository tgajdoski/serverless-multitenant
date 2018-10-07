
export interface Query {
  files(filesArgs: FilesQueryArgs, ctx: Object): Promise<Array<GFile>>;
  file(fileArgs: FileQueryArgs, ctx: Object): Promise<GFile | null>;
}

export interface FilesQueryArgs {
  parentId: string | null;
}

export interface FileQueryArgs {
  fileId: string;
}

export interface GFile {
  fileId: string;
  filename: string;
  signedUrl: string | null;
  parentId: string;
  size: number | null;
  lastModified: string | null;
  isContainer: boolean | null;
  uploaded: boolean | null;
  owner: string | null;
}

export interface Mutation {
  getUploadAuthorization(getUploadAuthorizationArgs: GetUploadAuthorizationMutationArgs, ctx: Object): Promise<UploadAuthorization | null>;
}

export interface GetUploadAuthorizationMutationArgs {
  filename: string;
  parentId: string | null;
}

export interface UploadAuthorization {
  credentials: IAMCredentials;
  fileBucket: string;
  fileId: string;
  parentId: string;
}

export interface IAMCredentials {
  accessKey: string | null;
  secretAccessKey: string | null;
  sessionToken: string | null;
}
