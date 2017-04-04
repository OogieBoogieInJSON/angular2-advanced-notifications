import {
  Component,
  ViewEncapsulation,
  trigger,
  state,
  style,
  transition,
  animate
 } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
import { Subject } from 'rxjs/Subject';
import * as _ from 'lodash';
import { AnBusService } from '../anBus.service';
import { GlobalAlertConfig } from './globalAlertConfig.type';
import { BrowserViewports } from './browserViewports';
import { Alert } from './alert.type';
import { AnAlertItemsByPosition } from './alertItemsByPosition.type';
import { AnAlertTypes } from './alertTypes.enum';
import positionToAnimationLink from './positionToAnimationLink';

@Component({
  selector: 'an-alert',
  template: `
    <div class="anAlert__container anAlert__container--left"
         *ngIf="containerStates.left"
         [ngClass]="{'anAlert__container--reverse': containerDirections.reverseLeft }">
      <an-alert-item *ngFor="let item of items.left"
                     [@ASD]="item.$$animationState"
                     [options]="item"
                     (onClose)="onClose($event)"
                     (onAlertItemUpdates)="onAlertItemUpdates($event)">
      </an-alert-item>
    </div>

    <div class="anAlert__container anAlert__container--center"
         *ngIf="containerStates.center"
         [ngClass]="{'anAlert__container--reverse': containerDirections.reverseCenter }">
      <an-alert-item *ngFor="let item of items.center"
                     [@ASD]="item.$$animationState"
                     [options]="item"
                     (onClose)="onClose($event)"
                     (onAlertItemUpdates)="onAlertItemUpdates($event)">
      </an-alert-item>
    </div>

    <div class="anAlert__container anAlert__container--right"
         *ngIf="containerStates.right"
         [ngClass]="{'anAlert__container--reverse': containerDirections.reverseRight }">
      <an-alert-item *ngFor="let item of items.right"
                     [@ASD]="item.$$animationState"
                     [options]="item"
                     (onClose)="onClose($event)"
                     (onAlertItemUpdates)="onAlertItemUpdates($event)">
      </an-alert-item>
    </div>
  `,
  encapsulation: ViewEncapsulation.None,
  animations: [
    trigger('ASD', [
      state('fadeInUp', style({ transform: 'translateY(0)' })),
      state('fadeInRight', style({ transform: 'translateX(0)' })),
      state('fadeInDown', style({ transform: 'translateY(0)' })),
      state('fadeInLeft', style({ transform: 'translateX(0)' })),

      // Enter transitions
      transition('void => fadeInUp', [
        style({ transform: 'translateY(100%)' }),
        animate('100ms cubic-bezier(0.0, 0.0, 0.2, 1)')
      ]),

      transition('void => fadeInRight', [
        style({ transform: 'translateX(100%)' }),
        animate('100ms cubic-bezier(0.0, 0.0, 0.2, 1)')
      ]),

      transition('void => fadeInDown', [
        style({ transform: 'translateY(-100%0)' }),
        animate('100ms cubic-bezier(0.0, 0.0, 0.2, 1)')
      ]),

      transition('void => fadeInLeft', [
        style({ transform: 'translateX(-100%)' }),
        animate('100ms cubic-bezier(0.0, 0.0, 0.2, 1)')
      ]),

      // Leave transitions
      transition('fadeInUp => void', [
        animate('200ms cubic-bezier(0.4, 0.0, 1, 1)', style({ transform: 'translateY(-100%)' }))
      ]),

      transition('fadeInRight => void', [
        animate('200ms cubic-bezier(0.4, 0.0, 1, 1)', style({ transform: 'translateX(100%)' }))
      ]),

      transition('fadeInDown => void', [
        animate('200ms cubic-bezier(0.4, 0.0, 1, 1)', style({ transform: 'translateY(-100%)' }))
      ]),

      transition('fadeInLeft => void', [
        animate('200ms cubic-bezier(0.4, 0.0, 1, 1)', style({ transform: 'translateX(-100%)' }))
      ])
    ])
  ]
})

export class AnAlert {
  private globalAlertConfig: GlobalAlertConfig;
  private browserViewports: any;

  private showAlertSubscription: Subscription;
  private hideAlertSubscription: Subscription;
  private hideAllAlertsSubscription: Subscription;
  private hideAlertsSubscription: Subscription;

  containerStates = {
    left: false,
    center: false,
    right: false
  };
  containerDirections = {
    reverseLeft: false,
    reverseCenter: false,
    reverseRight: false
  };
  items: AnAlertItemsByPosition = {
    left: [],
    center: [],
    right: []
  };
  defaults: Alert = {
    message: 'No message was set',
    position: 'topRight',
    pauseOnHover: false,
    showProgressBar: false,
    delay: 0,
    timeout: 0,
    type: AnAlertTypes.BLANK,
    showNotification: false
  };

  constructor(public anBus: AnBusService) {
    this.globalAlertConfig = anBus.getGlobalConfigForAlerts();

    this._updateBrowserViewports();
    this._subscribeToBus();
  }

