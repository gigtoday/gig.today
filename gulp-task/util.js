'use strict';

let argv = require('yargs').argv,
    path = require('path');

global.CONFIG = require('./../config/app.json');
global.PACKAGE = require('./../package.json');

module.exports = {
    dist: function(subpath) {
        return !subpath ? CONFIG.deploy.dir : path.join(CONFIG.deploy.dir, subpath);
    },
    publishPath: function() {
        return CONFIG.deploy.baseUrl[argv.baseUrl] !== undefined ? CONFIG.deploy.baseUrl[argv.baseUrl] : CONFIG.deploy.baseUrl.local
    }
};
