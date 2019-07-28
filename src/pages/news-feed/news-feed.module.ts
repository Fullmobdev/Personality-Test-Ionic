import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { TranslateModule } from '@ngx-translate/core';

import { NewsFeedPage } from './news-feed';
import { SharedModule } from '../../shared/shared.module';

@NgModule({
    declarations: [NewsFeedPage],
    imports: [IonicPageModule.forChild(NewsFeedPage), TranslateModule, SharedModule]
})
export class NewsFeedPageModule {}
