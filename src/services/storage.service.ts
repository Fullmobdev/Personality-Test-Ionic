import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AngularFireStorage } from '@angular/fire/storage';

import { last, take } from 'rxjs/operators';

/**
 * Handles storage on Firebase
 */
@Injectable()
export class StorageService {


    constructor(
        private http: HttpClient,
        private fireStorage: AngularFireStorage
    ) {}

    // Actions

    /**
     * Store the file at the given URL to the target path
     * @param url
     * @param targetPath
     */
    async storeFileFromUrl(targetPath: string, url: string): Promise<string> {
        const response = await this.http.get(url, {
            observe: 'response',
            responseType: 'blob'
        }).toPromise();
        const fileBlob = response.body;
        const metadata = {
            contentType: fileBlob.type
        };
        const ref = this.fireStorage.ref(targetPath);
        const task = ref.put(fileBlob);
        await task.snapshotChanges().pipe(last()).toPromise();
        return await ref.getDownloadURL().pipe(take(1)).toPromise();
    }

    /**
     * Store the file from given Blob to the target path
     * @param targetPath
     * @param fileBlob Blob from which file will be stored
     */
    async storeFileFromBlob(targetPath: string, fileBlob: Blob): Promise<string> {
        const ref = this.fireStorage.ref(targetPath);
        const task = ref.put(fileBlob);
        await task.snapshotChanges().pipe(last()).toPromise();
        return await ref.getDownloadURL().pipe(take(1)).toPromise();
    }
}
