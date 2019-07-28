import { Component, ViewChild } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Nav, Platform, ToastController } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { Observable } from 'rxjs';
import { User } from 'firebase/app';
import { take } from 'rxjs/operators';

import { Deeplinks } from '@ionic-native/deeplinks';

import { AuthService } from '../services/auth.service';
import { TestService } from '../services/test.service';
import { FcmService } from '../services/fcm.service';

@Component({
    templateUrl: 'app.html'
})
export class FYTApp {
    /** Observable Properties */

    authUser$: Observable<User>;

    /* Properties */

    @ViewChild('mainNav')
    nav: Nav;

    constructor(
        private platform: Platform,
        private statusBar: StatusBar,
        private splashScreen: SplashScreen,
        private deeplinks: Deeplinks,
        private translateService: TranslateService,
        private toast: ToastController,
        private fcmService: FcmService,
        private authService: AuthService,
        private testService: TestService
    ) {
        this.authUser$ = this.authService.getUser();

        this.platform.ready().then(() => {
            return this.onPlatformReady();
        });
    }

    /**
     * Called when the platform is ready
     */
    async onPlatformReady() {
        // Init ngx-translate
        this.translateService.setDefaultLang('en');
        this.translateService.use('en');

        this.fcmService.onPlatformReady();

        if (this.platform.is('cordova')) {
            if (this.platform.is('android')) {
                this.statusBar.overlaysWebView(true);
                this.statusBar.styleLightContent();
                this.statusBar.backgroundColorByHexString('#33000000');
            } else {
                this.statusBar.styleDefault();
            }

            this.splashScreen.hide();

            this.fcmService.listenToNativeNotifications().subscribe(async msg => {
                const user = await this.authService.getUser().pipe(take(1)).toPromise();
                if (user) {
                    if (msg.tap && msg.route) {
                        const route = JSON.parse(msg.route);
                        this.nav.push(route.page, route.params);
                    } else {
                        this.toast
                            .create({
                                message: msg.body,
                                duration: 6000
                            })
                            .present();
                    }
                }
            });


            this.deeplinks
                .routeWithNavController(this.nav, {
                    '/profile/:userId': 'ProfilePage',
                    '/profiles/:userId': 'ProfilePage'
                })
                .subscribe();
        }

        this.testService.saveTestsOffline().subscribe();
    }
}
