import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';

import { Platform } from 'ionic-angular';
import { Firebase } from '@ionic-native/firebase';

import { AuthService } from './auth.service';
import { take } from 'rxjs/operators';

@Injectable()
export class FirebaseNotificationService {
    private collection = this.firestore.collection('devices');

    constructor(
        private platform: Platform,
        private firestore: AngularFirestore,
        private firebaseNative: Firebase,
        private authService: AuthService
    ) {}

    /**
     * Gets the device unique token and saves it to firebase
     * @returns
     */
    async getDeviceToken() {
        let token: string;
        if (this.platform.is('ios')) {
            token = await this.getTokenForIOS();
        } else if (this.platform.is('android')) {
            token = await this.getTokenForAndroid();
        } else if (this.platform.is('cordova')) {
            // ...
        }

        return this.saveToken(token);
    }

    /**
     * Listens to notificatons on native devices
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
    private async saveToken(token: string) {
        if (!token) {
            return;
        }

        const user = await this.authService
            .getUser()
            .pipe(take(1))
            .toPromise();

        return this.collection.doc(token).set({ token, userId: user.uid });
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
}
