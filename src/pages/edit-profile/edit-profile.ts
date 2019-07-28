import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { IonicPage, LoadingController, NavController } from 'ionic-angular';
import { User } from 'firebase';
import { Observable, Subscription } from 'rxjs';
import { switchMap, take } from 'rxjs/operators';

import { Profile } from '../../models/profile.model';
import { ProfileService } from '../../services/profile.service';
import { AuthService } from '../../services/auth.service';

@IonicPage()
@Component({
    selector: 'page-edit-profile',
    templateUrl: 'edit-profile.html',
})
export class EditProfilePage {

    /* Observables */

    authUser$: Observable<User>;

    profile$: Observable<Profile>;

    /* Properties */

    form: FormGroup;

    pageSubscription: Subscription;

    constructor(public navCtrl: NavController, private fb: FormBuilder, private authService: AuthService,
                private profileService: ProfileService, private loadingCtrl: LoadingController) {
        this.authUser$ = this.authService.getUser();
        this.profile$ = this.authUser$.pipe(
            switchMap(authUser => this.profileService.getProfile(authUser.uid))
        );

        this.form = this.fb.group({
            'displayName': ['', [Validators.required, Validators.minLength(3)]],
            'gender': []
        });
    }

    ionViewWillEnter() {
        this.pageSubscription = this.profile$.subscribe(profile => {
            console.log(profile);
            this.form.patchValue({
                displayName: profile.displayName,
                gender: profile.gender
            });
        });
    }

    ionViewWillLeave() {
        this.pageSubscription.unsubscribe();
    }

    /**
     * Called when the user clicks the save changes button
     */
    async onSaveChangesClicked() {
        const authUser = await this.authUser$.pipe(take(1)).toPromise();
        try {
            await this.profileService.updateProfile(authUser.uid, this.form.value);
            this.navCtrl.pop();
        } catch (e) {
            // Saving profile failed
        }

    }


    async onProfilePictureSelected(imageBlob: Blob) {
        const spinner = this.loadingCtrl.create({content: 'Uploading picture'})
        spinner.present();
        const authUser = await this.authUser$.pipe(take(1)).toPromise();
        await this.profileService.updateProfilePictureFromBlob(authUser.uid, imageBlob);
        spinner.dismiss();
    }

}
