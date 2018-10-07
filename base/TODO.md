# TODO

- Cognito
   + All the resources needed by the client (including endpoints need to be exported by CFN)
       * Using federatedID and a single setting (eg. stage) get the info needed
   + Create npm lib with API for logging... Then we can write tests for it...
   
- Cloudformation initialization of ES service (including script to initialize the index/mapping)
- PrimeNG/Bootstrap for the Angular app?
- Projects
    + Create projects
       * Use Amazon Cloud Directory (fully managed)
- IoT
    + Publish update info upon mutations
       * How to get diff? Just pass the info from the mutation query?
       * How does the clients merge that info with existing data?
           - http://dev.apollodata.com/core/read-and-write.html

# Ops TODO

- Create separate base stack for staging
    + Base stacks should be parametarized
- Use CodePipeline for CI, which will deploy and test onto that stack ( beta.hubhighup.com ? )

# Ideas

- Re-captcha (google)


# User status

- Can be set by hand, or can be set by action... (e.g. @project code scan )
- Notifications are per project/per user / per action  - mute options

### On invite users, choose

- If they will have access to the web-app
- Or if they will have access just to the mobile app
    + Which parts of the mobile app
        * Set status 
        * Scan project QR code
        * Document preview
        * Chat

### Guest accounts

- They don't have 'confirm' email step, we send them a link outside of the normal procedure. 
- They use that link which contains auto-generated name...
- They get 'special guest account', which can be activated/deactivated as needed.

### Text analysis, preview etc..

- Add 'large-text' item to the index, and for very big documents use the alternative highlighter (much faster)
- Pdf.js (http://mozilla.github.io/pdf.js/) ; PdfKit (http://pdfkit.org/)


### Windows and Mac utils for working with the files

Electron:
- register for auto-launch: https://www.npmjs.com/package/auto-launch
- use notification tray: https://github.com/electron/electron/blob/master/docs/api/tray.md
- https://github.com/electron/electron/blob/master/docs/api/browser-window.md  <--hide.show windows  (show=false, skipTaskbar=true)
- https://github.com/electron/electron/pull/4896 - set itself as a protocol