// SVD Task config
// Author: Alberto Córcoles
//---------------------------------------------
// Pollyfill
// Requires
// Settings
// Server tasks
// Styles tasks
// Script tasks
// Package task and production
// Global task

// Pollyfill
//---------------------------------------------
// Important pollyfil to run gulp-uglify
var Promise = require('es6-promise').Promise;

// Requires
//---------------------------------------------
var gulp        = require('gulp'),
    browserSync = require('browser-sync').create(),
    gulpif 		= require('gulp-if'),
    gutil 		= require('gulp-util'),
    pump 		= require('pump'),
    sass        = require('gulp-sass'),
    autoprefix  = require('gulp-autoprefixer'),
    rename      = require('gulp-rename'),
    cssnano     = require('gulp-cssnano'),
    sourcemaps  = require('gulp-sourcemaps'),
    sassLint    = require('gulp-sass-lint'),
    uglify      = require('gulp-uglify'),
    pump        = require('pump'),
    concat      = require('gulp-concat'),
    argv 		= require('yargs').argv,
    zip         = require('gulp-zip'),
    gcmq        = require('gulp-group-css-media-queries'),    
    reload      = browserSync.reload;

// Settings
//---------------------------------------------
// Get the sass lint options from a json file
var scssLintOptions = require('./sass-lint.json');
var pakageJSON = require('./package.json');
// Get json config gulp file
var paths = require('./config-gulp.json');



// Server tasks
//---------------------------------------------
gulp.task('serve', ['sass'], function() {
    browserSync.init({
        server: {
            baseDir: './src/'
        }
        // proxy: "localhost:8080/your_folder_site/",
        // port: 8080
    });

    gulp.watch("./src/scss/*/**.scss", ['sass']).on('change', browserSync.reload);
    gulp.watch("./src/js/*.js", ['jsc']).on('change', browserSync.reload);
    gulp.watch("./src/js/*/**.js", ['jsc']).on('change', browserSync.reload);
    gulp.watch("./*/**.php, ./*/**.html").on('change', browserSync.reload);
});

// Styles tasks
//---------------------------------------------
// Compile sass into CSS & auto-inject into browsers

gulp.task('sass', ['sass-lint'], function(){
    return gulp.src('./src/scss/*.scss')
        .pipe(sourcemaps.init())
        .pipe(sass())
        .pipe(autoprefix('last 2 versions'))
        .pipe(gcmq())
        .pipe(gulpif(argv.dev, sourcemaps.write()))      
        .pipe(gulp.dest('./dist/css/'))
        .pipe(gulpif(argv.prod, cssnano()))
        .pipe(gulpif(argv.prod, rename({suffix:'.min'})))
        .pipe(gulp.dest('./dist/css/'))
});  
  

// Check sass to find syntax errors or warnings.
// https://github.com/sasstools/sass-lint
gulp.task('sass-lint', function() {	
    return gulp.src(['./src/scss/*/**.scss'])
      .pipe(gulpif(argv.dev, sassLint(scssLintOptions)))
      .pipe(gulpif(argv.dev, sassLint.format()))
      .pipe(gulpif(argv.dev, sassLint.failOnError()))
  });

// Script tasks
//---------------------------------------------
// Concat all js files
gulp.task('jsc', function () {
    Object.keys(paths).forEach(val => {
        return gulp.src(paths[val].js.orig)
            .pipe(concat(paths[val].js.name))
            .pipe(gulp.dest(paths[val].js.dest))
            .pipe(gulpif(argv.prod, uglify()))
            .pipe(gulpif(argv.prod, rename({suffix:'.min'})))
            .pipe(gulpif(argv.prod, gulp.dest(paths[val].js.dest)))
    });
}); 

// Package task and production
//---------------------------------------------
gulp.task('zip:dev', () =>
  gulp.src('./src/*')
      .pipe(zip(pakageJSON.name + '_' + pakageJSON.version + '.zip'))
      .pipe(gulp.dest('zips'))
);

gulp.task('zip:prod', () =>
  gulp.src('www/*')
      .pipe(zip(pakageJSON.name + '_' + pakageJSON.version + '.zip'))
      .pipe(gulp.dest('zips'))
);

gulp.task('zip:assets', () =>
  gulp.src('assets/*')
      .pipe(zip(pakageJSON.name + '_' + pakageJSON.version + '.zip'))
      .pipe(gulp.dest('zips'))
);

// Distribution site task
//---------------------------------------------
// Execute only to send project to server

gulp.task('dist', function(){
    return gulp.src([
        './**', 
        '!./{node_modules,node_modules/**}',
        '!./{www, www/**}',
        '!./{packages, packages/**}'
    ])
    .pipe(gulp.dest('./www/'))       
});

// Global tasks
//---------------------------------------------
gulp.task('start', ['sass','jsc','serve']);
