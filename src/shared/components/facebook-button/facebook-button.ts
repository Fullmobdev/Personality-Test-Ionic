import { Component, EventEmitter, Input, Output } from '@angular/core';

/**
 * Generated class for the FacebookButtonComponent component.
 *
 * See https://angular.io/api/core/Component for more info on Angular
 * Components.
 */
@Component({
  selector: 'facebook-button',
  templateUrl: 'facebook-button.html'
})
export class FacebookButtonComponent {

    @Input() label: string;

    @Output() onClick: EventEmitter<any> = new EventEmitter();

    constructor() { }

    signIn(e: Event) {
        e.preventDefault();
        this.onClick.emit();
    }

}
