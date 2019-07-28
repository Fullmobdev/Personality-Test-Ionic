import { Injectable } from '@angular/core';
import { merge, fromEvent, Observable } from 'rxjs';
import { mapTo } from 'rxjs/operators';

@Injectable()
export class NetworkService {
    isOnline$: Observable<boolean>;

    constructor() {
        this.isOnline$ = merge(
            fromEvent(window, 'offline').pipe(mapTo(false)),
            fromEvent(window, 'online').pipe(mapTo(true)),
            Observable.create(sub => {
                sub.next(navigator.onLine);
                sub.complete();
            })
        )
    }

}
