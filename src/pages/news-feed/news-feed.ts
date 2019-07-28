import { Component, OnInit } from '@angular/core';
import { App, IonicPage, NavController, NavParams, Refresher } from 'ionic-angular';
import { NewsFeedService } from '../../services/news-feed.service';
import { Observable } from 'rxjs';
import { NewsFeed, NewsFeedItem, NewsFeedTag } from '../../models/news-feed.model';
import { map, take } from 'rxjs/operators';
import { ColorTagService } from '../../services/color-tag.service';

@IonicPage()
@Component({
    selector: 'page-news-feed',
    templateUrl: 'news-feed.html'
})
export class NewsFeedPage {

    newsFeed$: Observable<NewsFeed>;

    tags: NewsFeedTag[];

    constructor(private app: App, public navCtrl: NavController, public navParams: NavParams,
                private newsFeedService: NewsFeedService, public colorTag: ColorTagService) {
        this.newsFeed$ = this.newsFeedService.getNewsFeed();
    }

    ionViewWillEnter() {
        this.newsFeedService.loadNewsFeed(1, true);
    }

    async onLoadMorePosts() {
        const lastLoadedPage = await this.newsFeedService.getLastPageLoaded().pipe(take(1)).toPromise();
        return this.newsFeedService.loadNewsFeed(lastLoadedPage + 1);
    }

    async onRefresh(refresher: Refresher) {
        await this.newsFeedService.loadNewsFeed(1, true);
        refresher.complete();
    }

    onArticleClicked(article: NewsFeedItem) {
        this.app.getRootNav().push('ArticleDetailsPage', { article });
    }

    getColorForTag(tagName: string) {
        return this.colorTag.getColor(tagName)
    }

}
