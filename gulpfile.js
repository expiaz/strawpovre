var gulp =require('gulp');
const browserify = require('browserify');
const babelify = require('babelify');
const buffer = require('vinyl-buffer');
const source = require('vinyl-source-stream');

var plugins =require('gulp-load-plugins')();

// Variables de chemins
var src ='./src';
var destination ='./public';
gulp.task('css',function(){
    return gulp.src(src +'/frontend/scss/*.scss')
        .pipe(plugins.sass())
        .pipe(plugins.csscomb())
        .pipe(plugins.autoprefixer())
        .pipe(gulp.dest(destination +'/assets/css/')
        );
});

gulp.task('js', function() {
    const b = browserify({
        entries: src + '/frontend/js/app.js',
        transform: babelify,
        debug: true
    });

    return b.bundle()
        .pipe(source('bundle.js'))
        .pipe(buffer())
        .pipe(plugins.sourcemaps.init({loadMaps: true}))
        .pipe(plugins.concat("bundle.js"))
        .pipe(plugins.sourcemaps.write("."))
        .pipe(gulp.dest(destination +'/assets/js/'));
});

gulp.task('minify',function(){
    return gulp.src(destination +'/assets/css/*.css')
        .pipe(plugins.csso())
        .pipe(plugins.rename({suffix:'.min'}))
        .pipe(gulp.dest(destination +'/assets/css/')
        );
});

gulp.task('build',['css', 'js']);

gulp.task('prod',['build','minify']);

gulp.task('watch',function(){
    gulp.watch(src +'/assets/css/*.sass',['build']);
});

gulp.task('default',['build']);