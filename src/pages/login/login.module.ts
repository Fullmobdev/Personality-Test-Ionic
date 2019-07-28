import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { TranslateModule } from '@ngx-translate/core';

import { LoginPage } from './login';
import { SharedModule } from '../../shared/shared.module';

@NgModule({
    declarations: [LoginPage],
    imports: [IonicPageModule.forChild(LoginPage), TranslateModule, SharedModule]
})
export class LoginPageModule {}
