import { Component, EventEmitter, Input, Output } from '@angular/core';

import { TestResultType } from '../../../models/test-result-type.model';
import { AlertController } from 'ionic-angular';
import { DefaultLocalePipe } from '../../pipes/default-locale/default-locale';
import { map } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';
import { Profile } from '../../../models/profile.model';
import { PillItem } from '../../../models/pill-item.model';
import { Observable } from 'rxjs/index';

export enum TestResultActions {
    RetakeTest,
    Continue
}

export enum TestResultContext {
    InitialResult,
    OwnResult,
    OtherResult
}


@Component({
    selector: 'test-results',
    templateUrl: 'test-result.html'
})
export class TestResultComponent {

    @Input()
    resultType: TestResultType;

    @Input()
    context: TestResultContext;

    TestResultActions = TestResultActions;

    TestResultContext = TestResultContext;

    @Output()
    actionSelected = new EventEmitter<TestResultActions>();

    longDescriptionShown = false;

    constructor(private alertCtrl: AlertController, private defaultLocalePipe: DefaultLocalePipe,
                private translateService: TranslateService) {}

    onActionSelected(action) {
        this.actionSelected.emit(action);
    }

    getTraitItems(items: string[]): Observable<PillItem[]> {
        const translationIds = items.map(item => `traits.${item}`);
        return this.translateService.get(translationIds).pipe(
            map(traitTranslations => {
                return items.map(trait => {
                    return {
                        id: trait,
                        label: traitTranslations[`traits.${trait}`],
                    };
                });
            })
        );

    }


    showLongDescription() {
        this.longDescriptionShown = true;
    }
}
