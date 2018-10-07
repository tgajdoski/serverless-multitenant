import { HubhighupWebappPage } from './app.po';

describe('hubhighup-webapp App', () => {
  let page: HubhighupWebappPage;

  beforeEach(() => {
    page = new HubhighupWebappPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
