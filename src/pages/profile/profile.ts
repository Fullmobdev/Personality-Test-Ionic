import { Component } from '@angular/core';
import { App, IonicPage, NavController, NavParams } from 'ionic-angular';
import { TranslateService } from '@ngx-translate/core';
import { User } from 'firebase/app';
import { combineLatest, Observable } from 'rxjs';
import { filter, map, shareReplay, take, switchMap, tap } from 'rxjs/operators';
import { of } from 'rxjs/internal/observable/of';

import { SocialSharing } from '@ionic-native/social-sharing';

import { Profile } from '../../models/profile.model';
import { PillItem } from '../../models/pill-item.model';
import { IdModel } from '../../models/id.model';
import { ProfileService } from '../../services/profile.service';
import { AuthService } from '../../services/auth.service';
import { TestService } from '../../services/test.service';
import { TestResults } from '../../models/test-result.model';
import { TestResultType } from '../../models/test-result-type.model';
import { DefaultLocalePipe } from '../../shared/pipes/default-locale/default-locale';
import { ResultTypesService } from '../../services/result-types.service';

@IonicPage({
    segment: 'profile/:userId'
})
@Component({
    selector: 'page-profile',
    templateUrl: 'profile.html'
})
export class ProfilePage {
    userId: string;

    authUser$: Observable<User>;

    isOwnProfile$: Observable<boolean>;

    profile$: Observable<IdModel<Profile>>;
    profileFriends$: Observable<IdModel<Profile>[]>;

    currentUserProfile$: Observable<IdModel<Profile>>;

    canBeAddedToFriends$: Observable<boolean>;
    canBeRemovedFromFriends$: Observable<boolean>;

    testResults$: Observable<TestResults>;

    personalityTypes$: Observable<PillItem[]>;

    traits$: Observable<PillItem[]>;

    constructor(
        private app: App,
        public navCtrl: NavController,
        public navParams: NavParams,
        private socialSharing: SocialSharing,
        private authService: AuthService,
        private profileService: ProfileService,
        private testService: TestService,
        private resultTypeService: ResultTypesService,
        private translateService: TranslateService,
        private defaultLocalePipe: DefaultLocalePipe
    ) {
        this.userId = this.navParams.data.userId;
        this.authUser$ = this.authService.getUser();
        this.isOwnProfile$ = this.authUser$.pipe(
            filter(Boolean),
            map(user => {
                return user.uid === this.userId;
            })
        );

        this.profile$ = this.profileService
                            .getProfileIdModel(this.userId)
                            .pipe(shareReplay(1));

        this.profileFriends$ = this.profileService.getProfileFriends(this.userId);

        this.currentUserProfile$ = this.authUser$.pipe(
            switchMap(user => this.profileService.getProfileIdModel(user.uid)),
            shareReplay(1)
        );

        this.canBeAddedToFriends$ = combineLatest(
            this.profile$,
            this.currentUserProfile$
        ).pipe(
            map(
                ([profile, currentUserProfile]) =>
                    (currentUserProfile.friends)
                        ? !currentUserProfile.friends.includes(profile.id)
                        : true
            )
        );

        this.canBeRemovedFromFriends$ = this.canBeAddedToFriends$.pipe(
            map(x => !x)
        );

        this.testResults$ = this.testService.getTestResultsForUser(this.userId);

        this.personalityTypes$ = this.isOwnProfile$.pipe(
            switchMap(isOwnProfile => {
                if (isOwnProfile) {
                    return combineLatest(
                        this.testResults$,
                        this.profile$
                    ).pipe(switchMap(([results, profile]) => {
                        if (results) {
                            return combineLatest(...Object.values(results).map(
                                result => {
                                    return this.resultTypeService.getResultType(result.resultTypeId);
                                }
                            )).pipe(map(results => {
                                return this.getPersonalityTypePillItems(results, profile)
                                }
                            ));
                        }

                        return of(null);
                    }));
                } else {
                    return this.profile$.pipe(
                        switchMap(profile => {
                            if (profile.resultTypes && profile.resultTypes.length > 0) {
                                return combineLatest(
                                    ...profile.resultTypes.map(
                                        result => this.resultTypeService.getResultType(result)
                                    )).pipe(
                                    map((results: IdModel<TestResultType>[]) => this.getPersonalityTypePillItems(
                                        results, profile)
                                    ));
                            } else {
                                return of(null);
                            }
                        }));
                }
            })
        );

        this.traits$ = this.isOwnProfile$.pipe(
            switchMap(isOwnProfile => {
                if (isOwnProfile) {
                    return combineLatest(
                        this.testResults$,
                        this.profile$
                    ).pipe(switchMap(([results, profile]) => {
                                if (results) {
                                    return combineLatest(...Object.values(results).map(
                                        result => {
                                            return this.resultTypeService.getResultType(result.resultTypeId).pipe(
                                                map(result => result.traits)
                                            );
                                        }
                                    )).pipe(map(results => results.reduce((flat, next) => flat.concat(next), [])),
                                        switchMap(results => this.getTraitPillItems(results, profile))
                                    );
                                }

                                return of(null)
                        })
                    );
                } else {
                    return this.profile$.pipe(
                        switchMap(profile => {
                            if (profile.traits && profile.traits.length > 0) {
                                return this.getTraitPillItems(profile.traits, profile);
                            } else {
                                return of(null);
                            }
                        }));
                }
            }));

    }

