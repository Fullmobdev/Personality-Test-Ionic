const fs = require('fs-extra');
const plist = require('plist');
const cmd = require('node-cmd');
require('dotenv').config();

async function setEnvironment() {
    let env = process.env.ENV;

    if (!process.env.ENV) {
        env = 'dev';  // Setting default env as dev
    }

    if(process.env.CURRENT_ENV === env) {
        return console.log(`Already using ${env} environment, skipping rest of configuration`)
    }

    console.log(`Setting up '${env}' environment...`);

    const path = `./env/${env}`;

    //@ts-ignore
    const { environment } = await import(`.${path}/environment`);

    const envFile = fs.readFileSync(`${path}/environment.ts`, 'utf-8');

    const configXmlFile = fs.readFileSync(`${path}/config.xml`, 'utf-8');

    const googleServicesJson = fs.readFileSync(`${path}/google-services.json`, 'utf-8');

    const googleServiceInfoPlist = fs.readFileSync(`${path}/GoogleService-Info.plist`, 'utf-8');

    const { REVERSED_CLIENT_ID } = plist.parse(googleServiceInfoPlist);

    const FB_APP_ID = environment.facebookConfig.appId;
    const FB_APP_NAME = environment.facebookConfig.appName;


    const filesMap = {
      'src/app/environment.ts': envFile,
      'config.xml': configXmlFile,
      'google-services.json': googleServicesJson,
      'GoogleService-Info.plist': googleServiceInfoPlist
    };

    Object.keys(filesMap).forEach(key => {
        fs.writeFileSync(key, filesMap[key], 'utf-8');
    });

    const removePlatforms = 'rm -rf platforms';
    const removePlugins = 'rm -rf plugins';
    const cordovaPrepare = 'cordova prepare';

    console.log('Updating cordova platforms...');
    const command = `${removePlatforms} && ${removePlugins} && ${cordovaPrepare}`;
    cmd.get(command, (err, data) => {
        if (!err) {
            console.log(`Successfully updated environment to '${env}'`);
            const CURRENT_ENV = `CURRENT_ENV=${env}`;
            fs.writeFileSync('.env', CURRENT_ENV);
        } else {
            console.error(err);
        }
    });


}

setEnvironment();
