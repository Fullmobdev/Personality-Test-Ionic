/**
 * Created by Florian Reifschneider <florian@rocketloop.de>
 */

export type NewsFeed = NewsFeedItem[];


/**
 * Model that represents a single item displayed on the news feed
 */
export interface NewsFeedItem {

    title: string;

    excerpt: string;

    content: string;

    author: NewsFeedAuthor;

    featuredImageUrl: string;

    categories: NewsFeedCategory[];

    tags: NewsFeedTag[];

    externalLink?: string;

    date: Date;

}


/**
 * Model that represents the author of an item on the news feed
 */
export interface NewsFeedAuthor {

    id: string;

    name: string;

    pictureUrl: string;

}


/**
 * Model that represents a category of an item on the news feed
 */
export interface NewsFeedCategory {

    id: string;

    name: string;

}

/**
 * Model that represents a tag of an item on the news feed
 */
export interface NewsFeedTag {

    id: string;

    name: string;

}
