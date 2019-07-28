import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { TranslateModule } from '@ngx-translate/core';

import { OnboardingPage } from './onboarding';

@NgModule({
    declarations: [OnboardingPage],
    imports: [IonicPageModule.forChild(OnboardingPage), TranslateModule]
})
export class OnboardingPageModule {}
