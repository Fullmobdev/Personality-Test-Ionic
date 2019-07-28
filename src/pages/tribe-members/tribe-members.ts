import { Component, Input } from '@angular/core';
import {
    Content,
    IonicPage,
    NavController,
    NavParams,
    ToastController
} from 'ionic-angular';
import { User } from 'firebase';
import { combineLatest, Observable } from 'rxjs';
import { map, shareReplay, take } from 'rxjs/operators';

import { Profile } from '../../models/profile.model';
import { Tribe } from '../../models/tribe.model';
import { IdModel } from '../../models/id.model';
import { TribeService } from '../../services/tribe.service';
import { AuthService } from '../../services/auth.service';
import { ProfilesListEntity } from '../../shared/components/profiles-list/profiles-list.component';

@IonicPage()
@Component({
    selector: 'page-tribe-members',
    templateUrl: 'tribe-members.html'
})
export class TribeMembersPage {

    tribe$: Observable<IdModel<Tribe>>;
    members$: Observable<ProfilesListEntity[]>;
    user$: Observable<User>;
    canEditTribe$: Observable<boolean>;

    private readonly tribeId: string;

    constructor(
        public navCtrl: NavController,
        public navParams: NavParams,
        private toastCtrl: ToastController,
        private authService: AuthService,
        private tribeService: TribeService
    ) {
        this.tribeId = this.navParams.get('tribeId');
        this.tribe$ = this.tribeService
            .getTribe(this.tribeId)
            .pipe(shareReplay(1));
        this.user$ = this.authService.getUser().pipe(shareReplay(1));
        this.canEditTribe$ = combineLatest(this.tribe$, this.user$)
            .pipe(
                map(([tribe, user]) => user.uid === tribe.ownerId)
            );

        this.members$ = combineLatest(
            this.tribe$,
            this.tribeService.getTribeMembers(this.tribeId),
            this.authService.getUser()
        ).pipe(
            map(([tribe, members, user]) =>
                members.map(member => ({
                    ...member,
                    canEmitAction:
                        tribe.ownerId === user.uid &&
                        tribe.ownerId !== member.id
                }))
            )
        );
    }

    async onItemRemove(member: Profile) {
        const memberToRemove = member.id;
        const { members } = await this.tribe$.pipe(take(1)).toPromise();

        const updatedMembers = members.filter(
            memberId => memberId !== memberToRemove
        );

        try {
            await this.tribeService.updateTribe(this.tribeId, {
                members: updatedMembers
            });

            const toast = this.toastCtrl.create({
                message: 'Member successfully removed',
                duration: 6000
            });

            toast.present();
        } catch (error) {
            throw error;
        }
    }

    onItemSelected(item: Profile) {
        this.navCtrl.push('ProfilePage', { userId: item.id });
    }

    onInviteMembersClicked() {
        this.navCtrl.push('InviteMembersPage', { tribeId: this.tribeId });
    }
}
