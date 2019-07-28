import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ArticleDetailsPage } from './article-details';
import { SharedModule } from '../../shared/shared.module';

@NgModule({
  declarations: [
    ArticleDetailsPage,
  ],
  imports: [
    IonicPageModule.forChild(ArticleDetailsPage), SharedModule
  ],
})
export class ArticleDetailsPageModule {}
