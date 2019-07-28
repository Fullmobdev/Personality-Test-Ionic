export interface Tribe {
    id?: string;
    name: string;
    description: string;
    imgSrc?: string;
    imgBlob?: Blob;
    ownerId: string;
    members: string[];
}
