import { Component } from '@angular/core';
import { ConfigurationService } from './core/configuration.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  constructor(private configService: ConfigurationService) {
    configService.getCognitoData()
    .then( config => console.log(config.ClientId , config.IdentityPoolId, config.UserPoolId));
  }
}
