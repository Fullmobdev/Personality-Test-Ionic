import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { TranslateModule } from '@ngx-translate/core';

import { SharedModule } from '../../shared/shared.module';
import { TribeMembersPage } from './tribe-members';

@NgModule({
    declarations: [TribeMembersPage],
    imports: [
        IonicPageModule.forChild(TribeMembersPage),
        TranslateModule,
        SharedModule
    ]
})
export class TribeMembersPageModule {}
