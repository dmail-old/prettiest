const { rollup } = require("rollup")
const babel = require("rollup-plugin-babel")
const nodeResolve = require("rollup-plugin-node-resolve")

exports.generateCommonJSFile = async ({ projectFolder, destination, source, plugins }) => {
  const bundle = await rollup({
    input: `${projectFolder}/${source}`,
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
    file: `${projectFolder}/${destination}`,
    sourcemap: true,
  })

  console.log(`${source} -> ${destination}`)
}
