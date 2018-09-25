const { getReport } = require("../dist/index.js")
const path = require("path")

getReport({ root: path.resolve(__dirname, "../") }).then((report) => {
  console.log("report generated")
})
