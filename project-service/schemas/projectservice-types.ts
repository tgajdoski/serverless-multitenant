
export interface Query {
  projects(_, ctx: Object): Promise<Array<GProject>>;
  project(projectArgs: ProjectQueryArgs, ctx: Object): Promise<GProject | null>;
}

export interface ProjectQueryArgs {
  projectId: string;
}

export interface GProject {
  projectId: string;
  projectname: string;
  created: string;
  owner: string;
}

export interface Mutation {
  createProject(createProjectArgs: CreateProjectMutationArgs, ctx: Object): Promise<GProject | null>;
}

export interface CreateProjectMutationArgs {
  projectname: string;
}
