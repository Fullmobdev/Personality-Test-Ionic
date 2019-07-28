import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { IonicImageLoader } from 'ionic-image-loader/dist/src';

import { ProfilePage } from './profile';
import { TranslateModule } from '@ngx-translate/core';
import { SharedModule } from '../../shared/shared.module';

@NgModule({
    declarations: [ProfilePage],
    imports: [
        IonicPageModule.forChild(ProfilePage),
        IonicImageLoader,
        TranslateModule,
        SharedModule
    ]
})
export class ProfilePageModule {}
