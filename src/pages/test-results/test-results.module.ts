import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { TranslateModule } from '@ngx-translate/core';

import { SharedModule } from '../../shared/shared.module';
import { TestResultsPage } from './test-results';

@NgModule({
    declarations: [TestResultsPage],
    imports: [
        IonicPageModule.forChild(TestResultsPage),
        TranslateModule,
        SharedModule
    ]
})
export class TestResultsPageModule {}
