'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var fs = _interopDefault(require('fs'));
var projectStructure = require('@dmail/project-structure');

function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }

  return obj;
}

function _objectSpread(target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i] != null ? arguments[i] : {};
    var ownKeys = Object.keys(source);

    if (typeof Object.getOwnPropertySymbols === 'function') {
      ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) {
        return Object.getOwnPropertyDescriptor(source, sym).enumerable;
      }));
    }

    ownKeys.forEach(function (key) {
      _defineProperty(target, key, source[key]);
    });
  }

  return target;
}

const prettier = require("prettier");

const getFileContentAsString = location => new Promise((resolve, reject) => {
  fs.readFile(location, (error, buffer) => {
    if (error) {
      reject(error);
    } else {
      resolve(buffer.toString());
    }
  });
});

const getReport = ({
  root
}) => {
  return projectStructure.createRoot({
    root
  }).then(({
    forEachFileMatching
  }) => {
    return forEachFileMatching(({
      prettify
    }) => prettify, ({
      absoluteName
    }) => {
      return Promise.all([getFileContentAsString(absoluteName), prettier.resolveConfig(absoluteName)]).then(([source, options]) => {
        const pretty = prettier.check(source, _objectSpread({}, options, {
          filepath: absoluteName
        }));
        return {
          file: absoluteName,
          pretty
        };
      });
    });
  });
};

exports.getReport = getReport;
//# sourceMappingURL=index.js.map
