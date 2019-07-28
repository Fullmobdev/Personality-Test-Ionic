import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { auth, FirebaseError, User } from 'firebase/app';

import { GooglePlus } from '@ionic-native/google-plus';
import { Facebook } from '@ionic-native/facebook';
import {
    AlertController,
    App,
    Loading,
    LoadingController,
    NavController,
    Platform
} from 'ionic-angular';
import { Observable } from 'rxjs';
import { distinctUntilChanged, take } from 'rxjs/operators';

import { FirebaseAuthProviderIds } from '../models/firebase.model';
import { ProfileService } from './profile.service';
import { environment } from '../app/environment';

export enum FirebaseAuthErrors {
    AccountExistsWithDifferentCredentials = 'auth/account-exists-with-different-credential',
    CredentialAlreadyInUse = 'auth/credential-already-in-use'
}

export interface LoginError extends FirebaseError {
    email: string;
    credential: auth.AuthCredential;
}

/**
 * Handles Firebase authentication in the application
 */
@Injectable()
export class AuthService {
    navCtrl: NavController;

    loadingSpinner: Loading;

    constructor(
        private platform: Platform,
        private app: App,
        private alertCtrl: AlertController,
        private loadingCtrl: LoadingController,
        private fireAuth: AngularFireAuth,
        private google: GooglePlus,
        private facebook: Facebook,
        private profileService: ProfileService
    ) {
        this.platform.ready().then(() => {
            this.onPlatformReady();
        });
    }

    onPlatformReady() {
        this.navCtrl = this.app.getRootNav();
        this.fireAuth.authState
            .pipe(distinctUntilChanged())
            .subscribe(user => this.onAuthStateChanged(user));
    }

    get isCordova() {
        return this.platform.is('cordova');
    }

    /**
     * Signs in the user anonymously into firebase and creates a blank profile
     */
    async signInAnonymously() {
        await this.fireAuth.auth.signInAnonymously();
        return this.getUser();
    }

    /**
     * Handles authentication state changes
     * Triggers after users signs up, creates a profile for it
     * Sets the root navigation of the app
     */
    async onAuthStateChanged(user: User | null) {
        if (user && !user.isAnonymous) {
            this.navCtrl.setRoot('DashboardPage');
            this.dismissLoadingSpinner();
        } else {
            this.navCtrl.setRoot('OnboardingPage');
        }
    }

    /**
     * Signs out from Firebase
     * @return
     */
    signOut(): Promise<void> {
        return this.fireAuth.auth.signOut();
    }

    /**
     * Returns current user
     * @returns Currently authorized user
     */
    getUser(): Observable<User> {
        return this.fireAuth.user;
    }

    /**
     * Returns current auth state from Firebase
     * @returns Currently auth state
     */
    getAuthState(): Observable<User | null> {
        return this.fireAuth.authState;
    }

    /**
     * Handles login to Firebase via Google
     * Depending on the environment, calls the "Web" or "Native" auth flow
     */
    async loginGoogle(email?: string): Promise<User> {
        this.showLoadingSpinner('Signing in using Google');
        let user: User;

        try {
            if (this.isCordova) {
                user = await this.loginNativeGoogle();
            } else {
                user = await this.loginWebGoogle();
            }

            await this.handleUserProfile(user);

            return user;
        } catch (e) {
            console.error(e);
            const user = await this.handleLoginError(e);
            if (!user) this.dismissLoadingSpinner();
            return user;
        }
    }

    /**
     * Handles login to Firebase via Facebook
     * Depending on the environment, calls the "Web" or "Native" auth flow
     */
    async loginFacebook(): Promise<User> {
        this.showLoadingSpinner('Signing in using Facebook');
        let user: User;

        try {
            if (this.isCordova) {
                user = await this.loginNativeFacebook();
            } else {
                user = await this.loginWebFacebook();
            }

            await this.handleUserProfile(user);
            return user;
        } catch (e) {
            const user = await this.handleLoginError(e);
            if (!user) this.dismissLoadingSpinner();
            return user;
        }
    }

    private async handleUserProfile(user: User) {
        const profile = await this.profileService
            .hasProfile(user.uid)
            .pipe(take(1))
            .toPromise();

        if (!profile) {
            await this.profileService.createProfileForUser(user);
        }
    }

    /**
     * Displays the loading spinner (indicator) when called
     */
    private showLoadingSpinner(message: string) {
        if (this.loadingSpinner) this.loadingSpinner.dismiss();
        this.loadingSpinner = this.loadingCtrl.create({
            content: message
        });
        this.loadingSpinner.present();
    }

