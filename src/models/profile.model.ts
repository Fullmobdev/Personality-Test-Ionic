export interface Profile {
    id?: string;

    displayName: string;

    gender?: string;

    email: string;

    pictureUrl: string;

    resultTypes: any;

    traits: any;

    results?: { [key: string]: any };

    friends: string[];
}


export type AlgoliaProfileEntity =
    Pick<Profile, 'displayName'> & { objectID: string }
