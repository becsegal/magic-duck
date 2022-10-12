'use strict';

module.exports = {
  name: require('./package').name,

  treeForAddon(tree) {
    if (this.isDevelopingAddon()) {
      const {
        BroccoliBabelPresetTypeScript,
      } = require('broccoli-babel-preset-typescript'); // eslint-disable-line node/no-unpublished-require
      return this._super.treeForAddon.call(
        this,
        new BroccoliBabelPresetTypeScript([tree])
      );
    } else {
      return this._super.treeForAddon.call(this, tree);
    }
  },
};
