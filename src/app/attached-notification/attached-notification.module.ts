import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PortalModule } from '@angular/cdk/portal';

import {
  AttachedNotificationAnchorComponent
} from './attached-notification-anchor/attached-notification-anchor.component';
import { AttachedNotificationComponent } from './attached-notification/attached-notification.component';
import { AttachedNotificationTemplateDirective } from './directive/attached-notification-template.directive';
import { AttachedNotificationOverlayService } from './service/attached-notification-overlay.service';
import { OverlayModule } from '@angular/cdk/overlay';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

@NgModule({
  declarations: [
    AttachedNotificationAnchorComponent,
    AttachedNotificationComponent,
    AttachedNotificationTemplateDirective,
  ],
  imports: [
    BrowserAnimationsModule,
    CommonModule,
    OverlayModule,
    PortalModule,
  ],
  providers: [
    AttachedNotificationOverlayService,
  ],
  exports: [
    AttachedNotificationAnchorComponent,
    AttachedNotificationComponent,
    AttachedNotificationTemplateDirective,
  ]
})
export class AttachedNotificationModule { }
