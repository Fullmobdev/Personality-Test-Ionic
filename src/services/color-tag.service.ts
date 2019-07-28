import { Injectable } from '@angular/core';

var ColorHash = require('color-hash');

/**
 * A service that generate color for given item
 */
@Injectable()
export class ColorTagService {

    constructor() { }

    /**
     * Gets a color for an item
     * @param {string} item
     * @returns {any}
     */
    getColor(item: string) {
        const colorHash = new ColorHash();
        return colorHash.hex(item);
    }

}
