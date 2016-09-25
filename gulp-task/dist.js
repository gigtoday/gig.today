'use strict';

let babelify = require('babelify'),
    browserify = require('browserify'),
    cleanCss = require('gulp-clean-css'),
    concat = require('gulp-concat'),
    concatJson = require('gulp-concat-json'),
    dist = require('./util.js').dist,
    fs = require('fs'),
    gulp = require('gulp'),
    jade = require('gulp-jade'),
    locations = require('../config/songkick_location_mapping.json'),
    minifyHtml = require('gulp-html-minifier'),
    publishPath = require('./util.js').publishPath,
    rename = require('gulp-rename'),
    runSequence = require('run-sequence'),
    sass = require('gulp-sass'),
    source = require('vinyl-source-stream'),
    sourcemaps = require('gulp-sourcemaps'),
    Songkick = new require('songkick')(process.env.SONGKICK_API_KEY),
    util = require('util');

gulp.task('dist', function() {
    runSequence('dist-client-js', 'dist-css', 'dist-html', function() {
        gulp.src(CONFIG.deploy.path.font).pipe(gulp.dest(dist('assets/font')));
        gulp.src(CONFIG.deploy.path.img).pipe(gulp.dest(dist('assets/image')));

        // fs.writeFile(dist('CNAME'), CONFIG.deploy.cname, {
        //     encoding: 'utf-8',
        //     flag: 'w'
        // });
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
        .pipe(gulp.dest(dist('assets')));
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
        .pipe(gulp.dest(dist('assets/css')));
});

gulp.task('dist-html', function() {
    CONFIG.assetPath = publishPath() + 'assets/';
    CONFIG.baseUrl = publishPath();

    // Create home page
    gulp.src('./resource/view/index.jade')
        .pipe(jade({
            locals: {
                config    : CONFIG,
                locations : locations,
                meta      : {
                    title       : CONFIG.name,
                    description : CONFIG.description
                }
            }
        }))
        .pipe(minifyHtml({
            collapseWhitespace: true
        }))
        .pipe(rename('index.html'))
        .pipe(gulp.dest(dist()));

    locations.forEach(function(location, key) {
        const now     = new Date(),
              minDate = now.toISOString().split('T')[0],
              maxDate = new Date(util.format(
                  '%s-%s-%s',
                  now.getUTCFullYear(),
                  now.getUTCMonth() + 1,
                  now.getUTCDate() + 1
              )).toISOString().split('T')[0];

      Songkick.findEvents(
            util.format('sk:%s', location.id),
            { minDate: minDate, maxDate: maxDate }
      ).then(JSON.parse).then(function(res) {

          locations[key].hasEvents = 0 < res.resultsPage.totalEntries
            ? true
            : false;

          gulp.src('./resource/view/location.jade')
          .pipe(jade({
              locals: {
                  config   : CONFIG,
                  location : location,
                  events   : {
                      total   : res.resultsPage.totalEntries,
                      results : res.resultsPage.results.event
                  },
                  meta      : {
                      title       : util.format(
                          '%s events today',
                          location.name
                      ),
                      description : util.format(
                          'Who\'s playing today in %s? Find the very best live music and recommended gigs tonight in %s.',
                          location.name,
                          location.name
                      )
                  }
              }
          }))
          .pipe(minifyHtml({
              collapseWhitespace: true
          }))
          .pipe(
              rename(util.format('/%s/index.html', location.slug))
          )
          .pipe(gulp.dest(dist()));
        });
    })
});
