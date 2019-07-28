<<<<<<< HEAD
## Environments

Out of the box, we support two environments, `dev` for development and `prod` for production.

The configurations for each environments are located under the `env` folder of the root of the project.

By default the applications starts with the `dev` environment.

If you want to change to another environment run the following command:
`npm run env:<environment_name>`

where `<environment_name>` can be `dev` for development or `prod` for production.

In a nutshell this command sets up the environment copying the needed files to the root folder (`GoogleService-info.plist, google-services.json, config.xml`), copies the environment variables to `src/app/environment.ts` and make a reinstall to the `cordova-plugin-googleplus` with the correct `REVERSED_CLIENT_ID`.

**Important: if you add or remove any cordova plugins, those changes need to be reflected in the `env/dev/config.xml` and `env/prod/config.xml` files also by copying the needed configurations to those files respectively**

## Personality tests

All personality tests are located under `personality-tests` folder of the root of the project.

Each test consists of the following files:

- `test.json` - The test data
- `picture.jpg` - The test picture to be used in the app
- `results.json` - The possible test results
- `evaluation.js` - The test evaluation function (for tests of "internal" type only)

The `test.json` file contains the test data that will be deployed and has the following structure:

* `name` - the name of the test in its respective locale
* `questions` - a list of the questions provided by the test with its title in its respective locale. A question also contains a list of possible answers

For more details you can check the `personality-tests/big5/test.json` file

#### Adding a new test

Adding a new test is as simple as creating a new folder with the files described above (see for example the contents of `big5` test folder). The name of the folder should reflect the name of the test. This will be used as the id of the test when deploying it.

#### Deploying a test

In order to deploy a test run the following command:
`npm run tests-migrate export <test_id> --config <configuration_file>` where `<test_id>` is the name of the test and the `<configuration_file>` is the configuration file used to deploy to firestore. You can find an example of how the configuration file should look in `scripts/config.json.tpl` file.

## Cloud functions

The code for the cloud functions can be found under `functions/src` folder of the root of the app.
We currently write all functions to `index.ts` file, thus this will change in the future providing a more flexible approach.

### Deploying cloud functions

In order the cloud functions run the following command:

`firebase deploy --only functions`.

You can also choose to which environment you want to deploy the functions:

`firebase use <environment>` where <environment> is `development` for development and `default` for production

**Important: in order to have the `firebase` command availabe please install the `firebase-tools` package from `npm`.
For more details about `firebase-tools`, please visit https://github.com/firebase/firebase-tools**

## Native builds

### iOS

In order to create an iOS build ready for deployment run the following command:

`ionic cordova build ios --prod`

The resulting app will be located under `platforms/ios` folder of the root of the app.

### Android

In order to create an Android build ready for deployment run the following command:

`ionic cordova build android --prod`

The resulting app will be located under `platforms/android` folder of the root of the app.

You can find more information about deploying visiting https://ionicframework.com/docs/intro/deploying/

### Pushing a new app version to TestFlight

Build out the application, and when ready perform an `ionic build`
Open the application in Xcode (ex: `open platforms/ios/fyt-app.xcworkspace`)

Follow Apple's steps for [Distributing an app using TestFlight](https://help.apple.com/xcode/mac/9.3/#/dev2539d985f). Note that in some cases the Ionic and Cordova build processes have already performed certain actions such as setting the "Bundle ID" based on data in your "config.xml" file. Key points in the steps are:

Signing: If automatic signing cannot be used, manually sign the app using a valid Production Certificate and an associated Distribution Provisioning Profile

Select "Generic iOS Device" in the Scheme toolbar menu on the main window of Xcode

Select Project -> Archive from the Xcode menu, this should open the archive window
Add the app in iTunes Connect

From the Xcode Archive window, validate the archive
Press the "Upload to AppStore..." button
Once the upload completes, open the app in iTunes connect to add internal and external testers and fill out the information for beta-test review

### Pushing a new version to HockeyApp
=======
**Edit a file, create a new file, and clone from Bitbucket in under 2 minutes**

When you're done, you can delete the content in this README and update the file with details for others getting started with your repository.

*We recommend that you open this README in another tab as you perform the tasks below. You can [watch our video](https://youtu.be/0ocf7u76WSo) for a full demo of all the steps in this tutorial. Open the video in a new tab to avoid leaving Bitbucket.*

---

## Edit a file

You’ll start by editing this README file to learn how to edit a file in Bitbucket.

1. Click **Source** on the left side.
2. Click the README.md link from the list of files.
3. Click the **Edit** button.
4. Delete the following text: *Delete this line to make a change to the README from Bitbucket.*
5. After making your change, click **Commit** and then **Commit** again in the dialog. The commit page will open and you’ll see the change you just made.
6. Go back to the **Source** page.

---

## Create a file

Next, you’ll add a new file to this repository.

1. Click the **New file** button at the top of the **Source** page.
2. Give the file a filename of **contributors.txt**.
3. Enter your name in the empty file space.
4. Click **Commit** and then **Commit** again in the dialog.
5. Go back to the **Source** page.

Before you move on, go ahead and explore the repository. You've already seen the **Source** page, but check out the **Commits**, **Branches**, and **Settings** pages.

---

## Clone a repository

Use these steps to clone from SourceTree, our client for using the repository command-line free. Cloning allows you to work on your files locally. If you don't yet have SourceTree, [download and install first](https://www.sourcetreeapp.com/). If you prefer to clone from the command line, see [Clone a repository](https://confluence.atlassian.com/x/4whODQ).

1. You’ll see the clone button under the **Source** heading. Click that button.
2. Now click **Check out in SourceTree**. You may need to create a SourceTree account or log in.
3. When you see the **Clone New** dialog in SourceTree, update the destination path and name if you’d like to and then click **Clone**.
4. Open the directory you just created to see your repository’s files.

Now that you're more familiar with your Bitbucket repository, go ahead and add a new file locally. You can [push your change back to Bitbucket with SourceTree](https://confluence.atlassian.com/x/iqyBMg), or you can [add, commit,](https://confluence.atlassian.com/x/8QhODQ) and [push from the command line](https://confluence.atlassian.com/x/NQ0zDQ).
>>>>>>> 5a64bfc112abd84919d4a14177de1ab0a6cdb19d
