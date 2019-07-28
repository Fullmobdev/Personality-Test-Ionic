import { Content } from 'ionic-angular';
import { Directive, ElementRef, Input, OnChanges, OnDestroy, Renderer2, SimpleChanges } from '@angular/core';
import { Subscription } from 'rxjs';

/**
 * Adapted from https://medium.com/@gregor.srdic/ionic3-hidding-header-on-footer-on-content-scroll-15ab95b05dc5
 */

@Directive({
    selector: '[scrollHide]'
})
export class ScrollHideDirective implements OnChanges, OnDestroy {

    @Input('scrollHide') config: ScrollHideConfig;
    @Input('scrollContent') scrollContent: Content;

    scrollSubscription: Subscription;
    lastScrollPosition: number = 0;
    lastValue: number = 0;

    constructor(private element: ElementRef, private renderer: Renderer2) {
    }

    ngOnChanges(changes: SimpleChanges) {
        if (this.scrollContent && this.config) {
            if (this.config.maxValue === undefined) {
                this.config.maxValue = this.element.nativeElement.offsetHeight;
            }
            this.subscribeOnScroll();
        }
    }

    ngOnDestroy() {
        if (this.scrollSubscription) this.scrollSubscription.unsubscribe();
    }

    private subscribeOnScroll() {
        if (this.scrollSubscription) this.scrollSubscription.unsubscribe();
        this.scrollSubscription = this.scrollContent.ionScrollStart.subscribe((ev) => {
            this.lastScrollPosition = ev.scrollTop;
        });
        this.scrollSubscription.add(this.scrollContent.ionScroll.subscribe((ev) => this.adjustElementOnScroll(ev)));
    }

    private adjustElementOnScroll(ev) {
        console.log(ev.scrollTop);
        if (ev) {
            ev.domWrite(() => {
                let scrollTop: number = ev.scrollTop > 0 ? ev.scrollTop : 0;
                let scrolldiff: number = scrollTop - this.lastScrollPosition;
                this.lastScrollPosition = scrollTop;
                let newValue = this.lastValue + scrolldiff;
                newValue = Math.max(0, Math.min(newValue, this.config.maxValue));
                this.renderer.setStyle(this.element.nativeElement, this.config.cssProperty, `-${newValue}px`);
                this.lastValue = newValue;
            });
        }
    }
}
export interface ScrollHideConfig {
    cssProperty: string;
    maxValue: number;
}
