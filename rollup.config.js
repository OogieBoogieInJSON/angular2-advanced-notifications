export default {
    entry: './dist/index.js',
    dest: './dist/bundles/angular2-advanced-notifications.umd.js',
    format: 'umd',
    // Global namespace.
    moduleName: 'ng.angular2-advanced-notifications',
    // External libraries.
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
