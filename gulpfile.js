var gulp =require('gulp');

var plugins =require('gulp-load-plugins')();

// Variables de chemins
var source ='./src';
var destination ='./dist';
gulp.task('css',function(){
    return gulp.src(source +'/assets/css/styles.scss')
        .pipe(plugins.sass())
        .pipe(plugins.csscomb())
        .pipe(plugins.cssbeautify({indent:'  '}))
        .pipe(plugins.autoprefixer())
        .pipe(gulp.dest(destination +'/assets/css/')
        );
});

gulp.task('minify',function(){
    return gulp.src(destination +'/assets/css/*.css')
        .pipe(plugins.csso())
        .pipe(plugins.rename({suffix:'.min'}))
        .pipe(gulp.dest(destination +'/assets/css/')
        );
});

gulp.task('build',['css']);

gulp.task('prod',['build','minify']);

gulp.task('watch',function(){
    gulp.watch(source +'/assets/css/*.sass',['build']);
});

gulp.task('default',['build']);