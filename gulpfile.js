// Node modules
var fs = require('fs'), vm = require('vm'), merge = require('deeply'), chalk = require('chalk'), es = require('event-stream'), browserSync = require('browser-sync');

// Gulp and plugins
var gulp = require('gulp'), rjs = require('gulp-requirejs-bundler'), concat = require('gulp-concat'), clean = require('gulp-clean'),
    replace = require('gulp-replace'), uglify = require('gulp-uglify'), htmlreplace = require('gulp-html-replace'), less = require('gulp-less'), autoprefixer = require('gulp-autoprefixer'), csso = require('gulp-csso');

// Config
var requireJsRuntimeConfig = vm.runInNewContext(fs.readFileSync('src/app/require.config.js') + '; require;');
    requireJsOptimizerConfig = merge(requireJsRuntimeConfig, {
        out: 'scripts.js',
        baseUrl: './src',
        name: 'app/startup',
        paths: {
            requireLib: 'bower_modules/requirejs/require'
        },
        include: [
            'requireLib',
            'components/map/map',
            'components/file-info-view/file',
            'components/auth/auth',
            'components/tooltip/tooltip',
            'components/view-menu/view-menu',
            'components/legal/legal',
            'components/view/view',
            'components/loading/loading',
        ],
        insertRequire: ['app/startup'],
        bundles: {
            // If you want parts of the site to load on demand, remove them from the 'include' list
            // above, and group them into bundles here.

            'editor': [
                'components/editor/editor',
                'components/tree/tree',
                'components/treetools/treetools',
                'components/version-menu/version-menu',
                'components/file-menu/file-menu',
                'components/file-info/file'
            ],

            'forgot-password': [
                'components/modal/modal',
                'components/forgot-password/forgot-password'
            ],

            'sign-in': [
                'components/modal/modal',
                'components/sign-in/sign-in'
            ],

            'sign-up': [
                'components/modal/modal',
                'components/sign-up/sign-up'
            ],

            // 'bundle-name': [ 'some/module', 'another/module' ],
            // 'another-bundle-name': [ 'yet-another-module' ]
        }
    });

// Discovers all AMD dependencies, concatenates together all required .js files, minifies them
gulp.task('js', function () {
    return rjs(requireJsOptimizerConfig)
        .pipe(uglify({ preserveComments: 'some' }))
        .pipe(gulp.dest('./public/'));
});

// Concatenates CSS files, rewrites relative paths to Bootstrap fonts, copies Bootstrap fonts
gulp.task('css', function () {
  return gulp.src('src/less/app.less')
    .pipe(less({
      style: 'expanded',
      loadPath: ['./src/bower_modules/less']
    }))
    .pipe(autoprefixer('last 1 version'))
    .pipe(csso())
    .pipe(gulp.dest('./public/'));
});

gulp.task('less', function() {
  return gulp.src('src/less/app.less')
    .pipe(less({
      style: 'expanded',
      loadPath: ['./src/bower_modules/less']
    }))
    .pipe(autoprefixer('last 1 version'))
    .pipe(csso())
    .pipe(gulp.dest('src'))
    .pipe(browserSync.reload({stream:true}))
});

// Copies index.html, replacing <script> and <link> tags to reference production URLs
gulp.task('html', function() {
    return gulp.src('./src/index.html')
        .pipe(htmlreplace({
            'css': 'app.css',
            'js': 'scripts.js'
        }))
        .pipe(gulp.dest('./public/'));
});

gulp.task('images', function() {
    return gulp.src('./src/images/**/*')
        .pipe(gulp.dest('./public/images/'));
});

gulp.task('fonts', function() {
    return gulp.src('./src/fonts/**/*')
        .pipe(gulp.dest('./public/fonts/'));
});

gulp.task('browser-sync', function() {
    browserSync({
        server: {
            baseDir: "./src"
        }
    });
    gulp.watch('src/**/*.less', ['less']);
    // gulp.watch('app/scripts/**/*.js', ['scripts']);
    // gulp.watch('app/images/**/*', ['images']);
    // gulp.watch('app/templates/**/*.html', ['templates', browserSync.reload]);
});

// Removes all files from ./dist/
gulp.task('clean', function() {
    return gulp.src('./public/*', { read: false })
        .pipe(clean());
});

gulp.task('build', ['clean'], function() {
    gulp.start(['html', 'js', 'css', 'images', 'fonts']);
});

gulp.task('default', function() {
    gulp.start(['less', 'browser-sync']);
});
