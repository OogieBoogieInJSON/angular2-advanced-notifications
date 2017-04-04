import { Component } from '@angular/core';
import { AnBusService } from 'angular2-advanced-notifications';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  constructor(private anBusService: AnBusService) {
    console.warn(anBusService);
  }

  ngAfterViewInit() {
    this.anBusService.showAlert({
      title: 'adasd',
      message: 'asdasdads'
    });
  }
  title = 'app works!';
}