    /**
     * Dismisses the loading spinner (indicator) when called
     */
    private dismissLoadingSpinner() {
        if (this.loadingSpinner) this.loadingSpinner.dismiss();
    }

    /**
     * Get the available sign in methods for given email
     * @param email - Email
     * @returns Available sign in methods
     */
    private async getSignInMethodsForEmail(email: string): Promise<string[]> {
        return await this.fireAuth.auth.fetchSignInMethodsForEmail(email);
    }

    /**
     * Gets the Google credentials for "Native" auth flow
     * @param email - Email
     * @returns Google authentication credentials
     */
    private async getNativeGoogleCredential(
        email?: string
    ): Promise<auth.AuthCredential> {
        const response = await this.google.login({
            offline: true,
            webClientId: environment.firebaseConfig.webClientId
        });
        return auth.GoogleAuthProvider.credential(response.idToken);
    }

    /**
     * Gets the Facebook credentials for "Native" auth flow
     * @returns Facebook authentication credentials
     */
    private async getNativeFacebookCredential(): Promise<auth.AuthCredential> {
        const response = await this.facebook.login(['email']);
        return auth.FacebookAuthProvider.credential(
            response.authResponse.accessToken
        );
    }

    /**
     * Links current authorized user to Google account in "Web" flow
     */
    linkWebGoogle() {
        return this.fireAuth.auth.currentUser
            .linkWithPopup(new auth.GoogleAuthProvider())
            .then(result => this.linkProfiles(result));
    }

    /**
     * Links current authorized user to Facebook account in "Web" flow
     */
    linkWebFacebook() {
        return this.fireAuth.auth.currentUser
            .linkWithPopup(new auth.FacebookAuthProvider())
            .then(result => this.linkProfiles(result));
    }

    /**
     * Links current authorized user to Google account in "Native" flow
     */
    async linkNativeGoogle() {
        const cred = await this.getNativeGoogleCredential();
        return this.fireAuth.auth.currentUser
            .linkAndRetrieveDataWithCredential(cred)
            .then(result => this.linkProfiles(result));
    }

    /**
     * Links current authorized user to Facebook account in "Native" flow
     */
    async linkNativeFacebook() {
        const cred = await this.getNativeFacebookCredential();
        return this.fireAuth.auth.currentUser
            .linkAndRetrieveDataWithCredential(cred)
            .then(result => this.linkProfiles(result));
    }

    /**
     * Links a user to its profile
     * @param result
     */
    private async linkProfiles(result: auth.UserCredential) {
        const { uid } = result.user;

        const hasProfile = await this.profileService
            .hasProfile(uid)
            .pipe(take(1))
            .toPromise();

        if (!hasProfile) {
            this.profileService.createLinkedProfile(result);
        }
    }

    /**
     * Logins to firebase via "Web" auth flow  with Google
     * @param email Email
     */
    private async loginWebGoogle(email?: string): Promise<User> {
        let provider = new auth.GoogleAuthProvider();
        if (email)
            provider = provider.setCustomParameters({
                login_hint: email
            }) as auth.GoogleAuthProvider;
        const credential = await this.fireAuth.auth.signInWithPopup(provider);
        return credential.user;
    }

    /**
     * Logins to firebase via "Native" auth flow  with Google
     * @param email Email
     */
    private async loginNativeGoogle(email?: string): Promise<User> {
        const credential = await this.getNativeGoogleCredential(email);
        return await this.fireAuth.auth.signInWithCredential(credential);
    }

    /**
     * Logins to firebase via "Web" auth flow  with Facebook
     */
    private async loginWebFacebook(): Promise<User> {
        const provider = new auth.FacebookAuthProvider();
        const credential = await this.fireAuth.auth.signInWithPopup(provider);
        return credential.user;
    }

    /**
     * Logins to firebase via "Native" auth flow  with Facebook
     */
    private async loginNativeFacebook(): Promise<User> {
        const credential = await this.getNativeFacebookCredential();
        return await this.fireAuth.auth.signInWithCredential(credential);
    }

    /**
     * Error handler
     */
    private async handleLoginError(error: FirebaseError): Promise<User> {
        switch (error.code) {
            case FirebaseAuthErrors.AccountExistsWithDifferentCredentials:
                const loginError = error as LoginError;
                if (
                    loginError.credential.signInMethod ===
                    FirebaseAuthProviderIds.Facebook
                ) {
                    const facebookCred = loginError.credential;
                    const googleUser = await this.loginGoogle(loginError.email);
                    return await googleUser.linkWithCredential(facebookCred);
                }
                return null;

            default:
                return null;
        }
    }
}
