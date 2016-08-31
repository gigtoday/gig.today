'use strict';

let browserSync = require('browser-sync').create(),
    gulp = require('gulp'),
    reload = browserSync.reload,
    requireDir = require('require-dir'),
    tasks = requireDir('./gulp-task'),
    util = require('./gulp-task/util.js');

gulp.task('default', ['dist', 'watch']);

gulp.task('watch', ['dist'], function() {
    browserSync.init({
        server: {
            baseDir: util.dist(
                util.publishPath()
            )
        }
    });

    gulp.watch(CONFIG.deploy.path.js, ['dist-client-js']).on('change', reload);
    gulp.watch(CONFIG.deploy.path.scss, ['dist-css']).on('change', reload);
    gulp.watch(CONFIG.deploy.path.template, ['dist-html']).on('change', reload);
});
