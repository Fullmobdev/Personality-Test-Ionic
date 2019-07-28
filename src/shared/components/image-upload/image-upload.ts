import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Camera } from '@ionic-native/camera';
import { FilePath } from '@ionic-native/file-path';
import { Platform } from 'ionic-angular';

import { resizeCropCenterImage } from '../../../helpers/image.helper';

@Component({
    selector: 'image-upload',
    templateUrl: 'image-upload.html'
})
export class ImageUploadComponent {

    @Input() currentImage: string;

    @Input() iconName = 'fyt-photo';

    @Output() imageSelected: EventEmitter<Blob> = new EventEmitter();

    constructor(private platform: Platform, private camera: Camera, private filePath: FilePath) {}

    async onOverlayClicked() {
        try {
            const filePath = await this.camera.getPicture({
                mediaType: this.camera.MediaType.PICTURE,
                sourceType: this.camera.PictureSourceType.PHOTOLIBRARY,
                destinationType: this.camera.DestinationType.DATA_URL,
                allowEdit: true
            });
            const imageData = `data:image/jpeg;base64,${filePath}`;
            const imageBlob = await resizeCropCenterImage(imageData, 512, 512);
            this.imageSelected.next(imageBlob);
        } catch (e) {
            // No image selected
            console.error(e);
        }
    }

}
