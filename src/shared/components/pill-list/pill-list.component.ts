import { Component, Input, Output, EventEmitter } from '@angular/core';

import { PillItem } from '../../../models/pill-item.model';

@Component({
    selector: 'pill-list',
    templateUrl: 'pill-list.component.html'
})
export class PillListComponent {

    @Input()
    items: PillItem[];

    @Input()
    showToggle: boolean;

    @Output()
    select: EventEmitter<PillItem> = new EventEmitter();

    @Output()
    toggle: EventEmitter<PillItem> = new EventEmitter();

    /**
     * Called when the user taps a pill
     * @param e
     * @param item
     */
    onPillClicked(e: Event, item: PillItem) {
        e.preventDefault();
        this.select.next(item);
    }

    /**
     * Called when the user taps on the toggle icon
     * @param e
     * @param item
     */
    onToggleItem(e: Event, item: PillItem) {
        e.preventDefault();
        e.stopPropagation();
        this.toggle.next(item);
    }

}
