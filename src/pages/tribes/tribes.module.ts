import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';

import { SharedModule } from '../../shared/shared.module';
import { TribesPage } from './tribes';

@NgModule({
    declarations: [TribesPage],
    imports: [
        IonicPageModule.forChild(TribesPage),
        SharedModule
    ]
})
export class TribesPageModule {}
