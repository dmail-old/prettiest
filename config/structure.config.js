module.exports = {
  format: {
    "**/*.js": true,
    "**/*.json": true,
    "**/*.md": true,
    node_modules: false, // eslint-disable-line camelcase
    dist: false,
    "package.json": false,
    "package-lock.json": false,
  },
}
