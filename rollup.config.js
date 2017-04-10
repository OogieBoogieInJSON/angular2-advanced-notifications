export default {
    entry: './dist/modules/angular2-advanced-notifications.es5.js',
    dest: './dist/bundles/angular2-advanced-notifications.umd.js',
    format: 'umd',
    exports: 'named',
    moduleName: 'ng.angular2AdvancedNotifications',
    external: [
        '@angular/core',
        '@angular/common',
        'rxjs/Observable',
        'rxjs/Observer',
        'lodash'
    ],
    globals: {
        '@angular/core': 'ng.core',
        '@angular/common': 'ng.common',
        'rxjs/Observable': 'Rx',
        'rxjs/Observer': 'Rx',
        'lodash': '_'
    },
    onwarn: () => { return }
}
