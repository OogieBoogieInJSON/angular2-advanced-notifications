import { Subject } from 'rxjs/Subject';
import { Notification } from '../native/notification.type';

export interface Alert extends Notification {
  $$updateListener?: Subject<any>;
  $$positionInStack?: number;
  $$elementHeight?: ClientRect;
  $$previousElementClientRect?: ClientRect;
  $$animationState?: string;

  id?: string;
  title?: string;
  message: string;
  position?: string;
  clickToClose?: boolean;
  pauseOnHover?: boolean;
  showProgressBar?: boolean;
  delay?: number;
  timeout?: number;
  template?: string;
  templateUrl?: string;
  type?: number;
  showNotification?: boolean;
  showNotificationIfDocumentVisible?: boolean;

  onClose?(): Object;
}
