import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import * as firebase from 'firebase/app';
import { take } from 'rxjs/operators';

import { Platform } from 'ionic-angular';
import { Firebase } from '@ionic-native/firebase';
import { Globalization } from '@ionic-native/globalization';

import { AuthService } from './auth.service';

@Injectable()
export class FcmService {
    private collection = this.firestore.collection('devices');

    currentToken: string;

    constructor(
        private platform: Platform,
        private firestore: AngularFirestore,
        private firebaseNative: Firebase,
        private globalization: Globalization,
        private authService: AuthService
    ) {

    }

    onPlatformReady() {
        if (this.platform.is('cordova')) {
            this.listenForAuthChanges();
        } else {
            // No notifications on web for now
        }
    }

    private listenForAuthChanges() {
        this.authService.getAuthState().subscribe(async user => {
            if (user) {
                const token = await this.getDeviceToken();
                await this.saveTokenForCurrentUser(token);
            } else {
                await this.clearCurrentTokenFromUser();
            }
        });
    }

    /**
     * Gets the device unique token and saves it to firebase
     * @returns
     */
    async getDeviceToken() {
        if (this.platform.is('ios')) {
            return await this.getTokenForIOS();
        } else if (this.platform.is('android')) {
            return await this.getTokenForAndroid();
        } else {
            return null;
        }
    }

    /**
     * Listens to notifications on native devices
     * @returns
     */
    listenToNativeNotifications() {
        return this.firebaseNative.onNotificationOpen();
    }

    /**
     * Saves associated token to the device into firebase
     * @param token - Token to be saved
     * @returns
     */
    private async saveTokenForCurrentUser(token: string) {
        if (!token) {
            return;
        }

        const user = await this.authService
            .getUser()
            .pipe(take(1))
            .toPromise();

        const { value } = await this.globalization.getPreferredLanguage();
        const lang = value.split('-')[0];

        if (user) {
            const document = await this.collection
                .doc<{ devices: any[] }>(user.uid)
                .valueChanges()
                .pipe(take(1))
                .toPromise();

            if (document) {
                const devices = document.devices.filter(
                    device => device.token !== token
                );

                this.collection.doc(user.uid).update({
                    devices: [...devices, { lang, token }]
                });
            } else {
                this.collection
                    .doc(user.uid)
                    .set({ devices: [{ lang, token }] });
            }

            this.currentToken = token;
        }
    }

    /**
     * Gets token for android devices
     * @returns
     */
    async getTokenForAndroid() {
        return await this.firebaseNative.getToken();
    }

    /**
     * Gets token for iOS devices
     * @returns
     */
    async getTokenForIOS() {
        const token = await this.firebaseNative.getToken();
        await this.firebaseNative.grantPermission();
        return token;
    }

    async clearCurrentTokenFromUser() {
        const user = await this.authService
                               .getUser()
                               .pipe(take(1))
                               .toPromise();
        if (user) {
            const document = await this.collection
                                       .doc<{ devices: any[] }>(user.uid)
                                       .valueChanges()
                                       .pipe(take(1))
                                       .toPromise();

            if (document) {
                const devices = document.devices.filter(
                    device => device.token !== this.currentToken
                );
                this.collection.doc(user.uid).update({
                    devices: devices
                });
            }
        }
    }
}
