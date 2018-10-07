
export interface Query {
  users(_, ctx: Object): Promise<Array<GUser>>;
  config(_, ctx: Object): Promise<Configuration | null>;
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

export interface Mutation {
  inviteUser(inviteUserArgs: InviteUserMutationArgs, ctx: Object): Promise<string>;
  initializeMe(_, ctx: Object): Promise<InitializationResult>;
}

export interface InviteUserMutationArgs {
  email: string;
}

export interface InitializationResult {
  initialized: boolean;
  newTenant: boolean;
  tenantName: string;
}

export interface GTenant {
  name: string;
}
