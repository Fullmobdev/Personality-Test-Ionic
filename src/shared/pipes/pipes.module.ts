import { NgModule } from '@angular/core';
import { DefaultLocalePipe } from './default-locale/default-locale';

@NgModule({
	declarations: [DefaultLocalePipe],
	imports: [],
	exports: [DefaultLocalePipe]
})
export class PipesModule {}
