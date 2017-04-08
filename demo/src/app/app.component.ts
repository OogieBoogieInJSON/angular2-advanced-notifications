import { Component } from '@angular/core';
import { AnBusService } from 'angular2-advanced-notifications';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  constructor(private anBusService: AnBusService) {
  }

  ngAfterViewInit() {

  }
  title = 'app works!';
  show() {
    console.warn('yolo');
    this.anBusService.showAlert({
      title: 'adasd',
      message: 'asdasdads'
    });
  }
}
