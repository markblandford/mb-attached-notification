import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef, Input,
  ViewChild,
} from '@angular/core';
import { ConnectionPositionPair, HorizontalConnectionPos, VerticalConnectionPos } from '@angular/cdk/overlay';
import { animate, style, transition, trigger } from '@angular/animations';

import { AttachedNotificationOverlayService } from '../service/attached-notification-overlay.service';

@Component({
  selector: 'app-attached-notification',
  templateUrl: './attached-notification.component.html',
  styleUrls: [ './attached-notification.component.scss' ],
  animations: [
    trigger('fadeInAnimation', [
      transition(':enter', [
        style({
          opacity: 0,
          transform: 'scale(0)',
        }),
        animate(
          '200ms ease-out',
          style({
            opacity: 1,
            transform: 'scale(1)',
          }),
        ),
      ]),
    ]),
  ],
})
export class AttachedNotificationComponent implements AfterViewInit {
  @ViewChild('defaultFocusOn') defaultFocusOn!: ElementRef;

  @Input() title: string;

  anchorY: VerticalConnectionPos;
  anchorX: HorizontalConnectionPos;
  style: { [klass: string]: any };

  constructor(
    private changeDetector: ChangeDetectorRef,
    private notificationOverlayService: AttachedNotificationOverlayService,
  ) {}

  dismiss(): void {
    this.notificationOverlayService.hide();
  }

  updateAnchorPosition(anchorPosition: ConnectionPositionPair): void {
    let checkXChange = this.anchorX !== anchorPosition.overlayX;
    let checkYChange = this.anchorY !== anchorPosition.overlayY;

    this.anchorX = anchorPosition.overlayX;
    this.anchorY = anchorPosition.overlayY;

    const anchor = this.notificationOverlayService?.notificationAnchor
      ?.nativeElement as HTMLElement;
    const anchorWidth = anchor?.getBoundingClientRect().width;

    if (anchorWidth) {
      // get the center of the notification attached-notification-anchor
      const arrowPosition = anchorWidth / 2 + Math.abs(anchorPosition.offsetX!) / 2;
      if (anchorPosition.overlayX === 'start') {
        this.style = {
          left: `${arrowPosition}px`,
        };
      } else {
        this.style = {
          right: `${arrowPosition}px`,
        };
      }
    } else {
      // what?!?! no attached-notification-anchor?!?!
      this.style = {
        display: 'none',
      };
    }

    if (checkXChange || checkYChange) {
      this.changeDetector.detectChanges();
    }
  }

  ngAfterViewInit(): void {
    this.notificationOverlayService.setFocusOn(this.defaultFocusOn);

    this.notificationOverlayService.anchorPositionChanges$.subscribe(_ => {
      this.updateAnchorPosition(_);
    });
  }
}
