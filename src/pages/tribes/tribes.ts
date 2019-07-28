import { Component } from '@angular/core';
import { App, IonicPage, NavController, NavParams } from 'ionic-angular';
import { Observable } from 'rxjs';

import { Tribe } from '../../models/tribe.model';
import { TribeService } from '../../services/tribe.service';
import { AuthService } from '../../services/auth.service';

@IonicPage()
@Component({
    selector: 'page-tribes',
    templateUrl: 'tribes.html'
})
export class TribesPage {
    tribes$: Observable<Tribe[]>;

    constructor(
        private app: App,
        public navCtrl: NavController,
        public navParams: NavParams,
        private tribeService: TribeService,
        private auth: AuthService
    ) {}

    ionViewDidLoad() {
        this.tribes$ = this.tribeService.getTribesWithIds();
    }

    onCreateTribeClicked() {
        this.app.getRootNav().push('EditTribePage');
    }

    onTribeClicked(tribeId: string) {
        this.app.getRootNav().push('TribeDetailsPage', { tribeId });
    }
}
