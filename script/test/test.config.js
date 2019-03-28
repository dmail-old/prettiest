const { launchNode } = require("@jsenv/core")

const testDescription = {
  "/test/**/*.test.js": {
    node: {
      launch: launchNode,
    },
  },
}
exports.testDescription = testDescription
