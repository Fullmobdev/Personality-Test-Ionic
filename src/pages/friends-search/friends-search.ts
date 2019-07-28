import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import {
    IonicPage,
    NavController,
    NavParams,
    ToastController
} from 'ionic-angular';
import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import { map, switchMap, take } from 'rxjs/operators';

import { IdModel } from '../../models/id.model';
import { Profile } from '../../models/profile.model';
import { AuthService } from '../../services/auth.service';
import { ProfileService } from '../../services/profile.service';

@IonicPage()
@Component({
    selector: 'page-friends-search',
    templateUrl: 'friends-search.html'
})
export class FriendsSearchPage {
    private searchResults$ = new BehaviorSubject([]);
    private profile$: Observable<IdModel<Profile>>;
    matches$: Observable<IdModel<Profile & { isFriend: boolean }>[]>;
    currentSearchTerm = {
        value: ''
    };
    searchSpinner = false;

    constructor(
        public navCtrl: NavController,
        public navParams: NavParams,
        private toastCtrl: ToastController,
        private translate: TranslateService,
        private authService: AuthService,
        private profileService: ProfileService
    ) {
        this.profile$ = this.authService
            .getUser()
            .pipe(switchMap(user => this.profileService.getProfileIdModel(user.uid)));

        this.matches$ = combineLatest(
            this.profile$,
            this.searchResults$
        ).pipe(
            switchMap(([profile, ids]) => this.profileService.getProfiles(ids).pipe(
                map(profiles => profiles.map(userProfile => ({
                    ...userProfile,
                    isFriend: (profile.friends) ? profile.friends.includes(userProfile.id) : false
                })))
            ))
        )
    }

    /**
     * Called when the "Add friend" button is clicked
     * Updates current users profile adding a new id to its friends list
     * @param $event - Event that should be prevented in order to avoid unneeded side effects
     * @param user - Users profile being emitted
     */
    async onAddFriendClicked($event, user: Profile) {
        $event.stopPropagation();

        const { friends, id } = await this.profile$.pipe(take(1)).toPromise();

        await this.profileService.updateProfile(id, {
            friends: (friends) ? [...friends, user.id] : [user.id]
        });
        const successMsg =
            await this.translate.get('friends.friendAdded').pipe(take(1)).toPromise();

        const toast = this.toastCtrl.create({
            message: successMsg,
            duration: 6000
        });

        toast.present();
    }

    /**
     * Called when the search match is clicked
     * @param $event - Event that should be prevented in order to avoid unneeded side effects
     * @param profile - Users profile being emitted
     */
    onMatchClick($event: Event, profile: Profile) {
        $event.stopPropagation();

        this.navCtrl.push('ProfilePage', { userId: profile.id });
    }

    /**
     * Called each time (ionEvent) emits a new search term
     * Searches for matching profiles
     * @param event - Event that contains current search term
     */
    filterItems(event) {
        this.currentSearchTerm.value = event.target.value;
        this.searchSpinner = true;
        this.profileService
            .searchProfiles(this.currentSearchTerm.value)
            .then(ids => {
                this.searchResults$.next(ids);
                this.searchSpinner = false;
            });
    }

    async onRemoveFromFriendsClicked($event, profile: IdModel<Profile & { isFriend: boolean }>) {
        $event.stopPropagation();

        const friendToRemove = profile.id;
        const userProfile = await this.profile$.pipe(take(1)).toPromise();

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
}