    async signOut() {
        await this.authService.signOut();
    }

    /**
     * Called when the user clicks the edit button on their own profile
     * Adds a friend from users friends list
     */
    onEditProfileClicked() {
        this.app.getRootNav().push('EditProfilePage');
    }

    onFriendsListClicked() {
        this.app.getRootNav().push('FriendsPage', { userId: this.userId });
    }

    /**
     * Called when the user clicks the "Add to friends" button
     */
    async onAddToFriendsClicked() {
        const userProfile = await this.currentUserProfile$
                                      .pipe(take(1))
                                      .toPromise();

        const profile = await this.profile$.pipe(take(1)).toPromise();

        this.profileService.updateProfile(userProfile.id, {
            friends: (userProfile.friends) ? [...userProfile.friends, profile.id] : [profile.id]
        });
    }

    /**
     * Called when the user clicks the "Remove from friends" button
     * Removes a friend from users friends list
     */
    async onRemoveFromFriendsClicked() {
        const userProfile = await this.currentUserProfile$
                                      .pipe(take(1))
                                      .toPromise();

        const profile = await this.profile$.pipe(take(1)).toPromise();

        this.profileService.updateProfile(userProfile.id, {
            friends: userProfile.friends.filter(
                friendId => friendId !== profile.id
            )
        });
    }

    onAddNewFriendsClicked() {
        this.app.getRootNav().push('FriendsSearchPage');
    }

    getPersonalityTypePillItems(items: IdModel<TestResultType>[], profile: IdModel<Profile>): PillItem[] {
        return items.map(item => {
            return {
                id: item.id,
                label: this.defaultLocalePipe.transform(item.personalityType),
                disabled: !profile.resultTypes || !(profile.resultTypes.find(type => {
                    return type === item.id;
                }))
            };
        });
    }

    getTraitPillItems(items: string[], profile: IdModel<Profile>): Observable<PillItem[]> {
        const translationIds = items.map(item => `traits.${item}`);
        return this.translateService.get(translationIds).pipe(
            map(traitTranslations => {
                return items.map(trait => {
                    return {
                        id: trait,
                        label: traitTranslations[`traits.${trait}`],
                        disabled: !profile.traits || !(profile.traits.find(item => {
                            return item === trait;
                        }))
                    };
                });
            })
        );

    }

    async onResultTypeClicked(item: PillItem) {
        this.navCtrl.push('TestResultsPage', {
            resultTypeId: item.id
        });
        //const isOwnProfile = await this.isOwnProfile$.pipe(take(1)).toPromise();
        //if (isOwnProfile) {
        //    this.profileService.storeProfileResultType(this.userId, item);
        //} else {
        //
        //}

    }

    onToggleResultType(item: PillItem) {
        this.profileService.storeProfileResultType(this.userId, item);
    }

    onToggleTrait(item: PillItem) {
        this.profileService.storeProfileTrait(this.userId, item);
    }

    //async onTraitClicked(item: PillItem) {
    //    const isOwnProfile = await this.isOwnProfile$.pipe(take(1)).toPromise();
    //    if (isOwnProfile) {
    //        this.profileService.storeProfileTrait(this.userId, item);
    //    } else {
    //        //do nothing
    //    }
    //}

    async onShareClicked() {
        await this.socialSharing.share(`fyt://app.fyt.one/profile/${this.userId}`);
    }
}
