import { Component, Input } from '@angular/core';
import {
    Content,
    IonicPage,
    NavController,
    NavParams,
    ToastController
} from 'ionic-angular';
import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import { map, shareReplay, switchMap, take } from 'rxjs/operators';

import { ProfileService } from '../../services/profile.service';
import { TribeService } from '../../services/tribe.service';
import { IdModel } from '../../models/id.model';
import { Profile } from '../../models/profile.model';
import { Tribe } from '../../models/tribe.model';

@IonicPage()
@Component({
    selector: 'page-invite-members',
    templateUrl: 'invite-members.html'
})
export class InviteMembersPage {

    people$: Observable<IdModel<Profile>[]>;

    private readonly profiles$: Observable<Profile[]>;
    private readonly tribe$: Observable<IdModel<Tribe>>;
    private tribeId: string;

    private searchResults$ = new BehaviorSubject<string[]>([]);

    currentSearchTerm: string;
    searchSpinner: boolean;

    constructor(
        public navCtrl: NavController,
        public navParams: NavParams,
        private toastCtrl: ToastController,
        private profileService: ProfileService,
        private tribeService: TribeService
    ) {
        this.tribeId = this.navParams.get('tribeId');
        this.tribe$ = this.tribeService.getTribe(this.tribeId)
            .pipe(shareReplay(1));

        this.people$ = combineLatest([
            this.tribe$,
            this.searchResults$
        ])
            .pipe(
                map(([tribe, ids]) => {
                    return ids.filter(id => !tribe.members.includes(id));
                }),
                switchMap(ids => this.profileService.getProfiles(ids))
            );
    }

    async onInviteClicked(member: Profile) {
        const memberToAdd = member.id;

        const { members } = await this.tribe$.pipe(take(1)).toPromise();

        try {
            await this.tribeService.updateTribe(
                this.tribeId,
                { members: [...members, memberToAdd] }
            );

            const toast = this.toastCtrl.create({
                message: 'Member successfully added',
                duration: 6000
            });

            toast.present();

        } catch (error) {
            throw(error);
        }
    }

    filterItems(event) {
        this.currentSearchTerm = event.target.value;
        this.searchSpinner = true;
        this.profileService.searchProfiles(event.target.value)
            .then(ids => {
                this.searchResults$.next(ids);
                this.searchSpinner = false;
            });
    }
}
