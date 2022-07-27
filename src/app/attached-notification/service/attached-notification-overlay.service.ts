import {
  ElementRef,
  Inject,
  Injectable,
  OnDestroy,
  TemplateRef,
  ViewContainerRef,
} from '@angular/core';
import {
  ConnectedPosition,
  ConnectionPositionPair,
  Overlay,
  OverlayConfig,
  OverlayRef,
} from '@angular/cdk/overlay';
import { DOCUMENT } from '@angular/common';
import { TemplatePortal } from '@angular/cdk/portal';
import { map } from 'rxjs/operators';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { ConfigurableFocusTrapFactory } from '@angular/cdk/a11y';

@Injectable({
  providedIn: 'root',
})
export class AttachedNotificationOverlayService implements OnDestroy {
  positions: Array<ConnectedPosition> = [
    {
      originX: 'start',
      originY: 'bottom',
      overlayX: 'start',
      overlayY: 'top',
      offsetX: -18,
    },
    {
      originX: 'end',
      originY: 'bottom',
      overlayX: 'end',
      overlayY: 'top',
      offsetX: 18,
    },
    {
      originX: 'start',
      originY: 'top',
      overlayX: 'start',
      overlayY: 'bottom',
      offsetX: -18,
    },
    {
      originX: 'end',
      originY: 'top',
      overlayX: 'end',
      overlayY: 'bottom',
      offsetX: 18,
    },
  ];
  notificationAnchor: ElementRef | undefined;
  anchorPositionChanges$: Observable<ConnectionPositionPair>;
  isOpen$: BehaviorSubject<boolean> = new BehaviorSubject(false);

  private overlayRef: OverlayRef;
  private previousFocusedElement: HTMLElement | null = null;

  constructor(
    private overlay: Overlay,
    private focusTrapFactory: ConfigurableFocusTrapFactory,
    @Inject(DOCUMENT) private document: Document,
  ) {}

  private destroy(): void {
    if (this.overlayRef) {
      this.isOpen$.next(false);
      this.overlayRef.dispose();
    }
  }

  // Saves a reference to the element that was focused before the overlay was displayed.
  private savePreviouslyFocusedElement(): void {
    /* istanbul ignore else */
    if (this.document) {
      this.previousFocusedElement = this.document.activeElement as HTMLElement;
    }
  }

  // Returns the focus to the element focused before the notification overlay was open.
  private returnFocus() {
    const toFocus = this.previousFocusedElement;

    // We need the extra check, because IE can set the `activeElement` to null in some cases.
    if (toFocus && typeof toFocus.focus === 'function') {
      toFocus.focus();
    }
  }

  show(
    viewContainerRef: ViewContainerRef,
    notificationTemplate: TemplateRef<any>,
  ): Promise<AttachedNotificationOverlayService> {
    return new Promise<AttachedNotificationOverlayService>((resolve, reject) => {
      if (
        this.notificationAnchor &&
        viewContainerRef &&
        notificationTemplate &&
        this.positions
      ) {
        console.log(`AttachedNotificationOverlayService.[104]:`,);
        const positionStrategy = this.overlay
          .position()
          .flexibleConnectedTo(this.notificationAnchor)
          .withPositions(this.positions);

        const oConfig: OverlayConfig = {
          scrollStrategy: this.overlay.scrollStrategies.reposition(),
          positionStrategy,
          disposeOnNavigation: true,
        };

        this.overlayRef = this.overlay.create(oConfig);

        this.anchorPositionChanges$ = positionStrategy.positionChanges.pipe(
          map(pc => pc.connectionPair),
        );

        this.overlayRef.attach(
          new TemplatePortal(notificationTemplate, viewContainerRef),
        );

        this.isOpen$.next(true);

        return resolve(
          new Promise<AttachedNotificationOverlayService>(resolve1 => {
            setTimeout(() => resolve1(this));
          }),
        );
      }

      return reject(this);
    });
  }

  hide(): void {
    if (this.overlayRef) {
      this.destroy();

      this.returnFocus();
    }
  }

  setFocusOn(setFocusOnElement: ElementRef): void {
    this.savePreviouslyFocusedElement();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
    setTimeout(() => setFocusOnElement.nativeElement.focus(), 0);
  }

  ngOnDestroy(): void {
    this.destroy();
  }
}
