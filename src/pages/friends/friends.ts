import { Component } from '@angular/core';
import {
    IonicPage,
    NavController,
    NavParams,
    ToastController,
    App
} from 'ionic-angular';
import { User } from 'firebase';
import { combineLatest, Observable } from 'rxjs';
import { map, take, pluck, shareReplay } from 'rxjs/operators';

import { Profile } from '../../models/profile.model';
import { AuthService } from '../../services/auth.service';
import { ProfileService } from '../../services/profile.service';
import { ProfilesListEntity } from '../../shared/components/profiles-list/profiles-list.component';
import { TranslateService } from '@ngx-translate/core';
import { IdModel } from '../../models/id.model';

@IonicPage({
    segment: 'friends/:userId'
})
@Component({
    selector: 'page-friends',
    templateUrl: 'friends.html'
})
export class FriendsPage {
    private userId: string;
    private userProfile$: Observable<IdModel<Profile>>;
    userFriends$: Observable<ProfilesListEntity[]>;
    isOwnFriendsList$: Observable<boolean>;
    actionLabel$: Observable<string>;

    constructor(
        private app: App,
        public navCtrl: NavController,
        public navParams: NavParams,
        private toastCtrl: ToastController,
        private translate: TranslateService,
        private authService: AuthService,
        private profileService: ProfileService
    ) {
        this.userId = this.navParams.data.userId;
        console.log(this.userId);

        const authUserId$ = this.authService
            .getUser()
            .pipe(pluck<User, string>('uid'));

        this.userProfile$ = this.profileService
            .getProfileIdModel(this.userId)
            .pipe(shareReplay(1));

        this.isOwnFriendsList$ = combineLatest(
            authUserId$,
            this.userProfile$
        ).pipe(map(([id, profile]) => id === profile.id));

        this.userFriends$ = combineLatest(
            authUserId$,
            this.userProfile$,
            this.profileService.getProfileFriends(this.userId)
        ).pipe(
            map(([authUserId, userProfile, friends]) => {
                return friends.map(friend => {
                    return {
                        ...friend,
                        canEmitAction: authUserId === userProfile.id
                    } as ProfilesListEntity;
                })
            })
        );
    }

    /**
     * Called when the "Remove friend" button is being clicked
     * Removes a friend from users friends list
     * @param profile - Friend to be removed
     */
    async onItemRemove(profile: Profile) {
        const friendToRemove = profile.id;
        const userProfile = await this.userProfile$.pipe(take(1)).toPromise();

        await this.profileService.updateProfile(userProfile.id, {
            friends: userProfile.friends.filter(
                friendId => friendId !== friendToRemove
            )
        });

        const successMsg =
            await this.translate.get('friends.friendRemoved').pipe(take(1)).toPromise();

        const toast = this.toastCtrl.create({
            message: successMsg,
            duration: 6000
        });

        toast.present();
    }

    /**
     * Called when a friend is being clicked
     * @param profile - Users profile being emitted
     */
    onItemSelected(profile: Profile) {
        this.app.getRootNav().push('ProfilePage', { userId: profile.id });
    }

    /**
     * Called when the "Add new friends" button is clicked
     */
    onAddNewFriendsClick() {
        this.app.getRootNav().push('FriendsSearchPage');
    }
}
