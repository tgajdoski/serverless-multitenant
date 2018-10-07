
export interface Query {
  users(_, ctx: Object): Promise<Array<GUser>>;
  config(_, ctx: Object): Promise<Configuration | null>;
  files(filesArgs: FilesQueryArgs, ctx: Object): Promise<Array<GFile>>;
  file(fileArgs: FileQueryArgs, ctx: Object): Promise<GFile | null>;
  projects(_, ctx: Object): Promise<Array<GProject>>;
  project(projectArgs: ProjectQueryArgs, ctx: Object): Promise<GProject | null>;
}

export interface FilesQueryArgs {
  parentId: string | null;
}

export interface FileQueryArgs {
  fileId: string;
}

export interface ProjectQueryArgs {
  projectId: string;
}

export interface GUser {
  userId: string;
  username: string;
}

export interface Configuration {
  userPoolId: string;
  userPoolClientAppId: string;
  identityPoolId: string;
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

export interface GProject {
  projectId: string;
  projectname: string;
  created: string;
  owner: string;
}

export interface Mutation {
  inviteUser(inviteUserArgs: InviteUserMutationArgs, ctx: Object): Promise<string>;
  initializeMe(_, ctx: Object): Promise<InitializationResult>;
  getUploadAuthorization(getUploadAuthorizationArgs: GetUploadAuthorizationMutationArgs, ctx: Object): Promise<UploadAuthorization | null>;
  createProject(createProjectArgs: CreateProjectMutationArgs, ctx: Object): Promise<GProject | null>;
}

export interface InviteUserMutationArgs {
  email: string;
}

export interface GetUploadAuthorizationMutationArgs {
  filename: string;
  parentIdparam: string;
}

export interface CreateProjectMutationArgs {
  projectname: string;
}

export interface InitializationResult {
  initialized: boolean;
  newTenant: boolean;
  tenantName: string;
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

export interface GTenant {
  name: string;
}
