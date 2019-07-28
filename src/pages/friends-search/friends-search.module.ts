import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { FriendsSearchPage } from './friends-search';

import { SharedModule } from '../../shared/shared.module';

@NgModule({
    declarations: [
        FriendsSearchPage
    ],
    imports: [
        IonicPageModule.forChild(FriendsSearchPage),
        SharedModule
    ]
})
export class FriendsSearchPageModule {
}
