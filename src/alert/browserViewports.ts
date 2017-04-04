import { Observable } from 'rxjs/Rx';

export class BrowserViewports {
  static getBrowserViewports(): any {
    return {
      innerHeight: window.innerHeight,
      innerWidth: window.innerWidth
    };
  }

  static onBrowserViewportsUpdate() {
    return Observable.fromEvent(window, 'resize')
      .debounceTime(500)
      .map(() => {
        return this.getBrowserViewports();
      });
  }
}
