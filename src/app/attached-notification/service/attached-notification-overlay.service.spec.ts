import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import {
  ConnectedOverlayPositionChange,
  ConnectedPosition,
  FlexibleConnectedPositionStrategy,
  Overlay,
  OverlayConfig,
  OverlayModule,
  OverlayPositionBuilder,
  OverlayRef,
  ScrollingVisibility,
  ScrollStrategyOptions,
} from '@angular/cdk/overlay';
import { ElementRef, TemplateRef, ViewContainerRef } from '@angular/core';
import { of } from 'rxjs';

import { AttachedNotificationOverlayService } from './attached-notification-overlay.service';

describe('AttachedNotificationOverlayService', () => {
  let service: AttachedNotificationOverlayService;
  let overlay: Overlay;

  let fakeOverlay: jasmine.SpyObj<Overlay>;

  const firstPositionChange = {
    connectionPair: {
      originX: 'start',
      originY: 'bottom',
      overlayX: 'start',
      overlayY: 'top',
      offsetX: -20,
    },
    scrollableViewProperties: {
      isOriginClipped: false,
    } as ScrollingVisibility,
  } as ConnectedOverlayPositionChange;

  let fakeOverlayRef: jasmine.SpyObj<OverlayRef>;
  let fakeConnectedPositionStrategy: jasmine.SpyObj<FlexibleConnectedPositionStrategy>;

  let fakePositionBuilder: jasmine.SpyObj<OverlayPositionBuilder>;

  let nativeElement: jasmine.SpyObj<ElementRef>;
  let fakeElement: ElementRef;

  beforeEach(() => {
    fakeOverlay = jasmine.createSpyObj('Overlay', [
      'create',
      'position',
      'scrollStrategies',
    ]) as jasmine.SpyObj<Overlay>;

    fakeOverlayRef = jasmine.createSpyObj('OverlayRef', [
      'attach',
      'dispose',
    ]) as jasmine.SpyObj<OverlayRef>;

    fakeConnectedPositionStrategy = jasmine.createSpyObj(
      'FlexibleConnectedPositionStrategy',
      [ 'withPositions' ],
    ) as jasmine.SpyObj<FlexibleConnectedPositionStrategy>;

    fakeOverlay.create.and.returnValue(fakeOverlayRef);

    fakeConnectedPositionStrategy.positionChanges = of(firstPositionChange);

    fakeConnectedPositionStrategy.withPositions.and.returnValue(
      fakeConnectedPositionStrategy,
    );

    fakePositionBuilder = jasmine.createSpyObj('OverlayPositionBuilder', [
      'flexibleConnectedTo',
    ]) as jasmine.SpyObj<OverlayPositionBuilder>;

    fakePositionBuilder.flexibleConnectedTo.and.returnValue(
      fakeConnectedPositionStrategy,
    );

    fakeOverlay.position.and.returnValue(fakePositionBuilder);
    // @ts-ignore
    fakeOverlay.scrollStrategies = new ScrollStrategyOptions(null, null, null, null);

    nativeElement = jasmine.createSpyObj('nativeElement', [
      '',
    ]) as jasmine.SpyObj<ElementRef>;

    fakeElement = {
      nativeElement,
    };

    TestBed.configureTestingModule({
      imports: [ OverlayModule ],
      providers: [
        { provide: Overlay, useValue: fakeOverlay },
        {
          provide: ViewContainerRef,
          useValue: jasmine.createSpyObj('ViewContainerRef', [
            '',
          ]) as jasmine.SpyObj<ViewContainerRef>,
        },
        {
          provide: Document,
          useValue: jasmine.createSpyObj('Document', [
            'activeElement',
          ]) as jasmine.SpyObj<Document>,
        },
      ],
    });

    service = TestBed.inject(AttachedNotificationOverlayService);
    overlay = TestBed.inject(Overlay);

    fakeOverlayRef.attach.calls.reset();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('overlay has an origin, positions and overlay template', () => {
    const expectedPositions: Array<ConnectedPosition> = [
      { ...firstPositionChange.connectionPair },
      {
        originX: 'end',
        originY: 'bottom',
        overlayX: 'end',
        overlayY: 'top',
        offsetX: 20,
      },
      {
        originX: 'start',
        originY: 'top',
        overlayX: 'start',
        overlayY: 'bottom',
        offsetX: -20,
      },
    ];

    it('should display the overlay, returning a promise', fakeAsync(() => {
      const origin = jasmine.createSpyObj('lgAttachedNotificationAnchor', [
        '',
      ]) as ElementRef;

      const expectedConfig: OverlayConfig = {
        scrollStrategy: overlay.scrollStrategies.reposition(),
        positionStrategy: overlay
          .position()
          .flexibleConnectedTo(origin)
          .withPositions(expectedPositions),
        disposeOnNavigation: true,
      };

      const viewContainerRef = jasmine.createSpyObj('ViewContainerRef', [
        '',
      ]) as jasmine.SpyObj<ViewContainerRef>;

      service.notificationAnchor = fakeElement;

      let result = null;

      service.show(viewContainerRef, {} as TemplateRef<any>).then(os => (result = os));
      tick();

      let positionChanges = null;

      service.anchorPositionChanges$.subscribe(_ => (positionChanges = _));

      expect(fakeConnectedPositionStrategy.withPositions).toHaveBeenCalledWith(
        expectedPositions,
      );

      expect(overlay.create).toHaveBeenCalledWith(expectedConfig);
      expect(service['overlayRef'].attach).toHaveBeenCalledTimes(1);
      // @ts-ignore
      expect(positionChanges).toEqual({ ...firstPositionChange.connectionPair });
      // @ts-ignore
      expect(result).toEqual(service);
    }));

    it('should set the focus and store the previously focused element', fakeAsync(() => {
      const fakeNativeElement = jasmine.createSpyObj('NativeElement', [
        'focus',
      ]) as jasmine.SpyObj<ElementRef<HTMLElement>>;
      const fakeFocusElement = jasmine.createSpyObj('ElementRef', [
        '',
      ]) as jasmine.SpyObj<ElementRef>;

      fakeFocusElement.nativeElement = fakeNativeElement;

      service.setFocusOn(fakeFocusElement);
      tick(0);

      expect(service['previousFocusedElement']).toBeDefined();
      // @ts-ignore
      expect(fakeNativeElement['focus']).toHaveBeenCalledTimes(1);
    }));

    it('should dispose of the overlay when the overlay is hidden', () => {
      const destroySpy = spyOn(service as any, 'destroy');

      service['overlayRef'] = jasmine.createSpyObj('OverlayRef', [
        'dispose',
      ]) as jasmine.SpyObj<OverlayRef>;

      service.hide();

      expect(destroySpy).toHaveBeenCalledTimes(1);
    });

    it('should dispose of the overlay when the overlay is hidden and return focus if focus was set', () => {
      const fakeFocusElement = jasmine.createSpyObj('HTMLElement', [
        'focus',
      ]) as jasmine.SpyObj<HTMLElement>;
      const destroySpy = spyOn(service as any, 'destroy');

      service['overlayRef'] = jasmine.createSpyObj('OverlayRef', [
        'dispose',
      ]) as jasmine.SpyObj<OverlayRef>;

      service['previousFocusedElement'] = fakeFocusElement;
      service.hide();

      expect(destroySpy).toHaveBeenCalledTimes(1);
      expect(fakeFocusElement.focus).toHaveBeenCalledTimes(1);
    });

    it('should dispose of the overlay in onDestroy when there is an overlay', () => {
      const spy = jasmine.createSpyObj('OverlayRef', [
        'dispose',
      ]) as jasmine.SpyObj<OverlayRef>;

      service['overlayRef'] = spy;

      service.ngOnDestroy();

      expect(spy.dispose).toHaveBeenCalledTimes(1);
    });

    it('should not try and dispose of the overlay in hide when there is no overlay', () => {
      const spy = jasmine.createSpyObj('OverlayRef', [
        'dispose',
      ]) as jasmine.SpyObj<OverlayRef>;

      // @ts-ignore
      service['overlayRef'] = null;

      service.hide();

      expect(spy.dispose).not.toHaveBeenCalledTimes(1);
    });

    it('should not try and dispose of the overlay in onDestroy when there is no overlay', () => {
      const spy = jasmine.createSpyObj('OverlayRef', [
        'dispose',
      ]) as jasmine.SpyObj<OverlayRef>;

      // @ts-ignore
      service['overlayRef'] = null;

      service.ngOnDestroy();

      expect(spy.dispose).not.toHaveBeenCalledTimes(1);
    });
  });

  describe('overlay does not have an origin, positions or overlay template', () => {
    it('should return a rejected promise if there is no display parameters provided when attempting to open the overlay', fakeAsync(() => {
      let result = null;
      let error = null;

      service.show(null as any, null as any).then(
        r => (result = r),
        (e: Error) => (error = e),
      );

      tick();

      expect(result).toBeNull();
      expect(error).not.toBeNull();
    }));
  });
});
