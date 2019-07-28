import { Component } from '@angular/core';
import { IonicPage, Loading, LoadingController, NavController, NavParams } from 'ionic-angular';
import { Observable } from 'rxjs';

import { Tribe } from '../../models/tribe.model';
import { TribeService } from '../../services/tribe.service';
import { IdModel } from '../../models/id.model';
import { TranslateService } from '@ngx-translate/core';
import { take } from 'rxjs/operators';

@IonicPage({
    segment: 'tribes/:tribeId/edit'
})
@Component({
    selector: 'page-edit-tribe',
    templateUrl: 'edit-tribe.html'
})
export class EditTribePage {
    tribeId: string;
    tribe$: Observable<IdModel<Tribe>>;
    isEdit: boolean;

    constructor(
        public navCtrl: NavController,
        public navParams: NavParams,
        private tribeService: TribeService,
        private loadingCtrl: LoadingController,
        private translateService: TranslateService
    ) {
        this.tribeId = this.navParams.get('tribeId');
        this.isEdit = !!this.tribeId;

        if (this.isEdit) {
            this.tribe$ = this.tribeService.getTribe(this.tribeId);
        }
    }

    ionViewDidLoad() {}

    async onTribeChanges(tribe: Tribe) {
        const { id, ...data } = tribe;
        const message = await this.translateService.get('tribes.creating').pipe(take(1)).toPromise();
        const loading = this.loadingCtrl.create({
            content: message
        });
        loading.present();
        try {
            if (id) {
                await this.tribeService.updateTribe(id, tribe);
                await this.navCtrl.pop();
            } else {
                const tribeId = await this.tribeService.createTribe(tribe);
                await this.navCtrl.pop();
                await this.navCtrl.push('TribeDetailsPage', { tribeId });
            }
        } catch (error) {
            throw error;
        } finally {
            loading.dismissAll();
        }
    }
}
