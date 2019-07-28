import { Component, EventEmitter, Output, Input } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

import { Tribe } from '../../../models/tribe.model';

@Component({
    selector: 'tribe-editor',
    templateUrl: 'tribe-editor.html'
})
export class TribeEditorComponent {
    form: FormGroup;
    tribeImgSrc: string;
    tribeImgBlob: Blob;

    private tribeId: string;

    @Input()
    set tribe(tribe: Tribe) {
        if (!!tribe) {
            this.tribeId = tribe.id;
            this.tribeImgSrc = tribe.imgSrc;
            this.form.patchValue(tribe);
        }
    }

    @Output()
    tribeChanges = new EventEmitter<Partial<Tribe>>();

    constructor(
        private formBuilder: FormBuilder,
    ) {
        this.form = this.formBuilder.group({
            name: [null, Validators.required],
            description: [null, Validators.required]
        });
    }

    onFormSubmit() {
        const imgBlob = this.tribeImgBlob;
        const payload = {
            ...this.form.value
        };

        if (this.tribeId) {
            payload.id = this.tribeId;
        }

        if (this.form.valid) {
            this.tribeChanges.emit(
                !!this.tribeImgBlob ? { ...payload, imgBlob } : payload
            );
        }
    }

    async onTribeImageSelected(blob: Blob) {
        this.tribeImgBlob = blob;
        const filereader = new FileReader();

        filereader.onloadend = () =>
            (this.tribeImgSrc = filereader.result as string);

        filereader.readAsDataURL(blob);
    }
}
