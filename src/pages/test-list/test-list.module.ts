import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { TestListPage } from './test-list';
import { SharedModule } from '../../shared/shared.module';

@NgModule({
    declarations: [
        TestListPage,
    ],
    imports: [
        IonicPageModule.forChild(TestListPage),
        SharedModule
    ],
})
export class TestListPageModule {}
