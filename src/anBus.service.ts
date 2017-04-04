import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs';
import { Alert } from './alert/alert.type';
import { GlobalAlertConfig } from './alert/globalAlertConfig.type';
import defaultGlobaAlertConfig from './alert/defaultGlobalAlertConfig';
import * as _ from 'lodash';
import { AnAlertTypes } from './alert/alertTypes.enum';
import { Notification } from './native/notification.type';

import { AnUtils } from './utils';

@Injectable()
export class AnBusService {
  private globalAlertConfig: GlobalAlertConfig = defaultGlobaAlertConfig;

  private showAlertSource = new Subject<Alert>();
  private hideAlertSource = new Subject<string>();
  private hideAlertsSource = new Subject();
  private hideAllAlertsSource = new Subject();

  private showNotificationSource = new Subject<Notification>();

  private notificationApiPermissions = {
    GRANTED: 'granted',
    DENIED: 'denied',
    DEFAULT: 'default'
  };
  private documentVisibilityStates = {
    VISIBLE: 'visible',
    HIDDEN: 'hidden'
  };

  $$onClose = new Subject<string>();

  showAlert$ = this.showAlertSource;
  hideAlert$ = this.hideAlertSource;
  hideAlerts$ = this.hideAlertsSource;
  hideAllAlerts$ = this.hideAllAlertsSource;
  onClose$ = this.$$onClose;

  alertTypes = AnAlertTypes;

  setGlobalConfigForAlerts(config: GlobalAlertConfig) {
    if (!_.isObject(config)) {
      // todo: add log

      return;
    }

    this.globalAlertConfig = _.merge(defaultGlobaAlertConfig, config);
  }

  getGlobalConfigForAlerts(): GlobalAlertConfig {
    return this.globalAlertConfig;
  }

  showAlert(config: Alert) {
    let newConfig = _.merge(config, { id: AnUtils.generateGuid() });

    this.showAlertSource.next(newConfig);

    return {
      id: newConfig.id,
      hide: () => { this._hideAlert(newConfig.id) }
    };
  }

  hideAlerts(alertsIds?: Array<string>) {
    this.hideAlertsSource.next(alertsIds);
  }

  hideAllAlerts() {
    this.hideAllAlertsSource.next(null);
  }

  requestNotificationPermission(): Promise<boolean> {
    if (!_.isFunction((<any>window).Notification)) {
      return new Promise<boolean>(resolve => {
        resolve(false);
      });
    }

    if ((<any>window).Notification.permission === this.notificationApiPermissions.GRANTED) {
      return new Promise<boolean>(resolve => {
        resolve(true);
      });
    }

    if ((<any>window).Notification.permission === this.notificationApiPermissions.DEFAULT) {
        return new Promise<boolean>(resolve => {
          (<any>window).Notification.requestPermission((permission: string) => {
            resolve(permission === this.notificationApiPermissions.GRANTED);
          });
        });
    }

    if ((<any>window).Notification.permission === this.notificationApiPermissions.DENIED) {
      return new Promise<boolean>(resolve => {
        resolve(false);
      });
    }

    return new Promise<boolean>(resolve => {
      resolve(false);
    });
  }

  showNotification(options: Notification, showIfDocumentVisible?: boolean): Promise<Notification> {
    return new Promise<Notification>(resolve => {
      this.requestNotificationPermission().then(result => {
        if (!result) {
          return;
        }

        resolve(this._createNativeNotification(options, showIfDocumentVisible));
      });
    });
  }

  private _createNativeNotification(options: Notification, showIfDocumentVisible?: boolean): Notification {
    if (!_.isObject(options)) {
      return undefined;
    }

    if (showIfDocumentVisible && document.visibilityState !== this.documentVisibilityStates.VISIBLE) {
      return undefined;
    }

    if (!showIfDocumentVisible && document.visibilityState === this.documentVisibilityStates.VISIBLE) {
      return undefined;
    }

    let notificationInstance: Notification = new (<any>window).Notification(options.title, options);

    notificationInstance.onclick = options.onclick;
    notificationInstance.onerror = options.onerror;

    return notificationInstance;
  }

  private _hideAlert(id: string) {
    this.hideAlertSource.next(id);
  }
}
