import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { EditProfilePage } from './edit-profile';
import { SharedModule } from '../../shared/shared.module';

@NgModule({
    declarations: [
        EditProfilePage,
    ],
    imports: [
        IonicPageModule.forChild(EditProfilePage),
        SharedModule
    ],
})
export class EditProfilePageModule {}
