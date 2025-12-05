# Changes

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
