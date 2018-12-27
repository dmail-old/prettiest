'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var fs = _interopDefault(require('fs'));

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

const {
  resolveConfig,
  getFileInfo,
  check
} = require("prettier");

const checkFormat = async ({
  localRoot,
  ressources,
  afterFormat = () => {}
}) => {
  const report = {};
  await Promise.all(ressources.map(async ressource => {
    const file = `${localRoot}/${ressource}`;
    const [source, options, info] = await Promise.all([getFileContentAsString(file), resolveConfig(file), getFileInfo(file)]);
    const {
      ignored
    } = info;
    const pretty = ignored ? undefined : check(source, _objectSpread({}, options, {
      filepath: file
    }));
    afterFormat({
      ressource,
      pretty,
      ignored
    });
    report[ressource] = {
      pretty,
      ignored
    };
  }));
  return report;
};

const getFileContentAsString = location => new Promise((resolve, reject) => {
  fs.readFile(location, (error, buffer) => {
    if (error) {
      reject(error);
    } else {
      resolve(buffer.toString());
    }
  });
});

const close = "\x1b[0m";
const green = "\x1b[32m";
const red = "\x1b[31m";
const blue = "\x1b[34m";
const prettyStyle = string => `${green}${string}${close}`;
const prettyStyleWithIcon = string => prettyStyle(`${prettyIcon} ${string}`);
const prettyIcon = "\u2714"; // checkmark ✔

const uglyStyle = string => `${red}${string}${close}`;
const uglyStyleWithIcon = string => uglyStyle(`${uglyIcon} ${string}`);
const uglyIcon = "\u2613"; // cross ☓

const ignoredStyle = string => `${blue}${string}${close}`;
const ignoredStyleWithIcon = string => ignoredStyle(`${ignoredIcon} ${string}`);
const ignoredIcon = "\u003F"; // question mark ?

const prettiest = async ({
  localRoot,
  ressources
}) => {
  const report = await checkFormat({
    localRoot,
    ressources,
    afterFormat: ({
      ressource,
      pretty,
      ignored
    }) => {
      if (ignored) {
        console.log(`${ressource} -> ${ignoredStyleWithIcon("ignored")}`);
        return;
      }

      if (pretty) {
        console.log(`${ressource} -> ${prettyStyleWithIcon("pretty")}`);
        return;
      }

      console.log(`${ressource} -> ${uglyStyleWithIcon("ugly")}`);
    }
  });
  const prettyArray = ressources.filter(ressource => {
    return !report[ressource].ignored && report[ressource].pretty;
  });
  const uglyArray = ressources.filter(ressource => {
    return !report[ressource].ignored && !report[ressource].pretty;
  });
  const ignoredArray = ressources.filter(ressource => {
    return report[ressource].ignored;
  });
  console.log(`${ressources.length} files:
- ${prettyStyle(`${prettyArray.length} pretty`)}
- ${uglyStyle(`${uglyArray.length} ugly`)}
- ${ignoredStyle(`${ignoredArray.length} ignored`)}`);

  if (uglyArray.length) {
    process.exit(1);
  } else {
    process.exit(0);
  }
};

exports.prettiest = prettiest;
exports.checkFormat = checkFormat;
//# sourceMappingURL=index.js.map
