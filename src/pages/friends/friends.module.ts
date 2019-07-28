import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';

import { SharedModule } from '../../shared/shared.module';
import { FriendsPage } from './friends';

@NgModule({
    declarations: [
        FriendsPage
    ],
    imports: [
        IonicPageModule.forChild(FriendsPage),
        SharedModule
    ]
})
export class FriendsPageModule {
}
