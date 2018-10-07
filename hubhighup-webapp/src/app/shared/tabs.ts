import { Component, ContentChildren, QueryList, AfterContentInit } from '@angular/core';
import { Tab } from './tab';

@Component({
  selector: 'tabs',
  template: `
    <div class="left animated fadeIn col-xs-2">
      <ul class="nav nav-aligned nav-pills nav-stacked">
        <li *ngFor="let tab of tabs" (click)="selectTab(tab)" [class.active]="tab.active">
          <a><i class="{{tab.icon}}" aria-hidden="true"></i>&nbsp;&nbsp;{{tab.title}}</a>
        </li>
      </ul>
    </div>
    <div class="panel-body center col-xs-8 animated fadeIn">
      <ng-content></ng-content>
    </div>
  `,
  styles: [`
    .nav-tabs, .nav-pills {
      cursor: pointer;
    }
  `],
})
export class Tabs implements AfterContentInit {

  @ContentChildren(Tab) tabs: QueryList<Tab>;

  // contentChildren are set
  ngAfterContentInit() {
    // get all active tabs
    let activeTabs = this.tabs.filter((tab)=>tab.active);

    // if there is no active tab set, activate the first
    if(activeTabs.length === 0) {
      this.selectTab(this.tabs.first);
    }
  }

  selectTab(tab: Tab){
    // deactivate all tabs
    this.tabs.toArray().forEach(tabI => tabI.active = false);

    // activate the tab the user has clicked on.
    tab.active = true;
  }

}
