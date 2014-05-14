var lib = require('../../lib'),
  config = require('./config'),
  mgr = require('./snapshotmgr'),
  fs = require('fs'),
  exec = require('execSync').exec,
  path = require('path'),
  _ = require('lodash');

/**
 * Backup an existing database.
 */
_.extend(exports, lib.task, /** @exports backup */ {

  options: {
    dbname: {
      optional: '[dbname]',
      description: 'Name of database to operate on'
    }
  },

  /** @override */
  beforeInstall: function (options) {
    options.pg.dbname || (options.pg.dbname = options.xt.name + '_main');
  },

  /** @override */
  beforeTask: function (options) {
    config.discoverCluster(options);
  },

  /** @override */
  executeTask: function (options) {
    // dump globals
    lib.pgCli.dumpall(_.extend({
      snapshotpath: mgr.getSnapshotPath(_.extend({ dbname: 'globals' }, options)),
    }, options));
    
    // dump data
    lib.pgCli.dump(_.extend({
      snapshotpath: mgr.getSnapshotPath(options),
      dbname: options.pg.dbname
    }, options));
  },

  /** @override */
  afterTask: function (options) {
    console.log('Database backed up to: ', options.pg.snapshotdir);
  }
});

