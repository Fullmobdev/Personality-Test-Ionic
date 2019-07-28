import { Component, Input, Output, EventEmitter } from '@angular/core';

import { Profile } from '../../../models/profile.model';

export type ProfilesListEntity = Profile & { canEmitAction: boolean };

@Component({
    selector: 'profiles-list',
    templateUrl: 'profiles-list.component.html'
})
export class ProfilesListComponent {
    @Input()
    entities: Profile[];

    @Input()
    actionLabel: string = 'Remove';

    @Output()
    itemSelected = new EventEmitter<Profile>();

    @Output()
    actionSelected = new EventEmitter<Profile>();

    onItemClicked($event, entity: Profile) {
        $event.stopPropagation();
        this.itemSelected.emit(entity);
    }

    onActionClicked($event, entity: Profile) {
        $event.stopPropagation();
        this.actionSelected.emit(entity);
    }
}
