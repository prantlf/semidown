# Changes

## [4.1.1](https://github.com/prantlf/semidown/compare/v4.1.0...v4.1.1) (2026-01-05)

### Bug Fixes

* Fix buffering of fenced blocks ([bd62d88](https://github.com/prantlf/semidown/commit/bd62d88eb7d74ff9250fbde8e9a02a743abdcdce))

## [4.1.0](https://github.com/prantlf/semidown/compare/v4.0.0...v4.1.0) (2025-12-30)

### Features

* Trigger process-update and process-block once async parsing and rendering is done ([ba81680](https://github.com/prantlf/semidown/commit/ba8168099624e92c0b7dd2419736b0b8964b6789))

### Bug Fixes

* Remove unneeded async from onBlockEnd ([399ad65](https://github.com/prantlf/semidown/commit/399ad651eb24a96ac02686641f5db51ee44cb2bc))

## [4.0.0](https://github.com/prantlf/semidown/compare/v3.0.0...v4.0.0) (2025-12-29)

### Chores

* Require ES2024 target ([5675dc2](https://github.com/prantlf/semidown/commit/5675dc240ef1d6175636d505fa7d0d0578dddb39))

### BREAKING CHANGES

Technically, there might be some difference, but this is
unlikely to break abnything in the real-world code.

## [3.0.0](https://github.com/prantlf/semidown/compare/v2.1.0...v3.0.0) (2025-12-29)

### Features

* Trigger process-end once async parsing and rendering is done ([0bcace9](https://github.com/prantlf/semidown/commit/0bcace9f3bb39a0e1abec055701f7459fb98caa6))

### BREAKING CHANGES

The TS type Listener was renamed to ChunkerListener.
This is unlikely to break anything in the real-world applications.

## [2.1.0](https://github.com/prantlf/semidown/compare/v2.0.0...v2.1.0) (2025-12-22)

### Features

* Let inherited chunkers and renderers override original functionality ([1ac1c69](https://github.com/prantlf/semidown/commit/1ac1c6991c143469badcef324f1d04ca3ecaacd8))

## [2.0.0](https://github.com/prantlf/semidown/compare/v1.0.0...v2.0.0) (2025-12-21)

### Features

* Upgrade dependencies ([a48aae6](https://github.com/prantlf/semidown/commit/a48aae698b4a9dae25e3605bde08a03a1cf4d3fb))

### Bug Fixes

* Do not split fenced blocks by empty lines ([eddc48e](https://github.com/prantlf/semidown/commit/eddc48e6d1389f27e4246359d8c186498eda7e0a))

### BREAKING CHANGES

This doesn't effect the usual usage of the `Semidown` class - updating the container element with HTML markup rendered from a Markdown stream. However, the interface of the inner objects was updated. The parser returns only `html`, not `isComplete` any more.  The chunker adds `isComplete` to `block-update` and `block-end` event payloads. The renderer accept `isComplete` in both `updateBlock` and `finalizeBlock` methods.` Also, processing of fenced blocks changed - they're constantly re-parsed and re-rendered until the closing fence is detected. Although not a change on the API, the change of behaviour can be considered breaking too.

## [1.0.0](https://github.com/prantlf/semidown/compare/v0.0.3...v1.0.0) (2025-12-05)

### Features

* Allow using `semidown` without the bundled `marked` and `shiki`. ([dad8cc3](https://github.com/prantlf/semidown/commit/dad8cc31e57b766c2dd77703235f68ec1953648e))

### BREAKING CHANGES

There's no breaking change for people, who import `Semidown` using the NPM package name: `import { Semidown } from `semidown`. However, the physical name of the UMD bundle in the `dist` directory has changed:
* `semidown.js` --> `index.js`
* `semidown.umd.cjs` --> `index.umd.js`

## 0.0.3 (2025-06-09)

Update

## 0.0.2 (2025-06-09)

Initial release
