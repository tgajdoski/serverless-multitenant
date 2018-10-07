import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AnimateChangeDirective } from './animate-change.directive';
import { Tab } from './tab';
import { Tabs } from './tabs';

@NgModule({
  imports: [
    CommonModule,
  ],
  declarations: [
    AnimateChangeDirective,
    Tab,
    Tabs
  ],
  exports: [
    AnimateChangeDirective,
    Tab,
    Tabs
  ]
})
export class SharedModule { }
