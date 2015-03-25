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
            'components/editor/editor',
            'components/map/map',
            'components/tree/tree',
            'components/treetools/treetools',
            'components/file-info/file',
            'components/file-info-view/file',
            'components/modal/modal',
            'components/sign-in/sign-in',
            'components/sign-up/sign-up',
            'components/forgot-password/forgot-password',
            'components/auth/auth',
            'components/tooltip/tooltip',
            'components/view-menu/view-menu',
            'components/file-menu/file-menu',
            'components/version-menu/version-menu',
            'components/legal/legal',
            'components/view/view',
        ],
        insertRequire: ['app/startup'],
        bundles: {
            // If you want parts of the site to load on demand, remove them from the 'include' list
            // above, and group them into bundles here.
            // 'bundle-name': [ 'some/module', 'another/module' ],
            // 'another-bundle-name': [ 'yet-another-module' ]
        }
    });

// Discovers all AMD dependencies, concatenates together all required .js files, minifies them
gulp.task('js', function () {
    return rjs(requireJsOptimizerConfig)
        .pipe(uglify({ preserveComments: 'some' }))
        .pipe(gulp.dest('./dist/'));
});

// Concatenates CSS files, rewrites relative paths to Bootstrap fonts, copies Bootstrap fonts
gulp.task('css', function () {
    var bowerCss = gulp.src('src/bower_modules/components-bootstrap/css/bootstrap.min.css')
            .pipe(replace(/url\((')?\.\.\/fonts\//g, 'url($1fonts/')),
        appCss = gulp.src('src/css/*.css'),
        combinedCss = es.concat(bowerCss, appCss).pipe(concat('css.css')),
        fontFiles = gulp.src('./src/bower_modules/components-bootstrap/fonts/*', { base: './src/bower_modules/components-bootstrap/' });
    return es.concat(combinedCss, fontFiles)
        .pipe(gulp.dest('./dist/'));
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
            'css': 'css.css',
            'js': 'scripts.js'
        }))
        .pipe(gulp.dest('./dist/'));
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
    return gulp.src('./dist/**/*', { read: false })
        .pipe(clean());
});

gulp.task('build', ['clean'], function() {
    gulp.start(['html', 'js', 'css']);
});

gulp.task('default', function() {
    gulp.start(['less', 'browser-sync']);
});
