module.exports = {
  metas: [
    // source
    { pattern: "index.js", meta: { source: true } },
    { pattern: "src/**/*.js", meta: { source: true } },
    { pattern: "src/**/*.test.js", meta: { source: false } },

    // test
    { pattern: "index.test.js", meta: { test: true } },
    { pattern: "src/**/*.test.js", meta: { test: true } },

    // prettify
    { pattern: "index.js", meta: { prettify: true } },
    { pattern: "src/**/*.js", meta: { prettify: true } },
    { pattern: "bin/**/*.js", meta: { prettify: true } },
    { pattern: "script/**/*.js", meta: { prettify: true } },
    { pattern: "**/*.md", meta: { prettify: true } },
    { pattern: "**/*.json", meta: { prettify: true } },
    { pattern: "package.json", meta: { prettify: false } },
    { pattern: "package-lock.json", meta: { prettify: false } },
  ],
}
