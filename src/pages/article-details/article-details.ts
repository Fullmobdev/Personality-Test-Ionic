import { Component, Input } from '@angular/core';
import { Content, IonicPage, NavController, NavParams } from 'ionic-angular';
import { NewsFeedItem, NewsFeedTag } from '../../models/news-feed.model';
import { ColorTagService } from '../../services/color-tag.service';

/**
 * Generated class for the ArticleDetailsPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
    selector: 'page-article-details',
    templateUrl: 'article-details.html'
})
export class ArticleDetailsPage {

    @Input('scrollContent') scrollContent: Content;

    article: NewsFeedItem;

    constructor(public navCtrl: NavController, public navParams: NavParams, public colorTag: ColorTagService) {
        this.article = this.navParams.get('article');
    }

    ionViewDidLoad() {
        console.log('ionViewDidLoad ArticleDetailsPage');
    }

    getColorForTag(tagName: string) {
        return this.colorTag.getColor(tagName)
    }

}
