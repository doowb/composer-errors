'use strict';

var assert = require('assert');
var async = require('async');
var Composer = require('composer');
var capture = require('capture-stream');
var errors = require('./');

var composer;

describe('composer-errors', function () {
  beforeEach(function () {
    composer = new Composer();
  });

  it('should add listeners to composer', function (done) {
    var restore = capture(process.stderr);
    errors()(composer);
    composer.on('starting', function () {
      process.stderr.write('starting\n');
    });
    composer.on('finished', function () {
      process.stderr.write('finished\n');
    });
    var count = 0;
    composer.task('test', function (cb) {
      count++;
      cb();
    });
    composer.run('test', function (err) {
      var output = restore();
      if (err) return done(err);
      try {
        assert.equal(count, 1);
        assert.equal(output.length, 2);
        assert.notEqual(output[0][0].indexOf('starting'), -1);
        assert.notEqual(output[1][0].indexOf('finished'), -1);
      } catch (err) {
        return done(err);
      }
      done();
    });
  });

  it('should output messages without colors', function (done) {
    var restore = capture(process.stderr);
    errors({colors: false})(composer);
    composer.on('starting', function () {
      process.stderr.write('starting\n');
    });
    composer.on('finished', function () {
      process.stderr.write('finished\n');
    });
    var count = 0;
    composer.task('test', function (cb) {
      count++;
      cb();
    });
    composer.run('test', function (err) {
      var output = restore();
      if (err) return done(err);
      try {
        assert.equal(count, 1);
        assert.equal(output.length, 2);
        assert.notEqual(output[0][0].indexOf('starting'), -1);
        assert.notEqual(output[1][0].indexOf('finished'), -1);
        assert.equal(output[0][0].indexOf('\u001b'), -1);
        assert.equal(output[1][0].indexOf('\u001b'), -1);
      } catch (err) {
        return done(err);
      }
      done();
    });
  });

  it('should output messages to another stream', function (done) {
    var restore = capture(process.stdout);
    errors({stream: process.stdout})(composer);
    composer.on('starting', function () {
      process.stdout.write('starting\n');
    });
    composer.on('finished', function () {
      process.stdout.write('finished\n');
    });
    var count = 0;
    composer.task('test', function (cb) {
      count++;
      cb();
    });
    composer.run('test', function (err) {
      var output = restore();
      if (err) return done(err);
      try {
        assert.equal(count, 1);
        assert.equal(output.length, 2);
        assert.notEqual(output[0][0].indexOf('starting'), -1);
        assert.notEqual(output[1][0].indexOf('finished'), -1);
      } catch (err) {
        return done(err);
      }
      done();
    });
  });

  it('should listen for errors on tasks', function (done) {
    var restore = capture(process.stderr);
    errors({colors: false})(composer);

    // see composer-runtimes for starting/finished messages
    composer.on('starting', function () {
      process.stderr.write('starting\n');
    });
    composer.on('finished', function () {
      process.stderr.write('finished\n');
    });

    composer.task('test', function (cb) {
      cb(new Error('this is an error'));
    });

    composer.run('test', function (err) {
      var output = restore();
      try {
        assert.equal(output.length, 2);
        assert.notEqual(output[0][0].indexOf('starting'), -1);
        assert.equal(output[1][0].indexOf('finished'), -1);
        assert.notEqual(output[1][0].indexOf('ERROR'), -1);
      } catch (err) {
        return done(err);
      }
      if (err) return done();
      done(new Error('Expected an error'));
    });
  });

  it('should show error when task is undefined', function () {
    var restore = capture(process.stderr);
    errors()(composer);

    // see composer-runtimes for starting/finished messages
    composer.on('starting', function () {
      process.stderr.write('starting\n');
    });
    composer.on('finished', function () {
      process.stderr.write('finished\n');
    });

    composer.emit('error', new Error('this is an error without a task'));
    var output = restore();
    assert.equal(output.length, 1);
    assert.notEqual(output[0][0].indexOf('ERROR'), -1);
  });

  it('should make output look nice [formatting only test]', function (done) {
    errors()(composer);
    var len = 10, i = 0;
    var tasks = [];
    while (len--) {
      var key = 'task-' + (i++);
      composer.task(key, function (cb) {cb(new Error(key + ' error messages'));});
      tasks.push(function (next) {
        composer.run(key, function (err) {
          if (!err) return next(new Error('Expected an error'));
          next();
        });
      });
    }
    async.series(tasks, done);
  });
});
