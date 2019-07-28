import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { SettingsPage } from './settings';
import { TranslateModule } from '@ngx-translate/core';
import { IonicImageLoader } from 'ionic-image-loader/dist/src';

@NgModule({
  declarations: [
      SettingsPage,
  ],
  imports: [
      IonicPageModule.forChild(SettingsPage), TranslateModule, IonicImageLoader,
  ],
})
export class SettingsPageModule {}
