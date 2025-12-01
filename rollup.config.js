import { nodeResolve } from "@rollup/plugin-node-resolve";
import typescript from "@rollup/plugin-typescript";
import terser from "@rollup/plugin-terser";
import dts from "rollup-plugin-dts";
import rm from "rollup-plugin-rm";  

export default [
  {
    input: "lib/index-core.ts",
    output: [
      {
        file: "dist/index-core.js",
        sourcemap: true,
      },
      {
        file: "dist/index-core.min.js",
        sourcemap: true,
        plugins: [terser()],
      },
      {
        file: "dist/index-core.cjs",
        format: "cjs",
        sourcemap: true,
      },
      {
        file: "dist/index-core.umd.js",
        format: "umd",
        name: "semidown",
        globals: {
          marked: "marked",
          "marked-shiki": "markedShiki",
          "shiki/bundle/web": "shiki"
        },
        sourcemap: true,
      },
      {
        file: "dist/index-core.umd.min.js",
        format: "umd",
        name: "semidown",
        globals: {
          marked: "marked",
          "marked-shiki": "markedShiki",
          "shiki/bundle/web": "shiki"
        },
        sourcemap: true,
        plugins: [terser()],
      },
    ],
    plugins: [
      typescript({
        compilerOptions: {
          skipLibCheck: false,
          declaration: true,
          declarationDir: "dist",
        },
      })
    ],
  },

  {
    input: "dist/lib/index-core.d.ts",
    output: {
      file: "dist/index-core.d.ts",
    },
    plugins: [dts()],
  },

  {
    input: "lib/index.ts",
    output: [
      {
        file: "dist/index.js",
        sourcemap: true,
      },
      {
        file: "dist/index.cjs",
        format: "cjs",
        sourcemap: true,
      },
      {
        file: "dist/index.umd.js",
        format: "umd",
        name: "semidown",
        globals: {
          marked: "marked",
          "marked-shiki": "markedShiki",
          "shiki/bundle/web": "shiki"
        },
        sourcemap: true,
      },
      {
        file: "dist/index.umd.min.js",
        format: "umd",
        name: "semidown",
        globals: {
          marked: "marked",
          "marked-shiki": "markedShiki",
          "shiki/bundle/web": "shiki"
        },
        sourcemap: true,
        plugins: [terser()],
      },
    ],
    external: ["marked", "marked-shiki", "shiki/bundle/web"],
    plugins: [typescript()],
  },

  {
    input: "dist/lib/index.d.ts",
    output: {
      file: "dist/index.d.ts",
    },
    plugins: [dts(), rm("dist/lib", "buildEnd"), rm("dist/src", "buildEnd")],
  },

  {
    input: "lib/index.ts",
    output: [
      {
        file: "dist/index-bundle.js",
        inlineDynamicImports: true,
        inlineDynamicImports: true,
        sourcemap: true,
      },
      {
        file: "dist/index-bundle.min.js",
        inlineDynamicImports: true,
        inlineDynamicImports: true,
        sourcemap: true,
        plugins: [terser()],
      },
      {
        file: "dist/index-bundle.umd.js",
        format: "umd",
        name: "semidown",
        globals: {
          marked: "marked",
          "marked-shiki": "markedShiki",
          "shiki/bundle/web": "shiki"
        },
        inlineDynamicImports: true,
        sourcemap: true,
      },
      {
        file: "dist/index-bundle.umd.min.js",
        format: "umd",
        name: "semidown",
        globals: {
          marked: "marked",
          "marked-shiki": "markedShiki",
          "shiki/bundle/web": "shiki"
        },
        inlineDynamicImports: true,
        sourcemap: true,
        plugins: [terser()],
      },
    ],
    plugins: [typescript(), nodeResolve()],
  },
]
