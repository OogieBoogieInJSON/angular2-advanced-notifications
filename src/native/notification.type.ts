export interface Notification {
  title?: string;
  body?: string;
  dir?: string;
  lang?: string;
  badge?: string;
  tag?: string;
  icon?: string;
  image?: string;
  data?: any;
  vibrate?: number|number[];
  renotify?: boolean;

  close?(): void;
  onclick?(): any;
  onerror?(): any;
}
