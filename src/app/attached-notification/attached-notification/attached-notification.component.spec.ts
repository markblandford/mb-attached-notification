import { ChangeDetectorRef, ElementRef } from '@angular/core';
import { waitForAsync } from '@angular/core/testing';
import { ConnectionPositionPair } from '@angular/cdk/overlay';

import { AttachedNotificationOverlayService } from '../service/attached-notification-overlay.service';

import { AttachedNotificationComponent } from './attached-notification.component';
import { of } from 'rxjs';

describe('AttachedNotificationComponent', () => {
  let component: AttachedNotificationComponent;

  let attachedNotificationServiceMock: jasmine.SpyObj<AttachedNotificationOverlayService>;

  let changeDetectorMock: jasmine.SpyObj<ChangeDetectorRef>;
  let fakeFocusElement: jasmine.SpyObj<ElementRef>;

  beforeEach(
    waitForAsync(() => {
      attachedNotificationServiceMock = jasmine.createSpyObj(
        'AttachedNotificationOverlayService',
        [ 'hide', 'setFocusOn' ],
      ) as jasmine.SpyObj<AttachedNotificationOverlayService>;

      changeDetectorMock = jasmine.createSpyObj('ChangeDetectorRef', [
        'detectChanges',
      ]) as jasmine.SpyObj<ChangeDetectorRef>;
    }),
  );

  beforeEach(() => {
    attachedNotificationServiceMock.setFocusOn.and.stub();
    attachedNotificationServiceMock.setFocusOn.calls.reset();
    changeDetectorMock.detectChanges.calls.reset();

    component = new AttachedNotificationComponent(
      changeDetectorMock,
      attachedNotificationServiceMock,
    );

    fakeFocusElement = jasmine.createSpyObj('ElementRef', [
      '',
    ]) as jasmine.SpyObj<ElementRef>;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should hide the notification when dismiss is called', () => {
    component.dismiss();

    expect(attachedNotificationServiceMock.hide).toHaveBeenCalledTimes(1);
  });

  describe('updateAnchorPosition - control the position of the triangle / arrow', () => {
    let fakeAnchorElement: ElementRef;
    let nativeElement: jasmine.SpyObj<ElementRef>;

    beforeEach(() => {
      nativeElement = jasmine.createSpyObj('nativeElement', [
        'getBoundingClientRect',
      ]) as jasmine.SpyObj<ElementRef>;

      fakeAnchorElement = {
        nativeElement,
      };

      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
      fakeAnchorElement.nativeElement.getBoundingClientRect.and.returnValue({ width: 8 });
      attachedNotificationServiceMock.notificationAnchor = fakeAnchorElement;
    });

    it('should set anchorY to match the overlayY property from the new attached-notification-anchor position', () => {
      const anchorPosition = {
        overlayY: 'bottom',
        offsetX: 0,
      } as ConnectionPositionPair;

      component.anchorY = 'top';
      component.updateAnchorPosition(anchorPosition);

      expect(component.anchorY).toEqual('bottom');
      expect(changeDetectorMock.detectChanges).toHaveBeenCalledTimes(1);
    });

    it('should set the style when the overlay is positioned at the start on the x axis', () => {
      const expectedStyle = {
        left: '53px',
      };

      const anchorPosition = {
        overlayY: 'top',
        overlayX: 'start',
        offsetX: 98,
      } as ConnectionPositionPair;

      component.updateAnchorPosition(anchorPosition);

      expect(component.anchorY).toEqual('top');
      expect(component.style).toEqual(expectedStyle);
    });

    it('should set the style when the overlay is not positioned at the start on the x axis', () => {
      const expectedStyle = {
        right: '14px',
      };

      const anchorPosition = {
        overlayY: 'top',
        overlayX: 'end',
        offsetX: -20,
      } as ConnectionPositionPair;

      component.updateAnchorPosition(anchorPosition);

      expect(component.anchorY).toEqual('top');
      expect(component.style).toEqual(expectedStyle);
    });

    it('should set the style to not display the arrow when there is no attached-notification-anchor (should never happen)', () => {
      const expectedStyle = {
        display: 'none',
      };

      const anchorPosition = {
        overlayY: 'top',
        overlayX: 'end',
        offsetX: -20,
      } as ConnectionPositionPair;

      attachedNotificationServiceMock.notificationAnchor = undefined;

      component.updateAnchorPosition(anchorPosition);

      expect(component.anchorY).toEqual('top');
      expect(component.style).toEqual(expectedStyle);
    });
  });

  it('should call `setFocusTo` to set the focus on the element within the notification in ngAfterViewInit', () => {
    const anchorPosition = {
      overlayY: 'bottom',
      offsetX: 0,
    } as ConnectionPositionPair;

    component.defaultFocusOn = fakeFocusElement;

    attachedNotificationServiceMock.anchorPositionChanges$ = of(anchorPosition);

    component.ngAfterViewInit();

    expect(attachedNotificationServiceMock.setFocusOn).toHaveBeenCalledWith(
      fakeFocusElement,
    );
  });
});
