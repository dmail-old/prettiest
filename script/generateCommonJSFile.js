const { rollup } = require("rollup")
const babel = require("rollup-plugin-babel")
const nodeResolve = require("rollup-plugin-node-resolve")

exports.generateCommonJSFile = async ({ localRoot, destination, source, plugins }) => {
  const bundle = await rollup({
    input: `${localRoot}/${source}`,
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
    file: `${localRoot}/${destination}`,
    sourcemap: true,
  })

  console.log(`${source} -> ${destination}`)
}
