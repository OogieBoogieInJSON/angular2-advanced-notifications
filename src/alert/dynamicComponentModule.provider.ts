import { OpaqueToken, NgModule } from '@angular/core';

export const AN_DYNAMIC_COMPONENT_MODULE = new OpaqueToken('AN_DYNAMIC_COMPONENT_MODULE');

export function provideAnDynamicComponentModule(metadata: NgModule): Array<any> {
  return [ { provide: AN_DYNAMIC_COMPONENT_MODULE, useValue: metadata } ];
}
