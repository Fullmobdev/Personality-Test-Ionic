import { Component, EventEmitter, Input, Output } from '@angular/core';

import { IdModel } from '../../../models/id.model';
import { Test, TestTypes } from '../../../models/test.model';
import { NetworkService } from '../../../services/network.service';

@Component({
    selector: 'test-list',
    templateUrl: 'test-list.component.html'
})
export class TestListComponent {

    @Input()
    tests: IdModel<Test>[];

    @Input() isOnline: boolean;

    @Output()
    testClicked = new EventEmitter<IdModel<Test>>();

    onTestClicked(test: IdModel<Test>) {
        this.testClicked.emit(test);
    }

    isExternalTest(test: IdModel<Test>) {
        return test.type === TestTypes.External;
    }
}
