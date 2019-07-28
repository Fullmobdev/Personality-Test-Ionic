import { Pipe, PipeTransform } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

/**
 * Generated class for the DefaultLocalePipe pipe.
 *
 * See https://angular.io/api/core/Pipe for more info on Angular Pipes.
 */
@Pipe({
    name: 'defaultLocale',
})
export class DefaultLocalePipe implements PipeTransform {
    constructor(private translate: TranslateService) { }

    /**
     * Takes an object with translations and returns the one that matches the default lang.
     */
    transform(value: { [key: string]: string }) {
        return (value[this.translate.currentLang])
            ? value[this.translate.currentLang]
            : value[this.translate.getDefaultLang()];
    }
}
