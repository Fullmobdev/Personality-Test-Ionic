import { Content } from 'ionic-angular';
import { Directive, ElementRef, Input, OnChanges, OnDestroy, OnInit, Renderer2, SimpleChanges } from '@angular/core';
import { Subscription } from 'rxjs';

@Directive({
    selector: '[floatingHeader]'
})
export class FloatingHeaderDirective implements OnInit, OnChanges, OnDestroy {

    @Input('scrollContent') scrollContent: Content;

    scrollSubscription: Subscription;

    constructor(private element: ElementRef, private renderer: Renderer2) {
    }

    ngOnInit() {
        this.updateAttribute(0);
    }

    ngOnChanges(changes: SimpleChanges) {
        this.subscribeOnScroll();
    }

    ngOnDestroy() {
        if (this.scrollSubscription) this.scrollSubscription.unsubscribe();
    }

    private subscribeOnScroll() {
        if (this.scrollSubscription) this.scrollSubscription.unsubscribe();
        this.scrollSubscription = this.scrollContent.ionScroll.subscribe((ev) => this.adjustElementOnScroll(ev));
    }

    private adjustElementOnScroll(ev) {
        if (ev) {
            const scrollTop: number = ev.scrollTop > 0 ? ev.scrollTop : 0;
            this.updateAttribute(scrollTop);
        }
    }

    private updateAttribute(scrollTop) {
        if (scrollTop === 0) {
            this.renderer.setAttribute(this.element.nativeElement, 'no-border', 'true');
        } else {
            this.renderer.removeAttribute(this.element.nativeElement, 'no-border');
        }
    }
}
