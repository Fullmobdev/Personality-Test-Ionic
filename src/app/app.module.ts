import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { AngularFirestoreModule } from '@angular/fire/firestore';
import { AngularFireStorageModule } from '@angular/fire/storage';
import { AngularFireModule } from '@angular/fire';
import { AngularFireAuthModule } from '@angular/fire/auth';

import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { Firebase } from '@ionic-native/firebase';
import { Facebook } from '@ionic-native/facebook';
import { GooglePlus } from '@ionic-native/google-plus';
import { SplashScreen } from '@ionic-native/splash-screen';
import { IonicStorageModule } from '@ionic/storage';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

import { StatusBar } from '@ionic-native/status-bar';
import {
    ImageLoaderConfig,
    IonicImageLoader
} from 'ionic-image-loader/dist/src';
import { Camera } from '@ionic-native/camera';
import { FilePath } from '@ionic-native/file-path';
import { Globalization } from '@ionic-native/globalization';
import { Deeplinks } from '@ionic-native/deeplinks';
import { SocialSharing } from '@ionic-native/social-sharing';


import { AuthService } from '../services/auth.service';
import { ProfileService } from '../services/profile.service';
import { StorageService } from '../services/storage.service';
import { TribeService } from '../services/tribe.service';
import { TestService } from '../services/test.service';
import { NewsFeedService } from '../services/news-feed.service';
import { ColorTagService } from '../services/color-tag.service';
import { FcmService } from '../services/fcm.service';
import { ResultTypesService } from '../services/result-types.service';

import { environment } from './environment';
import { FYTApp } from './app.component';
import { AngularFireFunctionsModule } from '@angular/fire/functions';
import { NetworkService } from '../services/network.service';

export function HttpLoaderFactory(http) {
    return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

@NgModule({
    declarations: [FYTApp],
    imports: [
        BrowserModule,
        HttpClientModule,
        IonicModule.forRoot(FYTApp, {
            statusbarPadding: true,
            swipeBackEnabled: true
        }),
        AngularFireModule.initializeApp(environment.firebaseConfig),
        AngularFireAuthModule,
        AngularFirestoreModule.enablePersistence(),
        AngularFireStorageModule,
        AngularFireFunctionsModule,
        IonicImageLoader.forRoot(),
        IonicStorageModule.forRoot(),
        TranslateModule.forRoot({
            loader: {
                provide: TranslateLoader,
                useFactory: HttpLoaderFactory,
                deps: [HttpClient]
            }
        })
    ],
    bootstrap: [IonicApp],
    entryComponents: [FYTApp],
    providers: [
        StatusBar,
        SplashScreen,
        Firebase,
        GooglePlus,
        Facebook,
        AuthService,
        ProfileService,
        StorageService,
        TestService,
        NewsFeedService,
        Camera,
        FilePath,
        TribeService,
        ColorTagService,
        FcmService,
        Globalization,
        ResultTypesService,
        Deeplinks,
        SocialSharing,
        NetworkService,
        { provide: ErrorHandler, useClass: IonicErrorHandler }
    ]
})
export class AppModule {
    constructor(private imageLoaderConfig: ImageLoaderConfig) {
        // Needed until issue with loading images is solved
        this.imageLoaderConfig.setImageReturnType('base64');
        this.imageLoaderConfig.enableSpinner(true);
        //this.imageLoaderConfig.setFileNameCachedWithExtension(true);
    }
}
