import { Component, EventEmitter, Input, Output } from '@angular/core';

/**
 * Generated class for the GoogleButtonComponent component.
 *
 * See https://angular.io/api/core/Component for more info on Angular
 * Components.
 */
@Component({
  selector: 'google-button',
  templateUrl: 'google-button.html'
})
export class GoogleButtonComponent {

    @Input() label: string;

    @Output() onClick: EventEmitter<any> = new EventEmitter();

    constructor() { }

    signIn(e: Event) {
        e.preventDefault();
        this.onClick.emit();
    }

}