  onClose(id: string) {
    this._removeItem(id);
    this.anBus.$$onClose.next(id);
  }

  private _subscribeToBusShowHandler(config: Alert) {
    this._updateItems(config);
  }

  private _subscribeToBusHideHandler(id: string) {
    this.onClose(id);
  }

  private _subscribeToBusHideAllHandler() {
    this._hideAllAlerts();
  }

  private _subscribeToBusHideAlertsHandler(alertsIds: Array<string>) {
    this._hideAlerts(alertsIds);
  }

  private _subscribeToBus() {
    this.showAlertSubscription = this.anBus.showAlert$.subscribe(config => {
      this._subscribeToBusShowHandler(config);
    });

    this.hideAlertSubscription = this.anBus.hideAlert$.subscribe(id => {
      this._subscribeToBusHideHandler(id);
    });

    this.hideAllAlertsSubscription = this.anBus.hideAllAlerts$.subscribe(() => this._subscribeToBusHideAllHandler());

    this.hideAlertsSubscription = this.anBus.hideAlerts$.subscribe((alertsIds: Array<string>) => this._subscribeToBusHideAlertsHandler(alertsIds));
  }

  private _updateItems(config: Alert) {
    let newConfig: Alert = _.merge(
      {},
      this.defaults,
      config,
      { $$updateListener: new Subject() },
      { $$animationState: this._getAnimationState(config.position) });

    console.warn(newConfig);

    this._addItem(newConfig);
    this._updateContainerState();
  }

  private _hideAlerts(alertsIds: Array<string>) {
    if (!Array.isArray(alertsIds)) { return; }

    if (!alertsIds.length) { return; }

    this.items.left = _.reject(this.items.left, item => {
      return !!~alertsIds.indexOf(item.id);
    });

    this.items.center = _.reject(this.items.center, item => {
      return !!~alertsIds.indexOf(item.id);
    });

    this.items.right = _.reject(this.items.right, item => {
      return !!~alertsIds.indexOf(item.id);
    });
  }

  private _hideAllAlerts() {
    _.forEach(this.items.left, (item) => {
      this.anBus.$$onClose.next(item.id);
    });

    _.forEach(this.items.center, (item) => {
      this.anBus.$$onClose.next(item.id);
    });

    _.forEach(this.items.right, (item) => {
      this.anBus.$$onClose.next(item.id);
    });

    this.items.left = [];
    this.items.center = [];
    this.items.right = [];
  }

  private _notifyUpdateListeners() {
    _.forEach(this.items.left, (item) => {
      item.$$updateListener.next();
    });

    _.forEach(this.items.center, (item) => {
      item.$$updateListener.next();
    });

    _.forEach(this.items.right, (item) => {
      item.$$updateListener.next();
    });
  }

  private _updateBrowserViewports() {
    if (this.globalAlertConfig.removeLastIfViewportOverflow) {
      this.browserViewports = BrowserViewports.getBrowserViewports();

      BrowserViewports.onBrowserViewportsUpdate().subscribe((newBrowserViewports: any) => {
        this.browserViewports = newBrowserViewports;
      });
    }
  }

  private _updateContainerState() {
    this.containerStates.left = !!~this.items.left.length;
    this.containerStates.center = !!~this.items.center.length;
    this.containerStates.right = !!~this.items.right.length;

    this._setContainerDirections();
  }

  private _getShortVerticalPositionIdentifier(item: Alert): string {
    if (!!~item.position.indexOf('Left')) {
      return 'left';
    }

    if (!!~item.position.indexOf('Center')) {
      return 'center';
    }

    if (!!~item.position.indexOf('Right')) {
      return 'right';
    }

    return undefined;
  }

  private _addItem(item: Alert) {
    const pos: string = this._getShortVerticalPositionIdentifier(item);

    this.items[pos].push(item);
  }

  private _removeItem(id: string) {
    const item: Alert = this._findItemById(id);
    const pos: string = this._getShortVerticalPositionIdentifier(item);

    this.items[pos] = _.reject(this.items[pos], { id: item.id });
  }

  private _findItemById(id: string): Alert {
    let foundItem: Alert;

    foundItem = _.find(this.items.left, { id: id });

    if (foundItem) {
      return foundItem;
    }

    foundItem = _.find(this.items.center, { id: id });

    if (foundItem) {
      return foundItem;
    }

    foundItem = _.find(this.items.right, { id: id });

    if (foundItem) {
      return foundItem;
    }

    return undefined;
  }

  private _setContainerDirections() {
    this.containerDirections.reverseLeft = !!~_.filter(this.items.left, (item) => { return !!~item.position.indexOf('bottom'); }).length;
    this.containerDirections.reverseCenter = !!~_.filter(this.items.center, (item) => { return !!~item.position.indexOf('bottom'); }).length;
    this.containerDirections.reverseLeft = !!~_.filter(this.items.right, (item) => { return !!~item.position.indexOf('bottom'); }).length;
  }

  private _getAnimationState(position: string): string {
    if (!_.isString(position)) {
      return undefined;
    }

    return positionToAnimationLink[position];
  }
}
