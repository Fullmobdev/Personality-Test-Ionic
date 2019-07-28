import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { TranslateModule } from '@ngx-translate/core';

import { SignupPage } from './signup';
import { SharedModule } from '../../shared/shared.module';

@NgModule({
    declarations: [SignupPage],
    imports: [IonicPageModule.forChild(SignupPage), TranslateModule, SharedModule]
})
export class SignupPageModule {}
