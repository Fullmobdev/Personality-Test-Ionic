import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { Observable } from 'rxjs';
import { pluck, take, tap } from 'rxjs/operators';

import { TestResultType } from '../../models/test-result-type.model';
import { ProfileService } from '../../services/profile.service';
import { AuthService } from '../../services/auth.service';
import { TestService } from '../../services/test.service';
import { User } from 'firebase';
import { TestResultActions, TestResultContext } from '../../shared/components/test-result/test-result';
import { IdModel } from '../../models/id.model';
import { ResultTypesService } from '../../services/result-types.service';


@IonicPage({
    segment: 'test-result/:resultTypeId'
})
@Component({
    selector: 'page-test-results',
    templateUrl: 'test-results.html'
})
export class TestResultsPage {

    resultType$: Observable<IdModel<TestResultType>>;
    user: User;

    context: TestResultContext;

    constructor(
        public navCtrl: NavController,
        public navParams: NavParams,
        private authService: AuthService,
        private profileService: ProfileService,
        private testService: TestService,
        private resultTypeService: ResultTypesService,
    ) {}

    async ionViewDidLoad() {
        const resultTypeId = this.navParams.get('resultTypeId');
        this.context = this.navParams.get('context');
        if (this.context === undefined) this.context = TestResultContext.OtherResult;
        this.resultType$ = this.resultTypeService.getResultType(resultTypeId);

        this.user = await this.authService
            .getUser()
            .pipe(take(1))
            .toPromise();
    }

    async onActionSelected(action: TestResultActions, resultType: TestResultType) {
        switch (action) {
            case TestResultActions.RetakeTest:
                await this.navCtrl.push('TestPage', {
                    testId: resultType.testId
                });
                break;

            case TestResultActions.Continue:
                if (!this.user.isAnonymous) {
                    await this.navCtrl.setRoot('DashboardPage');
                    await this.navCtrl.popToRoot();
                    await this.navCtrl.getActiveChildNav().select(3);
                } else {
                    this.navCtrl.push('SignupPage');
                }
                break;
        }
    }
}
