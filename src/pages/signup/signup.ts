import { Component, Input } from '@angular/core';
import {
    AlertController, Content,
    IonicPage,
    NavController,
    Platform
} from 'ionic-angular';

import { AuthService } from '../../services/auth.service';
import { TranslateService } from '@ngx-translate/core';
import { take } from 'rxjs/operators';

/**
 * Page component used to sign up new users after they finished their first test
 */
@IonicPage({
    defaultHistory: ['OnboardingPage']
})
@Component({
    selector: 'page-signup',
    templateUrl: 'signup.html'
})
export class SignupPage {

    @Input('scrollContent') scrollContent: Content;

    constructor(
        private navCtrl: NavController,
        private alertCtrl: AlertController,
        private platform: Platform,
        private auth: AuthService,
        private translateService: TranslateService
    ) {}

    get isCordova() {
        return this.platform.is('cordova');
    }

    async signUpWithGoogle() {
        this.isCordova
            ? await this.auth
                  .linkNativeGoogle()
                  .catch(error => this.handleLinkProfileError(error))
            : await this.auth
                  .linkWebGoogle()
                  .catch(error => this.handleLinkProfileError(error));

        await this.navCtrl.setRoot('DashboardPage');
    }

    async signUpWithFacebook() {
        this.isCordova
            ? await this.auth
                  .linkNativeFacebook()
                  .catch(error => this.handleLinkProfileError(error))
            : await this.auth
                  .linkWebFacebook()
                  .catch(error => this.handleLinkProfileError(error));

        await this.navCtrl.setRoot('DashboardPage');
    }

    private async handleLinkProfileError(error) {
        const title = await this.translateService.get('auth.accountExistsDialog.title').pipe(take(1)).toPromise();
        const message = await this.translateService.get('auth.accountExistsDialog.content').pipe(take(1)).toPromise();
        const alertCfg = {
            title: title,
            message: message,
            buttons: [
                'Cancel',
                {
                    text: 'To Login',
                    handler: () => {
                        this.navCtrl.setRoot('OnboardingPage').then(() => {
                            this.navCtrl.push('LoginPage');
                        });
                    }
                }
            ]
        };
        await this.alertCtrl.create(alertCfg).present();
    }
}
