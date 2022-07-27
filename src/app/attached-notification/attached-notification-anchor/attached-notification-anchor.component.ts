import {
  AfterViewInit,
  Component,
  ElementRef,
  HostListener,
  Input,
  OnDestroy,
  OnInit,
  TemplateRef,
  ViewChild, ViewContainerRef,
} from '@angular/core';

import { AttachedNotificationOverlayService } from '../service/attached-notification-overlay.service';
import { AttachedNotificationTemplateDirective } from '../directive/attached-notification-template.directive';
import { AttachedNotificationComponent } from '../attached-notification/attached-notification.component';

@Component({
  selector: 'app-attached-notification-anchor',
  templateUrl: './attached-notification-anchor.component.html',
  styleUrls: [ './attached-notification-anchor.component.scss' ],
})
export class AttachedNotificationAnchorComponent
implements AfterViewInit, OnDestroy, OnInit {
  @ViewChild(AttachedNotificationTemplateDirective, { read: TemplateRef })
  notificationTemplate: TemplateRef<AttachedNotificationComponent>;
  @ViewChild('dot') anchorDot!: ElementRef;

  @Input() title: string;
  @Input() autoShowNotificationAfterInit = false;

  private notificationIsVisible = false;
  private observer: IntersectionObserver;

  constructor(
    private viewContainerRef: ViewContainerRef,
    private anchor: ElementRef,
    private notificationOverlayService: AttachedNotificationOverlayService,
  ) {}

  private static escapeKeyUsed = (event: KeyboardEvent): boolean => event?.code === 'Escape';

  private intersectionCallback(entries: Array<IntersectionObserverEntry>): void {
    /* istanbul ignore else */
    if (this.notificationIsVisible && !entries[0].isIntersecting) {
      this.notificationOverlayService.hide();
    }
  }

  @HostListener('window:keyup', [ '$event' ])
  onKeyUp($event: KeyboardEvent): void {
    if (this.notificationIsVisible) {
      if (AttachedNotificationAnchorComponent.escapeKeyUsed($event)) {
        this.notificationOverlayService.hide();
      }
    }
  }

  onClick(): void {
    if (this.notificationIsVisible) {
      this.notificationOverlayService.hide();
    } else {
      if (this.notificationTemplate) {
        this.notificationOverlayService.show(
          this.viewContainerRef,
          this.notificationTemplate,
        );
      }
    }
  }

  ngAfterViewInit(): void {
    this.notificationOverlayService.notificationAnchor = this.anchor;

    /* istanbul ignore else */
    if (this.anchorDot) {
      this.observer = new IntersectionObserver(entries =>
        this.intersectionCallback(entries),
      );

      this.observer.observe(this.anchorDot.nativeElement as Element);
    }

    if (this.autoShowNotificationAfterInit) {
      this.notificationOverlayService.show(this.viewContainerRef, this.notificationTemplate);
    }
  }

  ngOnInit(): void {
    this.notificationOverlayService.isOpen$.subscribe(isOpen =>
      this.notificationIsVisible = isOpen);
  }

  ngOnDestroy(): void {
    if (this.notificationIsVisible) {
      this.notificationOverlayService.hide();
    }

    if (this.observer) {
      this.observer.disconnect();
    }
  }
}
