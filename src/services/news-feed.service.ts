import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { NewsFeed, NewsFeedCategory, NewsFeedItem } from '../models/news-feed.model';

import { get } from 'lodash';
import { catchError, map, skip, take, throttleTime } from 'rxjs/operators';
import { environment } from '../app/environment';

/**
 * Service for news feed data
 */
@Injectable()
export class NewsFeedService {

    /**
     * Subject holding the current news feed
     */
    newsFeed$: BehaviorSubject<NewsFeed> = new BehaviorSubject([]);

    lastPageLoaded$: BehaviorSubject<number> = new BehaviorSubject(0);

    loadNewsFeedAction$: Subject<{page: number, clear: boolean}> = new Subject();

    loadingComplete$: Subject<void> = new Subject();

    constructor(private http: HttpClient) {
        this.loadNewsFeedAction$.pipe(
            throttleTime(500)
        ).subscribe(({page, clear}) => {
            this.directlyLoadNewsFeed(page, clear);
        });
    }

    /**
     * Get the current news feed
     */
    getNewsFeed(): Observable<NewsFeed> {
        return this.newsFeed$.asObservable();
    }

    /**
     * Get the last loaded page number
     */
    getLastPageLoaded(): Observable<number> {
        return this.lastPageLoaded$.asObservable();
    }

    /**
     * Load the news feed
     * @param page
     * @param clear
     */
    loadNewsFeed(page = 1, clear = false): Promise<void> {
        this.loadNewsFeedAction$.next({page, clear});
        return this.loadingComplete$.pipe(take(1)).toPromise();
    }

    /**
     * Load the news feed without throttling
     */
    private directlyLoadNewsFeed(page = 1, clear = false) {
        this.http.get(environment.newsFeed.url, {
            params: {
                page: `${page}`
            }
        }).pipe(
            map(transformWordpressFeedToNewsFeed),
            catchError(e => {
                this.loadingComplete$.next();
                return [[]];
            })
        ).subscribe(data => {
            this.lastPageLoaded$.next(page);
            const oldNewFeed = this.newsFeed$.getValue();
            const newNewsFeed = [...((clear) ? [] : oldNewFeed), ...data];
            this.newsFeed$.next(newNewsFeed);
            this.loadingComplete$.next();
        });
    }

}


export function transformWordpressFeedToNewsFeed(data: object[]): NewsFeed {
    return data.map(transformWordpressItemToNewsFeedItem);
}

export function transformWordpressItemToNewsFeedItem(item: object): NewsFeedItem {
    const wpCategories: any[] | null = get(item, '_embedded.wp:term.0');
    const wpTags: any[] | null = get(item, '_embedded.wp:term.1');

    return {
        title: get(item, 'title.rendered'),
        excerpt: get(item, 'excerpt.rendered'),
        content: get(item, 'content.rendered'),
        date: new Date(get(item, 'date')),

        author: {
            id: get(item, 'author'),
            name: get(item, '_embedded.author.0.name'),
            pictureUrl: get(item, '_embedded.author.0.avatar_urls.96'),
        },

        featuredImageUrl: get(item, '_embedded.wp:featuredmedia.0.media_details.sizes.full.source_url'),

        categories: (wpCategories && wpCategories.length > 0) ? wpCategories.map(transformWordpressCategoryToCategory) : [],
        tags: (wpTags && wpTags.length > 0) ? wpTags.map(transformWordpressTagToTag) : []
    };
}

export function transformWordpressCategoryToCategory(category: object): NewsFeedCategory {
    return {
        id: get(category, 'id'),
        name: get(category, 'name')
    }
}

export function transformWordpressTagToTag(tag: object): NewsFeedCategory {
    return {
        id: get(tag, 'id'),
        name: get(tag, 'name')
    }
}
