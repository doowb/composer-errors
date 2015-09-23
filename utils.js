/*!
 * composer-errors <https://github.com/doowb/composer-errors>
 *
 * Copyright (c) 2015, Brian Woodward.
 * Licensed under the MIT License.
 */

'use strict';

var lazy = require('lazy-cache')(require);
lazy('ansi-red', 'red');
lazy('ansi-grey', 'grey');
lazy('ansi-cyan', 'cyan');
lazy('time-stamp', 'time');
lazy('extend-shallow', 'extend');
lazy('error-symbol', 'error');
module.exports = lazy;

