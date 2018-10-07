import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { ToastyModule } from 'ng2-toasty';

import { FeaturesRoutingModule } from './features-routing.module';
import { UsersComponent } from './users/users.component';
import { FilesComponent } from './files/files.component';
import { EntryComponent } from './entry/entry.component';
import { FeaturesComponent } from './features.component';
import { UserListComponent } from './users/user-list/user-list.component';
import { InviteUserComponent } from './users/invite-user/invite-user.component';
import { SharedModule } from '../shared/shared.module';
import { ProjectsComponent } from './projects/projects.component';
import { AddProjectComponent } from './projects/add-project/add-project.component';
import { ProjectListComponent } from './projects/project-list/project-list.component';
import { ProjectFilesComponent } from './projects/project-files/project-files.component';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    SharedModule,
    FeaturesRoutingModule,
    ToastyModule.forRoot()
  ],
  declarations: [UsersComponent, FilesComponent, EntryComponent, FeaturesComponent, UserListComponent, InviteUserComponent, ProjectsComponent, AddProjectComponent, ProjectListComponent, ProjectFilesComponent]
})
export class FeaturesModule { }
