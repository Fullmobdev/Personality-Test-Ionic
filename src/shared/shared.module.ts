import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from 'ionic-angular';
import { TranslateModule } from '@ngx-translate/core';
import { IonicImageLoader } from 'ionic-image-loader/dist/src';

import { TestResultComponent } from './components/test-result/test-result';
import { TestWizardComponent } from './components/test-wizard/test-wizard';
import { ImageUploadComponent } from './components/image-upload/image-upload';
import { PipesModule } from './pipes/pipes.module';
import { TribeEditorComponent } from './components/tribe-editor/tribe-editor';
import { TribesListComponent } from './components/tribes-list/tribes-list.component';
import { ScrollHideDirective } from './directives/scroll-hide.directive';
import { FloatingHeaderDirective } from './directives/floating-header.directive';
import { ProfilesListComponent } from './components/profiles-list/profiles-list.component';
import { TestListComponent } from './components/test-list/test-list.component';
import { PillListComponent } from './components/pill-list/pill-list.component';
import { FacebookButtonComponent } from './components/facebook-button/facebook-button';
import { GoogleButtonComponent } from './components/google-button/google-button';
import { DefaultLocalePipe } from './pipes/default-locale/default-locale';

@NgModule({
    declarations: [
        TestResultComponent,
        TestWizardComponent,
        TestListComponent,
        ImageUploadComponent,
        TribeEditorComponent,
        TribesListComponent,
        PillListComponent,
        ScrollHideDirective,
        FloatingHeaderDirective,
        ProfilesListComponent,
        FacebookButtonComponent,
        GoogleButtonComponent
    ],
    imports: [
        ReactiveFormsModule,
        IonicImageLoader,
        FormsModule,
        IonicModule,
        TranslateModule,
        PipesModule
    ],
    exports: [
        ReactiveFormsModule,
        IonicImageLoader,
        TranslateModule,
        PipesModule,

        TestWizardComponent,
        TestResultComponent,
        TestListComponent,
        ImageUploadComponent,
        TribeEditorComponent,
        TribesListComponent,
        PillListComponent,
        ScrollHideDirective,
        FloatingHeaderDirective,
        ProfilesListComponent,
        FacebookButtonComponent,
        GoogleButtonComponent
    ],
    providers: [
        DefaultLocalePipe
    ]
})
export class SharedModule {}
