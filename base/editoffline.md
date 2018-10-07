Description of functionality:

User clicks on the document link in our web app (it might be e.g. a Word document). The document opens up in the local application (e.g. Word). User edits and then saves the document. It is saved on the cloud.


Technical details of how to implement:

1. User installs our application on their system. (Windows/Mac/Linux)
2. The application registers itself as a URL scheme handler (we probably will need to define a special URL protocol and register it with the system). This means that when a user clicks on such a link, the underlying OS will execute our application and pass the whole URL to it.
3. When our app gets the specially formatted URL, it will contain among other things 
	- a signed HTTP URL to download the file
	- a signed HTTP URL to upload the file
	- a version of the doc.  (maybe SD5 hash of the contents)
4. App checks a local cache to see if there is a local version of the same file and if it is the same one. 
5. If the document isn't there, our application downloads it into a local cache, and starts the application to editing it (e.g. Powerpoint, Word, whatever)
6. The application observes the file for changes. If it is modified, our applications uploads the modified file in the background
7. The next time user clicks, the app will find the same version in the local cache (if it wasn't edited on some other system), and it will open it even without downloading.
(We can also use the version to implement different versions of optimisitc locking, e.g. we pass the version along with the modified file, and if the version has already been modified we ask the user that they have to get the new version and merge both versions.)


PS. We haven't investigated all the details about the technologies needed, especially for the step 2 (registering special protocol handler), so it would require some investigation and building a basic POC before we are 100% sure this kind of solution will work.