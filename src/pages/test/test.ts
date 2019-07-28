import { Component } from '@angular/core';
import { IonicPage, Loading, LoadingController, NavController, NavParams } from 'ionic-angular';
import { Observable } from 'rxjs';
import { switchMap, take, tap, shareReplay } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';

import { Test, TestTypes } from '../../models/test.model';
import { TestService } from '../../services/test.service';
import { IdModel } from '../../models/id.model';
import { TestResult } from '../../models/test-result.model';
import { AuthService } from '../../services/auth.service';
import { TestResultContext } from '../../shared/components/test-result/test-result';

@IonicPage({
    segment: 'test/:testId'
})
@Component({
    selector: 'page-test',
    templateUrl: 'test.html'
})
export class TestPage {

    test$: Observable<IdModel<Test>>;

    private testId: string;

    private loading: Loading;

    constructor(
        public navCtrl: NavController,
        public navParams: NavParams,
        private loadingCtrl: LoadingController,
        private authService: AuthService,
        private testService: TestService,
        private translateService: TranslateService
    ) {
        this.testId = this.navParams.get('testId');

        this.test$ = this.translateService.get('tests.loading')
            .pipe(
                take(1),
                tap(message => {
                    this.loading = this.loadingCtrl.create({
                        content: message
                    });

                    this.loading.present();
                }),
                switchMap(() => this.testService.getOfflineTest(this.testId)
                    .pipe(
                        tap(() => this.loading.dismiss())
                    )
                ),
                shareReplay(1)
            );
    }


    async onTestCompleted(answers) {
        const user = await this.authService.getUser().pipe(take(1)).toPromise();
        const test = await this.test$.pipe(take(1)).toPromise();
        const loadingMessage = await this.translateService.get('tests.evaluatingResult').pipe(take(1)).toPromise();

        this.loading = this.loadingCtrl.create({
            content: loadingMessage
        });

        this.loading.present();

        let result: TestResult;

        if (test.type === TestTypes.Internal) {
            result = test.evaluateFn(answers);
        } else {
            result = await this.testService.evaluateExternalTestAnswers(answers, test.evaluate);
        }

        await this.testService.storeTestResultForUser(user.uid, this.testId, { ...result, answers });

        // Remove the test page after the results have been shown
        let currentIndex = this.navCtrl.getActive().index;
        await this.navCtrl.push('TestResultsPage', {
            resultTypeId: result.resultTypeId,
            context: TestResultContext.InitialResult
        });
        this.navCtrl.remove(currentIndex);

        this.loading.dismiss();
    }
}
