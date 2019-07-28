import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { TranslateModule } from '@ngx-translate/core';

import { SharedModule } from '../../shared/shared.module';
import { EditTribePage } from './edit-tribe';

@NgModule({
    declarations: [EditTribePage],
    imports: [
        IonicPageModule.forChild(EditTribePage),
        TranslateModule,
        SharedModule
    ]
})
export class EditTribePageModule {}
