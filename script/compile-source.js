const { rollup } = require("rollup")
const babel = require("rollup-plugin-babel")
const nodeResolve = require("rollup-plugin-node-resolve")
const { localRoot, plugins } = require("../config/project.config.js")

const inputFile = `${localRoot}/index.js`
const outputFile = `${localRoot}/dist/index.js`

const compile = async () => {
  const bundle = await rollup({
    input: inputFile,
    plugins: [
      nodeResolve(),
      babel({
        babelrc: false,
        exclude: "node_modules/**",
        plugins,
      }),
    ],
  })

  await bundle.write({
    format: "cjs",
    file: outputFile,
    sourcemap: true,
  })

  console.log(`index.js -> dist/index.js`)
}

compile()
