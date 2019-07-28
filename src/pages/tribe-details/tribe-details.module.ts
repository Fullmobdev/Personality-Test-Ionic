import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';

import { SharedModule } from '../../shared/shared.module';
import { TribeDetailsPage } from './tribe-details';

@NgModule({
    declarations: [TribeDetailsPage],
    imports: [IonicPageModule.forChild(TribeDetailsPage), SharedModule]
})
export class TribeDetailsPageModule {}
