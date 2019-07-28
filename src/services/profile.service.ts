import { Injectable } from '@angular/core';
import {
    AngularFirestore,
    AngularFirestoreDocument
} from '@angular/fire/firestore';
import { User, auth, default as firebase } from 'firebase/app';

import * as algolia from 'algoliasearch';

import { combineLatest, Observable, of } from 'rxjs';
import { distinctUntilChanged, map, pluck, switchMap } from 'rxjs/operators';
import { isEqual } from 'lodash';

import { Profile } from '../models/profile.model';
import { IdModel } from '../models/id.model';
import {
    getProfilePictureInSize,
    getFacebookProfilePictureInSize,
    getGoogleProfilePictureInSize
} from '../helpers/user.helper';
import { StorageService } from './storage.service';
import { FirebaseAuthProviderIds } from '../models/firebase.model';
import { PillItem } from '../models/pill-item.model';

import { environment } from '../app/environment';

/**
 * Manages operations over the 'profiles' collection in Firestore
 */
@Injectable()
export class ProfileService {
    algoliaClient: algolia.Client;
    algoliaIndex: algolia.Index;

    constructor(
        private firestore: AngularFirestore,
        private storageService: StorageService
    ) {
        // Initialize Algolia client
        const { appId, apiKey } = environment.firebaseConfig.algoliaConfig;
        this.algoliaClient = algolia(appId, apiKey);
        this.algoliaIndex = this.algoliaClient.initIndex('profiles');
    }

    /**
     * Gets the requested profile document
     * @param userId Users ID to fetch
     * @returns Users profile Firestore document
     */
    getProfileDoc(userId: string): AngularFirestoreDocument<Profile> {
        return this.firestore.doc<Profile>(`profiles/${userId}`);
    }

    /**
     * Gets the requested profile
     * @param userId Users ID to fetch
     * @returns Users profile
     */
    getProfile(userId: string): Observable<Profile> {
        return this.getProfileDoc(userId).valueChanges();
    }

    /**
     * Gets the requested profile as an IdModel
     * @param userId Users ID to fetch
     * @returns Users profile
     */
    getProfileIdModel(userId: string): Observable<IdModel<Profile>> {
        return this.getProfile(userId).pipe(
            map(profile => {
                return !!profile
                    ? { ...profile, id: userId }
                    : null;
            })
        );
    }

    /**
     * Gets all the profiles
     * Adds the profile id to the profile document
     * @returns List of profiles
     */
    getAllProfiles(): Observable<Profile[]> {
        return this.firestore
                   .collection<Profile>(`profiles`)
                   .snapshotChanges()
                   .pipe(
                       map(actions =>
                           actions.reduce((acc, action) => {
                               const profile = action.payload.doc.data();
                               const id = action.payload.doc.id;

                               acc = [...acc, { id, ...profile }];
                               return acc;
                           }, [])
                       )
                   );
    }

    /**
     * Checks if the given user has a profile
     * @param userId Users ID
     */
    hasProfile(userId: string): Observable<boolean> {
        return this.getProfile(userId).pipe(map(Boolean));
    }

    // Actions

    /**
     * Creates a profile for given user
     * @param user User for which the profile will be created
     */
    async createProfileForUser(user: User): Promise<void> {
        const userId = user.uid;
        const userData: Partial<Profile> = {
            displayName: user.displayName,
            email: user.email,
            friends: []
        };

        const pictureUrl = await this.handleProfilePicture(user);

        if (!!pictureUrl) {
            Object.assign(userData, { pictureUrl });
        }

        return this.firestore
                   .collection('profiles')
                   .doc(userId)
                   .set(userData);
    }

    async createLinkedProfile(credential: auth.UserCredential) {
        const { providerId } = credential.additionalUserInfo;
        const userId = credential.user.uid;
        const { name: displayName, email } = credential
            .additionalUserInfo.profile as any; // Because profile is Object in typings

        const picture = credential.user.providerData[0].photoURL;
        const pictureUrl =
            providerId === FirebaseAuthProviderIds.Facebook
                ? getFacebookProfilePictureInSize(picture, 512)
                : getGoogleProfilePictureInSize(picture, 512);

        return this.firestore
                   .collection('profiles')
                   .doc(userId)
                   .set({
                       displayName,
                       email,
                       friends: [],
                       pictureUrl: await this.storeProfilePicture(userId, pictureUrl)
                   });
    }

