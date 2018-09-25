const { rollup } = require("rollup")
const babel = require("rollup-plugin-babel")
const nodeResolve = require("rollup-plugin-node-resolve")
const path = require("path")

const root = path.resolve(__dirname, "../")
const inputFile = `${root}/index.js`
const outputFile = `${root}/dist/index.js`

rollup({
  input: inputFile,
  plugins: [
    nodeResolve(),
    babel({
      babelrc: false,
      exclude: "node_modules/**",
      plugins: ["@babel/plugin-proposal-object-rest-spread", "@babel/plugin-transform-spread"],
    }),
  ],
})
  .then((bundle) => {
    return bundle.write({
      format: "cjs",
      file: outputFile,
      sourcemap: true,
    })
  })
  .then(() => {
    console.log("build done")
  }, console.error)
