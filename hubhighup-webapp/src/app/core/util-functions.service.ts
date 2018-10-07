import { Injectable } from '@angular/core';

@Injectable()
export class UtilFunctionsService {

  constructor() { }

  defaultUsernameForEmail(email: string): string {
    return email.replace(/[@.]/g, '-');
  }
}
