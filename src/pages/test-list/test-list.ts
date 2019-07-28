import { Component } from '@angular/core';
import { App, IonicPage, NavController, NavParams, ToastController, AlertController } from 'ionic-angular';
import { Observable } from 'rxjs';

import { Test, TestTypes } from '../../models/test.model';
import { IdModel } from '../../models/id.model';
import { TestService } from '../../services/test.service';
import { NetworkService } from '../../services/network.service';
import { take, shareReplay } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';

@IonicPage()
@Component({
    selector: 'page-test-list',
    templateUrl: 'test-list.html'
})
export class TestListPage {

    tests$: Observable<IdModel<Test>[]>;

    isOnline$ = this.networkService.isOnline$.pipe(shareReplay(1));

    rootNavCtrl: NavController;

    constructor(
        private app: App,
        private navCtrl: NavController,
        private navParams: NavParams,
        private alert: AlertController,
        private testService: TestService,
        private translateService: TranslateService,
        private networkService: NetworkService
    ) {
        this.tests$ = this.testService.getOfflineTestList();
        this.rootNavCtrl = this.app.getRootNav();
    }

    async onTestClicked(test: IdModel<Test>) {
        const isOnline = await this.isOnline$.pipe(take(1)).toPromise();

        if (test.type === TestTypes.External && !isOnline) {
            const translations = await this.translateService.get(['tests.dismiss', 'tests.internetConnectionRequired']).pipe(take(1)).toPromise();

            const alert = this.alert.create({
                message: translations['tests.internetConnectionRequired'],
                buttons: [translations['tests.dismiss']]
            });

            return alert.present();
        }

        this.rootNavCtrl.push('TestPage', {
            testId: test.id
        });
    }

    ionViewDidLoad() {
        console.log('ionViewDidLoad TestListPage');
    }
}
