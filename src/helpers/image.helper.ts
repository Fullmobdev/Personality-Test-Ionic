/**
 * Takes a base64 encoded image and resizes and center crops the image, returning a JPEG blob of the result
 * Code adapted from https://gist.github.com/VMBindraban/1be9cd5eceb347bef860
 * @param srcData
 * @param width
 * @param height
 */
export function resizeCropCenterImage(srcData, width, height): Promise<Blob> {
    return new Promise(function(resolve, reject) {
        try {
            const imageObj = new Image();
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            let xStart = 0;
            let yStart = 0;
            let aspectRadio;
            let newWidth;
            let newHeight;

            imageObj.onload = () => {
                canvas.width = width;
                canvas.height = height;

                aspectRadio = imageObj.height / imageObj.width;

                if (imageObj.height < imageObj.width) {
                    //horizontal
                    aspectRadio = imageObj.width / imageObj.height;
                    newHeight = height;
                    newWidth = aspectRadio * height;
                    xStart = -(newWidth - width) / 2;
                } else {
                    //vertical
                    newWidth = width;
                    newHeight = aspectRadio * width;
                    yStart = -(newHeight - height) / 2;
                }

                console.log(imageObj);

                console.log(imageObj.width, imageObj.height, aspectRadio, xStart, yStart, newWidth, newHeight);

                ctx.drawImage(imageObj, xStart, yStart, newWidth, newHeight);

                console.log(canvas.toDataURL('image/jpeg', 0.9));

                canvas.toBlob(resolve, 'image/jpeg', 0.9);
            }

            imageObj.src = srcData;

        } catch (e) {
            reject(e);
        }
    });
}
