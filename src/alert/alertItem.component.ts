import {
  Compiler,
  Component,
  ElementRef,
  Input,
  Output,
  EventEmitter,
  OnChanges,
  ViewChild,
  OnDestroy,
  AfterViewInit,
  ViewContainerRef,
  ReflectiveInjector,
  ChangeDetectionStrategy,
  ComponentRef,
  Inject,
  Type,
  NgModule,
  ChangeDetectorRef
} from '@angular/core';
import { Observable } from 'rxjs/Observable';

import { Alert } from './alert.type';
import * as _ from 'lodash';
import { AN_DYNAMIC_COMPONENT_MODULE } from './dynamicComponentModule.provider';
import { AnAlertTypes } from './alertTypes.enum';
import { AnBusService } from '../anBus.service';
import { Notification } from '../native/notification.type';

@Component({
  selector: 'an-alert-item',
  template: `
    <div #container class="anAlertItem__item anHidden" (click)="clickToClose()">

      <div *ngIf="!hasDynamicTemplate" [ngClass]="customContainerClasses">
        <div class="anAlertItem__contentContainer">
          <div class="anAlertItem__content">
            <div class="anAlertItemContent__title">
              {{_options.title}}
            </div>
            <div class="anAlertItemContent__message">
              {{_options.message}}
            </div>
          </div>
          <div class="anAlertItem__closeAction">
            <span class="anAlertItem__closeActionIcon" (click)="close()"></span>
          </div>

        </div>
      </div>

      <template *ngIf="hasDynamicTemplate" #templateContainer></template>

    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class anAlertItem implements OnDestroy, AfterViewInit, OnChanges {
  private _options: Alert;
  private _showDelayTimer: any;
  private _closeTimeoutTimer: any;
  private _dynamicModuleType: any;
  private _dynamicComponentType: any;
  private _dynamicComponent: ComponentRef<any>;

  hasDynamicTemplate: boolean = false;
  customContainerClasses: string = undefined;

  @Input()
  set options(value: Alert) {
    this._options = value;
    console.warn(this._options);
    this._subscribeToUpdateListener();
  }

  get options() {
    return this._options;
  }

  @Output()
  onClose = new EventEmitter<string>();

  @Output()
  onAlertItemUpdates = new EventEmitter<any>();

  @ViewChild('container')
  private _containerElement: ElementRef;

  @ViewChild('templateContainer', { read: ViewContainerRef })
  private _templateContainerRef: ViewContainerRef;

  constructor(
    @Inject(AN_DYNAMIC_COMPONENT_MODULE) private _dynamicModuleMeta: any,
    private _viewContainer: ViewContainerRef,
    private compiler: Compiler,
    private anBusService: AnBusService,
    private changeDetectorRef: ChangeDetectorRef
  ) {
    this.customContainerClasses = anBusService.getGlobalConfigForAlerts().customContainerClasses;
  }

  ngAfterViewInit() {
    this._setDelay(this._options.delay);
  }

  clickToClose() {
    if (this._options.clickToClose) {
      this.close();
    }
  }

  close() {
    this.onClose.emit(this._options.id);
  }

  private _subscribeToUpdateListener() {
    this._options.$$updateListener.subscribe(() => {
      this._setStyles();
    });
  }

  private _setDelay(delay: number) {
    if (delay === 0) {
      this._show();

      return;
    }

    this._showDelayTimer = setTimeout(() => {
      this._show();
    }, delay);
  }

  private _setHideTimeout(time: number) {
    if (time === 0) {
      return;
    }

    this._closeTimeoutTimer = setTimeout(() => {
      this._hide();
    }, time);
  }

  private _show() {
    this._setType();
    this._setStyles();
    this._setHideTimeout(this._options.timeout);
    this._showNativeNotification();
  }

  private _showNativeNotification() {
    if (!this._options.showNotification) {
      return;
    }

    this.anBusService.showNotification(this._options, this._options.showNotificationIfDocumentVisible);
  }

  private _hide() {
    this.close();
  }

  private _setType() {
    // todo: move map to file
    // and use as object not as a Map
    const cssClassMapping = new Map<number, string>();

    cssClassMapping.set(AnAlertTypes.INFO, 'type-info');
    cssClassMapping.set(AnAlertTypes.WARNING, 'type-warning');
    cssClassMapping.set(AnAlertTypes.SUCCESS, 'type-success');
    cssClassMapping.set(AnAlertTypes.ERROR, 'type-error');
    cssClassMapping.set(AnAlertTypes.BLANK, 'type-blank');

    this._containerElement.nativeElement.classList.add('anAlertItem__item--' + cssClassMapping.get(this._options.type));
  }

  private _setStyles() {
    switch (this._options.position) {
      case 'topLeft':
        // this._containerElement.nativeElement.classList.add('anAlertItem__item--fadeInLeftAnimation');

        break;

      case 'topCenter':
        // this._containerElement.nativeElement.classList.add('anAlertItem__item--fadeInDownAnimation', 'anTranslateXCenter');
        this._containerElement.nativeElement.classList.add('anTranslateXCenter');

        break;

      case 'topRight':
        // this._containerElement.nativeElement.classList.add('anAlertItem__item--fadeInRightAnimation');

        break;

      case 'bottomLeft':
        // this._containerElement.nativeElement.classList.add('anAlertItem__item--fadeInLeftAnimation');

        break;

      case 'bottomCenter':
        // this._containerElement.nativeElement.classList.add('anAlertItem__item--fadeInUpAnimation', 'anTranslateXCenter');
        this._containerElement.nativeElement.classList.add('anTranslateXCenter');

        break;

      case 'bottomRight':
        // this._containerElement.nativeElement.classList.add('anAlertItem__item--fadeInRightAnimation');

        break;
    }

    this._containerElement.nativeElement.classList.remove('anHidden');
  }

  private _createDynamicComponent(): Type<any> {
    let componentMetadataParams: Component = {
      selector: 'an-alert-item-custom-template'
    };

    if (typeof this._options.templateUrl === 'string') {
      componentMetadataParams.templateUrl = this._options.templateUrl;
    }

    if (typeof this._options.template === 'string') {
      componentMetadataParams.template = this._options.template;
    }

    const componentMetadata = new Component(componentMetadataParams);

    const cmpClass = class _ {};

    return Component(componentMetadata)(cmpClass);
  }

  private _createDynamicModule(componentType: Type<any>) {
    const declarations = this._dynamicModuleMeta.declarations || [];

    declarations.push(componentType);

    const moduleMeta: NgModule = {
      imports: this._dynamicModuleMeta.imports,
      providers: this._dynamicModuleMeta.providers,
      schemas: this._dynamicModuleMeta.schemas,
      declarations: declarations
    };

    return NgModule(moduleMeta)(class _ {});
  }

  private _insertDynamicComponent() {
    this._dynamicComponentType = this._createDynamicComponent();
    this._dynamicModuleType = this._createDynamicModule(this._dynamicComponentType);
    const injector = ReflectiveInjector.fromResolvedProviders([], this._viewContainer.parentInjector);

    this.compiler.compileModuleAndAllComponentsAsync<any>(this._dynamicModuleType)
      .then(factory => {
        let dynamicComponentFactory: any;
        let i: number;

        for (i = factory.componentFactories.length - 1; i >= 0; i--) {
          if (factory.componentFactories[i].componentType === this._dynamicComponentType) {
            dynamicComponentFactory = factory.componentFactories[i];

            break;
          }
        }

        return dynamicComponentFactory;
      })
      .then(dynamicComponentFactory => {
        if (dynamicComponentFactory) {
          this._templateContainerRef.clear();

          this._dynamicComponent = this._templateContainerRef.createComponent(dynamicComponentFactory, 0, injector);

          _.merge(this._dynamicComponent.instance, this);

          this._dynamicComponent.changeDetectorRef.detectChanges();
        }
      });
  }

  ngOnChanges() {
    if (typeof this._options.template === 'string' ||
        typeof this._options.templateUrl === 'string') {
      this.hasDynamicTemplate = true;

      this._insertDynamicComponent();
    }
  }

  ngOnDestroy() {
    // todo: unsub here
    // this._options.$$updateListener.unsubscribe();

    if (this._closeTimeoutTimer) {
      clearTimeout(this._closeTimeoutTimer);
    }

    if (this._dynamicComponent) {
      this._dynamicComponent.destroy();
    }

    if (this.compiler) {
      if (this._dynamicComponentType) {
        this.compiler.clearCacheFor(this._dynamicComponentType);
      }

      if (this._dynamicModuleType) {
        this.compiler.clearCacheFor(this._dynamicModuleType);
      }
    }
  }
}
