import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AnAlert } from './alert/alert.component';
import { anAlertItem } from './alert/alertItem.component';
import { AnBusService } from './anBus.service';
import { provideAnDynamicComponentModule } from './alert/dynamicComponentModule.provider';

export * from './alert/alert.component';
export * from './anBus.service';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [
    AnAlert,
    anAlertItem
  ],
  exports: [
    AnAlert
  ]
})
export class AnModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: AnModule,
      providers: [AnBusService, provideAnDynamicComponentModule({})]
    };
  }
}
