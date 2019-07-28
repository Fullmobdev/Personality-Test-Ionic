import { Component, Input, Output, EventEmitter } from '@angular/core';

import { Tribe } from '../../../models/tribe.model';

@Component({
    selector: 'tribes-list',
    templateUrl: 'tribes-list.component.html'
})
export class TribesListComponent {
    foo = 10;
    @Input()
    tribes: Tribe[];
    @Output()
    tribeClicked = new EventEmitter<string>();

    onTribeClicked(tribeId: string) {
        this.tribeClicked.emit(tribeId);
    }
}
