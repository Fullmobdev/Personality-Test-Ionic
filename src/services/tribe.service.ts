import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore';
import { combineLatest, Observable } from 'rxjs';
import { filter, map, pluck, switchMap, take } from 'rxjs/operators';

import { Tribe } from '../models/tribe.model';
import { Profile } from '../models/profile.model';
import { AuthService } from './auth.service';
import { StorageService } from './storage.service';
import { IdModel } from '../models/id.model';

/**
 * Manages tribe collection in Firestore
 */
@Injectable()
export class TribeService {
    // @todo: implement querying only users tribes
    private collection = this.firestore.collection<Tribe>('tribes');

    constructor(
        private firestore: AngularFirestore,
        private auth: AuthService,
        private storageService: StorageService
    ) {
    }

    /**
     * Gets the tribes collection
     */
    getTribesCollection(): AngularFirestoreCollection<Tribe> {
        return this.collection;
    }

    /**
     * Gets the tribes collection with an ID added to each document
     */
    getTribesWithIds(): Observable<Tribe[]> {
        return this.auth.getUser().pipe(
            filter(Boolean),
            switchMap(user => {
                return this.firestore.collection<Tribe>('tribes', ref => {
                    return ref.where('members', 'array-contains', user.uid)
                }).snapshotChanges()
            }),
            map(actions =>
                actions.map(action => ({
                    id: action.payload.doc.id,
                    ...action.payload.doc.data()
                }))
            )
        );
    }

    /**
     * Creates a tribe
     * @param tribe Tribe data
     */
    async createTribe(tribe: Tribe): Promise<string> {
        const user = await this.auth
            .getUser()
            .pipe(take(1))
            .toPromise();
        const { imgBlob, ...tribeData } = tribe;

        const tribeDoc = await this.collection.add({
            ...tribeData,
            ownerId: user.uid,
            members: [user.uid]
        });

        if (!!imgBlob) {
            const imgSrc = await this.uploadTribePictureFromBlob(
                tribeDoc.id,
                imgBlob
            );

            await this.updateTribe(tribeDoc.id, { imgSrc });
        }
        return tribeDoc.id;
    }

    /**
     * Gets a tribe from the given ID
     * @param tribeId Tribe ID
     */
    getTribe(tribeId: string): Observable<IdModel<Tribe>> {
        return this.collection.doc<Tribe>(tribeId)
            .valueChanges()
            .pipe(
                map(tribe => ({
                    id: tribeId,
                    ...tribe
                }))
            );
    }

    /**
     * Updates a tribe
     * @param id Tribe ID to be updated
     * @param data Data to be updated
     */
    async updateTribe(id: string, data: Partial<Tribe>) {
        const { imgBlob, ...tribeData } = data;

        if (!!imgBlob) {
            const imgSrc = await this.uploadTribePictureFromBlob(id, imgBlob);
            Object.assign(tribeData, {
                imgSrc
            });
        }

        this.collection.doc(id).set(tribeData, { merge: true });
    }

    /**
     * Uploads the tribes picture from a Blob
     * @param tribeId Tribes ID
     * @param blob Tribes picture Blob
     */
    async uploadTribePictureFromBlob(tribeId: string, blob: Blob) {
        try {
            return await this.storageService.storeFileFromBlob(
                `tribePictures/${tribeId}.jpg`,
                blob
            );
        } catch (error) {
            throw error;
        }
    }

    /**
     * Gets the tribes members
     * @param tribeId Tribes ID
     */
    getTribeMembers(tribeId: string): Observable<Profile[]> {
        const profilesRef$ = this.firestore.collection('profiles');

        const withId = snap => ({
            id: snap.payload.id,
            ...snap.payload.data()
        });

        return this.getTribe(tribeId)
            .pipe(
                pluck<IdModel<Tribe>, string[]>('members'),
                switchMap(members =>
                    combineLatest(
                        ...members.map(memberId =>
                            profilesRef$.doc<Profile>(memberId)
                                .snapshotChanges()
                                .pipe(map(withId))
                        )
                    )
                ));
    }
}
