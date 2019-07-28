import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { AuthService } from '../../services/auth.service';
import { Observable } from 'rxjs/index';
import { Profile } from '../../models/profile.model';
import { ProfileService } from '../../services/profile.service';
import { User } from 'firebase';
import { filter, switchMap, take } from 'rxjs/operators';
import { LoginPage } from '../login/login';
import { FcmService } from '../../services/fcm.service';

/**
 * Generated class for the SettingsPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
    selector: 'page-settings',
    templateUrl: 'settings.html'
})
export class SettingsPage {

    authUser$: Observable<User>;

    profile$: Observable<Profile>;

    constructor(public navCtrl: NavController, public navParams: NavParams, private fcmService: FcmService,
                private auth: AuthService, private profileService: ProfileService) {
        this.authUser$ = this.auth.getUser();
        this.profile$ = this.authUser$.pipe(
            filter(Boolean),
            take(1),
            switchMap(authUser => this.profileService.getProfile(authUser.uid))
        );
    }

    ionViewDidLoad() {
        console.log('ionViewDidLoad SettingsPage');
    }

    async signOut() {
        await this.fcmService.clearCurrentTokenFromUser();
        await this.auth.signOut();
        this.navCtrl.setRoot('OnboardingPage');
    }

}
