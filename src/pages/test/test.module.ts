import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { TranslateModule } from '@ngx-translate/core';
import { TestPage } from './test';
import { SharedModule } from '../../shared/shared.module';

@NgModule({
    declarations: [TestPage],
    imports: [
        IonicPageModule.forChild(TestPage),
        TranslateModule,
        SharedModule
    ]
})
export class TestPageModule {}
