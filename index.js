/*!
 * composer-errors <https://github.com/doowb/composer-errors>
 *
 * Copyright (c) 2015, Brian Woodward.
 * Licensed under the MIT License.
 */

'use strict';

var utils = require('./utils');

/**
 * Listen to composer error events and output information.
 *
 * ```js
 * errors({colors: false})(composer);
 * ```
 *
 * @param  {Object} `options` Options to specify color output and stream to write to.
 * @param  {Boolean} `options.colors` Show ansi colors or not. `true` by default
 * @param  {Stream} `options.stream` Output stream to write to. `process.stderr` by default.
 * @api public
 */

function errors (options) {
  options = options || {};

  return function plugin (app) {
    if (app.composerErrors) {
      return;
    }
    app.composerErrors = true;
    var opts = utils.extend({}, options, app.options && app.options.composerErrors);

    if (typeof opts.colors === 'undefined') {
      opts.colors = true;
    }

    // use the stderr stream by default so other output
    // can be piped into a file with `> file.txt`
    var stream = opts.stream || process.stderr;
    var log = write(stream);
    var time = utils.time.bind(utils.time, 'HH:mm:ss.ms');

    // setup an error listener
    app.on('error', function (err, task, run) {
      var name, timing;
      if (opts.colors) {
        name = (task && task.name) ? utils.cyan('[' + task.name + ']') : '';
        timing = (run && run.end) ? utils.grey(time(run.end)) : '';
        log('', utils.red(utils.error), '', timing, utils.red('ERROR'), name, err, '\n');
      } else {
        name = (task && task.name) ? '[' + task.name + ']' : '';
        timing = (run && run.end) ? time(run.end) : '';
        log('', utils.error, '', timing, 'ERROR', name, err, '\n');
      }
    });

  };
};

function write(stream) {
  return function () {
    var len = arguments.length, i = 0;
    var args = new Array(len);
    while (len--) {
      args[i] = arguments[i++];
    }
    stream.write(args.join(' '));
  };
}

/**
 * Exposes `errors`
 */

module.exports = errors;
