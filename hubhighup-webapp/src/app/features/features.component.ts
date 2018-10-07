import { Component, OnInit, HostListener } from '@angular/core';
import { Router } from '@angular/router';

import { Observable  } from 'rxjs/Rx';
import 'rxjs/add/observable/fromEvent';
import * as AwsIot from 'aws-iot-device-sdk';
import { Iot } from 'aws-sdk';

// const iot = new Iot();
// iot.attachPrincipalPolicy();
// iot.createPolicy();
// iot.detachPrincipalPolicy();
// iot.listPolicyPrincipals();
// iot.listPrincipalPolicies();

// create a policy for each cognito identity resource...
// when it gets over certain size (2048 characters), create and attach a new one (up to 10 policies)
// we need just *read* for all of these, so it is one "read", and then list...

import { AuthenticationCheckService } from '../core/authentication-check.service';
import { CognitoService } from '../core/cognito.service';

@Component({
  selector: 'app-features',
  templateUrl: './features.component.html',
  styleUrls: ['./features.component.css']
})
export class FeaturesComponent implements OnInit {
  title = 'Hub High Up';
  menu_open = false;

  constructor(private router: Router, public authCheckService: AuthenticationCheckService,
    private cognitoService: CognitoService) {
  }

  ngOnInit() {
    this.menu_open = false;
    this.router.events.subscribe(val => {
      this.sideBarHide();
    });

    // console.log('will setup IoT subscriptions now');
    // const client = new AwsIot.device({
    //   protocol: 'wss',
    //   accessKeyId: 'x',
    //   secretKey: 'y',
    //   sessionToken: 'z',
    //   region: 'us-west-2',
    // });

    // FIXME: The following needs to be used on the level of specific component?
    // client.updateWebSocketCredentials(accessKeyId, secretKey, sessionToken, expiration);

    // client.subscribe('topic');
    // // FIXME: Use 'UsingObservable', so that the underlying listener is removed
    // // when the observable is not used...
    // const obs = Observable.create(observer => {
    //   client.on('message', function (topic, message) {
    //     observer.next({topic, message});
    //   });
    // });
    // obs.subscribe(
    //   value => {
    //     console.log('topic:' + value.topic);
    //     console.log('message:' + value.message.toString());
    //   }
    // );
  }

  logout() {
    this.cognitoService.logout();
    this.router.navigate(['/auth']);
  }

  logoutGlobal() {
    this.cognitoService.globalLogout().
    then(() => this.logout());
  }

  sidebarShow(ev) {
    ev.stopPropagation();
    ev.preventDefault();
    // container.className = 'st-container'; // clear
    // classie.add( container, effect );
    setTimeout(() => {
      this.menu_open = true;
    }, 40);
    // document.addEventListener( eventtype, bodyClickFn );
  }

  @HostListener('click', ['$event'])
  clickAnywhere(ev) {
    if (this.menu_open === true && !this.hasParentClass(ev.target, 'st-menu')) {
      ev.stopPropagation();
      ev.preventDefault();
      this.sideBarHide();
    }
  }

  sideBarHide() {
    setTimeout(() => {
      this.menu_open = false;
    }, 40);
  }

  hasParentClass(elem, classname): boolean {
    if (elem === document) {
      return false;
    };
    if (elem.classList.contains(classname)) {
      return true;
    }
    if (new RegExp('(^|\\s+)' + classname + '(\\s+|$)').test(elem.className)) {
      return true;
    }
    return elem.parentNode && this.hasParentClass(elem.parentNode, classname);
  }

}
