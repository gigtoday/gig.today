'use strict';

let ghPages = require('gulp-gh-pages'),
    gulp = require('gulp'),
    runSequence = require('run-sequence'),
    util = require('./util.js');

// Build then deploy to GitHub pages gh-pages branch
gulp.task('build-deploy-gh-pages', function(callback) {
    runSequence('dist', 'deploy-gh-pages', callback);
});

// Deploy to GitHub pages gh-pages branch
gulp.task('deploy-gh-pages', function() {
    return gulp.src(util.dist('**/*')).pipe(
        ghPages({
            remoteUrl: PACKAGE.repository.url,
            silent: false,
            branch: 'gh-pages'
        }));
});
