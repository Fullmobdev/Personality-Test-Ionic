import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';

import { SharedModule } from '../../shared/shared.module';
import { InviteMembersPage } from './invite-members';

@NgModule({
    declarations: [InviteMembersPage],
    imports: [
        IonicPageModule.forChild(InviteMembersPage),
        SharedModule,
    ]
})
export class InviteMembersPageModule {}
