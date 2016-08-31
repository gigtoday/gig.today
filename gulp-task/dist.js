'use strict';

let babelify = require('babelify'),
    browserify = require('browserify'),
    cleanCss = require('gulp-clean-css'),
    concat = require('gulp-concat'),
    concatJson = require('gulp-concat-json'),
    fs = require('fs'),
    gulp = require('gulp'),
    jade = require('gulp-jade'),
    minifyHtml = require('gulp-html-minifier'),
    rename = require('gulp-rename'),
    runSequence = require('run-sequence'),
    sass = require('gulp-sass'),
    source = require('vinyl-source-stream'),
    sourcemaps = require('gulp-sourcemaps'),
    util = require('./util.js');

gulp.task('dist', function() {
    runSequence('dist-client-js', 'dist-css', 'dist-html', function() {
        gulp.src(CONFIG.deploy.path.font).pipe(gulp.dest(util.dist('assets/font')));
        gulp.src(CONFIG.deploy.path.img).pipe(gulp.dest(util.dist('assets/image')));

        fs.writeFile(util.dist('CNAME'), CONFIG.deploy.cname, {
            encoding: 'utf-8',
            flag: 'w'
        });
    });
});

gulp.task('dist-client-js', function() {
    browserify({
            entries: './client/js/app.js',
            debug: true
        })
        .transform(babelify)
        .bundle()
        .pipe(source('app.js'))
        .pipe(gulp.dest(util.dist('assets')));
});

gulp.task('dist-css', function() {
    gulp.src(CONFIG.deploy.path.scss)
        .pipe(sourcemaps.init({
            loadMaps: false
        }))
        .pipe(sass({
            outputStyle: 'compressed'
        }).on('error', sass.logError))
        .pipe(concat('main.css'))
        .pipe(sourcemaps.write())
        .pipe(cleanCss({
            compatibility: 'ie8'
        }))
        .pipe(rename({
            extname: '.min.css'
        }))
        .pipe(gulp.dest(util.dist('assets/css')));
});

gulp.task('dist-html', function() {
    CONFIG.assetPath = util.publishPath() + 'assets/';
    CONFIG.baseUrl = util.publishPath();

    gulp.src('./resource/view/index.jade')
        .pipe(jade({
            locals: {
                config: CONFIG
            }
        }))
        .pipe(minifyHtml({
            collapseWhitespace: true
        }))
        .pipe(rename('index.html'))
        .pipe(gulp.dest(util.dist()));
});