    /**
     * Updates users profile
     * @param userId Users ID
     * @param profile Information to be updated
     */
    updateProfile(userId: string, profile: Partial<Profile>): Promise<void> {
        return this.getProfileDoc(userId).update(profile);
    }

    /**
     * Updates users profile picture
     * @param userId Users ID
     * @param pictureBlob Uses picture Blob
     */
    async updateProfilePictureFromBlob(userId: string, pictureBlob: Blob) {
        const fileUrl = await this.storageService.storeFileFromBlob(
            `profilePictures/${userId}.jpg`,
            pictureBlob
        );
        return await this.getProfileDoc(userId).update({
            pictureUrl: fileUrl
        });
    }

    private async storeProfilePicture(userId: string, pictureUrl: string) {
        if (pictureUrl) {
            try {
                return await this.storageService.storeFileFromUrl(
                    `profilePictures/${userId}.jpg`,
                    pictureUrl
                );
            } catch (error) {
                console.error('ERROR', error);
            }
        }
    }

    private async handleProfilePicture(user: User) {
        const userId = user.uid;
        const pictureUrl = getProfilePictureInSize(user, 512);
        return this.storeProfilePicture(userId, pictureUrl);
    }

    /**
     * Search Algolia profiles index for a given match
     * @param query - What should Algolia search
     * @returns Algolia matching results or an object with empty hits list in case of no query supplied
     */
    searchProfiles(query: string) {
        return query
            ? this.algoliaIndex
                  .search(query)
                  .then(({ hits }) => hits.map(hit => hit.objectID))
            : Promise.resolve([]);
    }

    /**
     * Get profiles from the collection
     * @param ids - List of ids to fetch from profiles collection
     * @returns List of profiles or an empty Observable list
     */
    getProfiles(ids: string[]): Observable<IdModel<Profile>[]> {
        return ids && ids.length > 0
            ? combineLatest(
                ...ids.map(id => this.getProfileIdModel(id))
            ).pipe(map(profiles => profiles.filter(Boolean)))
            : of([]);
    }

    getProfileFriends(userId: string) {
        return this.getProfile(userId).pipe(
            pluck<Profile, string[]>('friends'),
            distinctUntilChanged((oldIds, newIds) => {
                return isEqual(oldIds, newIds);
            }),
            switchMap(ids => this.getProfiles(ids))
        );
    }

    /**
     * Updates users result type
     * @param {string} userId
     * @param {PillItem} resultType
     * @returns {Promise<void>}
     */
    storeProfileResultType(userId: string, resultType: PillItem) {
        if (resultType.disabled) {
            return this.getProfileDoc(userId).update({
                resultTypes: firebase.firestore.FieldValue.arrayUnion(resultType.id)
            });
        } else {
            return this.removeResultTypeFromProfile(userId, resultType.id);
        }
    }

    /**
     * Removes result type by given id and userId
     * @param {string} userId
     * @param {string} resultTypeId
     * @returns {Promise<void>}
     */
    removeResultTypeFromProfile(userId: string, resultTypeId: string) {
        return this.getProfileDoc(userId).update({
            resultTypes: firebase.firestore.FieldValue.arrayRemove(resultTypeId)
        });
    }

    /**
     * Updates users trait
     * @param {string} userId
     * @param {PillItem} trait
     * @returns {Promise<void>}
     */
    storeProfileTrait(userId: string, trait: PillItem) {
        if (trait.disabled) {
            return this.getProfileDoc(userId).update({
                traits: firebase.firestore.FieldValue.arrayUnion(trait.id)
            });
        } else {
            return this.removeTraitFromProfile(userId, trait.id);
        }
    }

    /**
     * Removes trait by given id and userId
     * @param {string} userId
     * @param {string} traitId
     * @returns {Promise<void>}
     */
    removeTraitFromProfile(userId: string, traitId: string) {
        return this.getProfileDoc(userId).update({
            traits: firebase.firestore.FieldValue.arrayRemove(traitId)
        });
    }

    /**
     * Removes traits by given ids and userId
     * @param {string} userId
     * @param {string[]} traitIds
     * @returns {Promise<void>}
     */
    removeTraitsFromProfile(userId: string, traitIds: string[]) {
        if (traitIds.length > 0) {
            return this.getProfileDoc(userId).update({
                traits: firebase.firestore.FieldValue.arrayRemove(...traitIds)
            });
        }
    }
}
