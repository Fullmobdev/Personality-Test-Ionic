import { Component } from '@angular/core';
import { NavController, IonicPage } from 'ionic-angular';
import { AngularFireAuth } from '@angular/fire/auth';
import { User } from 'firebase/app';
import { Observable } from 'rxjs';
import { take } from 'rxjs/operators';

@IonicPage()
@Component({
    selector: 'page-dashboard',
    templateUrl: 'dashboard.html'
})
export class DashboardPage {
    /* Observable Properties */

    authUser$: Observable<User>;

    constructor(
        public navCtrl: NavController,
        private fireAuth: AngularFireAuth
    ) {
        this.authUser$ = this.fireAuth.user;
    }

    async ionViewCanEnter() {
        const user = await this.fireAuth.user.pipe(take(1)).toPromise();
        return user && !user.isAnonymous;
    }
}
