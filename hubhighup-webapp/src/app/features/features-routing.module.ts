import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { FeaturesComponent } from './features.component';
import { EntryComponent } from './entry/entry.component';
import { UsersComponent } from './users/users.component';
import { FilesComponent } from './files/files.component';
import { ProjectsComponent } from './projects/projects.component';
import { ProjectFilesComponent } from './projects/project-files/project-files.component';

const routes: Routes = [{
    path: '',
    component: FeaturesComponent,
    children: [
      { path: 'entry', component: EntryComponent },
      { path: 'users', component: UsersComponent },
      { path: 'projects', component: ProjectsComponent},
      { path: 'project/:projectId', component: ProjectFilesComponent},
      { path: 'files', component: FilesComponent},
      { path: '', redirectTo: 'entry', pathMatch: 'full' },
    ]
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: []
})
export class FeaturesRoutingModule { }
