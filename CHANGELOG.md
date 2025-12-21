# Changes

## [2.0.0](https://github.com/prantlf/semidown/compare/v1.0.0...v2.0.0) (2025-12-21)

### Features

* Upgrade dependencies ([a48aae6](https://github.com/prantlf/semidown/commit/a48aae698b4a9dae25e3605bde08a03a1cf4d3fb))

### Bug Fixes

* Do not split fenced blocks by empty lines ([eddc48e](https://github.com/prantlf/semidown/commit/eddc48e6d1389f27e4246359d8c186498eda7e0a))

### BREAKING CHANGES

This doesn't effect the usual usage of the `Semidown`
class - updating the container element with HTML markup rendered from
a Markdown stream. However, the interface of the inner objects was
updated. The parser returns only `html`, not `isComplete` any more.
The chunker adds `isComplete` to `block-update` and `block-end` event
payloads. The renderer accept `isComplete` in both `updateBlock` and
`finalizeBlock` methods.` Also, processing of fenced blocks changed
- they're constantly re-parsed and re-rendered until the closing fence
is detected. Although not a change on the API, the change of behaviour
can be considered breaking too.

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
