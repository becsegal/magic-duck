# `ember-cli-typescript-blueprint-polyfill`

This library exports a function that will polyfill the Ember CLI implementation of [TypeScript blueprint functionality](https://github.com/emberjs/rfcs/blob/master/text/0776-typescript-blueprints.md) in Ember apps and addons that are on a version of Ember CLI that does not include support for TypeScript blueprints.

## Usage

For any blueprint that is authored in TypeScript (e.g. whose `files` directory contains .ts files), in the blueprint's `index.js`:

- add `shouldTransformTypeScript: true`,
- require `typescriptBlueprintPolyfill` and call it in the blueprint's `init` method, passing in `this` as the only argument

```js
// my-app/blueprints/foo/index.js
const typescriptBlueprintPolyfill = require('ember-cli-typescript-blueprint-polyfill');

module.exports = {
  shouldTransformTypeScript: true,

  init() {
    this._super && this._super.init.apply(this, arguments);
    typescriptBlueprintPolyfill(this);
  },
};
```
