import { Component, Input } from '@angular/core';
import { Content, IonicPage, NavController, NavParams } from 'ionic-angular';
import { User } from 'firebase';
import { combineLatest, Observable } from 'rxjs';
import { filter, map, shareReplay, switchMap, take, tap } from 'rxjs/operators';

import { Tribe } from '../../models/tribe.model';
import { Profile } from '../../models/profile.model';
import { IdModel } from '../../models/id.model';
import { TribeService } from '../../services/tribe.service';
import { AuthService } from '../../services/auth.service';


@IonicPage({
    segment: 'tribes/:tribeId'
})
@Component({
    selector: 'page-tribe-details',
    templateUrl: 'tribe-details.html'
})
export class TribeDetailsPage {

    @Input('scrollContent') scrollContent: Content;

    tribeId: string;
    tribe$: Observable<IdModel<Tribe>>;
    tribeMembers$: Observable<Profile[]>;
    user$: Observable<User>;
    canLeaveTribe$: Observable<boolean>;
    canEditTribe$: Observable<boolean>;

    constructor(
        public navCtrl: NavController,
        public navParams: NavParams,
        private tribesService: TribeService,
        private auth: AuthService
    ) {
        this.tribeId = this.navParams.get('tribeId');
        this.user$ = this.auth.getUser().pipe(shareReplay(1));
        this.tribe$ = this.tribesService.getTribe(this.tribeId).pipe(shareReplay(1));
        this.tribeMembers$ = this.tribesService.getTribeMembers(this.tribeId);

        this.canEditTribe$ = combineLatest(this.tribe$, this.user$)
            .pipe(
                map(([tribe, user]) => user.uid === tribe.ownerId)
            );

        this.canLeaveTribe$ = combineLatest(this.tribe$, this.user$)
            .pipe(
                map(([tribe, user]) =>
                    tribe.members
                        .filter(memberId => memberId !== tribe.ownerId)
                        .includes(user.uid))
            );
    }

    onEditTribeClicked() {
        this.navCtrl.push('EditTribePage', { tribeId: this.tribeId });
    }

    onInviteMembersClicked() {
        this.navCtrl.push('InviteMembersPage', { tribeId: this.tribeId });
    }

    onTribeMembersListClicked() {
        this.navCtrl.push('TribeMembersPage', { tribeId: this.tribeId });
    }

    async onLeaveTribeClicked() {
        await combineLatest(this.tribe$, this.user$)
            .pipe(
                map(([tribe, user]) =>
                    tribe.members.filter(memberId => memberId !== user.uid)
                ),
                switchMap((members) =>
                    this.tribesService.updateTribe(this.tribeId, { members })),
                take(1)
            )
            .toPromise();

        this.navCtrl.pop();

    }
}
