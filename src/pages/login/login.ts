import { Component, Input } from '@angular/core';
import { Content, IonicPage, NavController } from 'ionic-angular';
import { User } from 'firebase/app';
import { pluck, map, take } from 'rxjs/operators';

import { AuthService } from '../../services/auth.service';
import { TestService } from '../../services/test.service';
import { TestResults } from '../../models/test-result.model';
import { environment } from '../../app/environment';

@IonicPage()
@Component({
    selector: 'page-login',
    templateUrl: 'login.html'
})
export class LoginPage {

    @Input('scrollContent') scrollContent: Content;

    constructor(
        private navCtrl: NavController,
        private authService: AuthService,
        private testService: TestService
    ) {}

    async signInWithGoogle() {
        try {
            const user = await this.authService.loginGoogle();
            if (user) {
                await this.setRootNav(user);
            }
        } catch (error) {
            console.error(error);
        }
    }

    async signInWithFacebook() {
        try {
            const user = await this.authService.loginFacebook();
            if (user) {
                await this.setRootNav(user);
            }
        } catch (error) {
            console.error(error);
        }
    }

    private async setRootNav(user: User) {
        const initialTestPassed = await this.testService
            .getTestResultsForUser(user.uid)
            .pipe(
                pluck<TestResults, any>(environment.defaultTestId),
                map(Boolean),
                take(1)
            )
            .toPromise();

        initialTestPassed
            ? this.navCtrl.setRoot('DashboardPage')
            : this.navCtrl.setRoot('TestPage', {
                  testId: environment.defaultTestId
              });
    }
}
