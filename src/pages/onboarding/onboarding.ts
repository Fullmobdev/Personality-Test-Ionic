import { Component } from '@angular/core';
import { IonicPage, LoadingController, NavController, Platform } from 'ionic-angular';
import { filter, take } from 'rxjs/operators';

import { environment } from '../../app/environment';
import { AuthService } from '../../services/auth.service';
import { StatusBar } from '@ionic-native/status-bar';
import { TestService } from '../../services/test.service';
import { TranslateService } from '@ngx-translate/core';

@IonicPage()
@Component({
    selector: 'page-onboarding',
    templateUrl: 'onboarding.html'
})
export class OnboardingPage {
    constructor(public navCtrl: NavController, private auth: AuthService, private platform: Platform, private translateService: TranslateService,
                private statusBar: StatusBar, private testService: TestService, private loadingCtrl: LoadingController) {

    }

    async onGetStartedClicked() {
        const loadingMessage = await this.translateService.get('onboarding.loading').pipe(take(1)).toPromise();
        const loading = this.loadingCtrl.create({
            content: loadingMessage
        });
        loading.present();

        const user = await this.auth
            .getUser()
            .pipe(take(1))
            .toPromise();

        if (!user) {
            await this.auth.signInAnonymously();
        }

        await this.testService.getOfflineTests().pipe(filter(Boolean), take(1)).toPromise();

        loading.dismissAll();

        await this.navCtrl.push('TestPage', {
            testId: environment.defaultTestId
        });

    }

    ionViewDidEnter() {
        this.platform.ready().then(() => {
            if (this.platform.is('cordova') && this.platform.is('ios')) {
                this.statusBar.styleLightContent()
            }
        })
    }

    ionViewDidLeave() {
        if (this.platform.is('cordova') && this.platform.is('ios')) {
            this.statusBar.styleDefault()
        }
    }

    onLoginClicked() {
        this.navCtrl.push('LoginPage');
    }
}
