import { ElementRef, TemplateRef, ViewContainerRef } from '@angular/core';
import { waitForAsync } from '@angular/core/testing';

import { AttachedNotificationOverlayService } from '../service/attached-notification-overlay.service';

import { AttachedNotificationAnchorComponent } from './attached-notification-anchor.component';
import { BehaviorSubject } from 'rxjs';

describe('AttachedNotificationAnchorComponent', () => {
  let component: AttachedNotificationAnchorComponent;
  let nativeElement: jasmine.SpyObj<ElementRef>;
  let viewContainerRefMock: jasmine.SpyObj<ViewContainerRef>;
  let accountNotificationTemplateMock: jasmine.SpyObj<TemplateRef<any>>;
  let attachedNotificationServiceMock: jasmine.SpyObj<AttachedNotificationOverlayService>;
  let fakeElement: ElementRef;
  let dotElement: jasmine.SpyObj<ElementRef>;

  beforeEach(
    waitForAsync(() => {
      viewContainerRefMock = jasmine.createSpyObj('ViewContainerRef', [
        '',
      ]) as jasmine.SpyObj<ViewContainerRef>;

      accountNotificationTemplateMock = jasmine.createSpyObj('TemplateRef', [
        '',
      ]) as jasmine.SpyObj<TemplateRef<any>>;

      attachedNotificationServiceMock = jasmine.createSpyObj(
        'AttachedNotificationOverlayService',
        [ 'hide', 'show' ],
      ) as jasmine.SpyObj<AttachedNotificationOverlayService>;

      attachedNotificationServiceMock.isOpen$ = new BehaviorSubject<boolean>(false);

      nativeElement = jasmine.createSpyObj('nativeElement', [
        '',
      ]) as jasmine.SpyObj<ElementRef>;

      dotElement = jasmine.createSpyObj('ElementRef', [
        'nativeElement',
      ]) as jasmine.SpyObj<ElementRef>;

      fakeElement = {
        nativeElement,
      };
    }),
  );

  beforeEach(() => {

    component = new AttachedNotificationAnchorComponent(
      viewContainerRefMock,
      fakeElement,
      attachedNotificationServiceMock,
    );

    component.notificationTemplate = accountNotificationTemplateMock;

    component.ngOnInit();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    expect((component as any).notificationIsVisible).toBeFalse();
  });

  it('should set the notification attached-notification-anchor in ngAfterViewInit', () => {
    component.ngAfterViewInit();

    expect(attachedNotificationServiceMock.notificationAnchor).toEqual(fakeElement);
  });

  describe('onKeyUp - escape key pressed', () => {
    it('should hide the notification when the esc key has been pressed in Evergreen browsers (Chrome, Firefox etc.)', () => {
      attachedNotificationServiceMock.isOpen$.next(true);

      const keyEsc = { code: 'Escape' } as KeyboardEvent;

      component.onKeyUp(keyEsc);

      expect(attachedNotificationServiceMock.hide).toHaveBeenCalledTimes(1);
    });

    it('should not hide the notification when a key other than esc has been pressed', () => {
      attachedNotificationServiceMock.isOpen$.next(true);

      const keyEnter = { code: 'Enter' } as KeyboardEvent;

      component.onKeyUp(keyEnter);

      expect(attachedNotificationServiceMock.hide).not.toHaveBeenCalled();
    });

    it('should not do anything if the notification is not displayed and the esc key has been pressed', () => {
      attachedNotificationServiceMock.isOpen$.next(false);

      const keyEsc = { code: 'Escape' } as KeyboardEvent;

      component.onKeyUp(keyEsc);

      expect(attachedNotificationServiceMock.hide).not.toHaveBeenCalled();
    });
  });

  describe('onClick', () => {
    it('should hide the notification when clicked and the notification is already open', () => {
      attachedNotificationServiceMock.isOpen$.next(true);

      component.onClick();

      expect(attachedNotificationServiceMock.hide).toHaveBeenCalledTimes(1);
    });

    it('should show the notification when clicked and the notification is not open and set the attached-notification-anchor', () => {
      attachedNotificationServiceMock.isOpen$.next(false);

      component.onClick();

      expect(attachedNotificationServiceMock.show).toHaveBeenCalledTimes(1);
    });
  });

  describe('auto show', () => {
    it('should show the notification in ngAfterViewInit when autoShowNotificationAfterInit is true and there is a new notification and it hasn\'t been actioned', () => {
      component.autoShowNotificationAfterInit = true;
      component.ngAfterViewInit();

      expect(attachedNotificationServiceMock.show).toHaveBeenCalledTimes(1);
    });

    it('should not automatically show the notification in ngAfterViewInit when autoShowNotificationAfterInit is false', () => {
      component.autoShowNotificationAfterInit = false;
      component.ngAfterViewInit();

      expect(attachedNotificationServiceMock.show).not.toHaveBeenCalled();
    });
  });

  describe('onDestroy', () => {
    it('should hide the notification in onDestroy if it is already open', () => {
      attachedNotificationServiceMock.isOpen$.next(true);

      component.ngOnDestroy();

      expect(attachedNotificationServiceMock.hide).toHaveBeenCalledTimes(1);
    });

    it('should only hide the notification in onDestroy if it is already open', () => {
      attachedNotificationServiceMock.isOpen$.next(false);

      component.ngOnDestroy();

      expect(attachedNotificationServiceMock.hide).not.toHaveBeenCalled();
    });
  });

  describe('Intersection Observer', () => {
    let mockObserver: IntersectionObserver;
    let observerSpy: jasmine.Spy;

    beforeEach(() => {
      mockObserver = jasmine.createSpyObj('IntersectionObserver', [
        'observe',
        'disconnect',
      ]) as jasmine.SpyObj<IntersectionObserver>;

      observerSpy = spyOn(window, 'IntersectionObserver').and.returnValue(mockObserver);

      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      dotElement.nativeElement.and.returnValue({});
      component.anchorDot = dotElement;

      component.ngAfterViewInit();
    });

    it('should observe the element when ngAfterViewInit is called', () => {
      expect(observerSpy).toHaveBeenCalledTimes(1);

      expect(mockObserver.observe).toHaveBeenCalledWith(
        dotElement.nativeElement as Element,
      );
    });

    it('should hide the notification when the attached-notification-anchor is not in the viewport and a notification is displayed', () => {
      attachedNotificationServiceMock.isOpen$.next(true);

      const entries = [ { isIntersecting: false } as IntersectionObserverEntry ];

      // not ideal but I can't figure out how to mock calling the IntersectionObserver constructor
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      (component as any).intersectionCallback(entries);

      expect(attachedNotificationServiceMock.hide).toHaveBeenCalledTimes(1);
    });

    it('should disconnect from the intersection observer when ngOnDestroy is called', () => {
      component.ngOnDestroy();

      expect(mockObserver.disconnect).toHaveBeenCalledTimes(1);
    });
  });
});
