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

const STATUS_IGNORED = "ignored";
const STATUS_PRETTY = "pretty";
const STATUS_UGLY = "ugly";
const STATUS_ERRORED = "errored";
const checkFormat = async ({
  folder,
  filenameRelativeArray,
  afterFormat = () => {}
}) => {
  const report = {};
  await Promise.all(filenameRelativeArray.map(async filenameRelative => {
    const filename = `${folder}/${filenameRelative}`;
    let status;
    let statusDetail;

    try {
      const [source, options, info] = await Promise.all([getFileContentAsString(filename), resolveConfig(filename), getFileInfo(filename)]);
      const {
        ignored
      } = info;

      if (ignored) {
        status = STATUS_IGNORED;
      } else {
        const pretty = check(source, _objectSpread({}, options, {
          filepath: filename
        }));
        status = pretty ? STATUS_PRETTY : STATUS_UGLY;
      }
    } catch (e) {
      status = STATUS_ERRORED;
      statusDetail = e;
    }

    afterFormat({
      filenameRelative,
      status,
      statusDetail
    });
    report[filenameRelative] = {
      status,
      statusDetail
    };
  }));
  return report;
};

const getFileContentAsString = pathname => new Promise((resolve, reject) => {
  fs.readFile(pathname, (error, buffer) => {
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
const yellow = "\x1b[33m";
const erroredStyle = string => `${red}${string}${close}`;
const erroredStyleWithIcon = string => erroredStyle(`${erroredIcon} ${string}`);
const erroredIcon = "\u003F"; // question mark ?

const ignoredStyle = string => `${blue}${string}${close}`;
const ignoredStyleWithIcon = string => ignoredStyle(`${ignoredIcon} ${string}`);
const ignoredIcon = "\u003F"; // question mark ?

const uglyStyle = string => `${yellow}${string}${close}`;
const uglyStyleWithIcon = string => uglyStyle(`${uglyIcon} ${string}`);
const uglyIcon = "\u2613"; // cross ☓

const prettyStyle = string => `${green}${string}${close}`;
const prettyStyleWithIcon = string => prettyStyle(`${prettyIcon} ${string}`);
const prettyIcon = "\u2714"; // checkmark ✔

const prettiest = async ({
  folder,
  filenameRelativeArray
}) => {
  console.log(`
-------------- format check start -----------------
`);
  const report = await checkFormat({
    folder,
    filenameRelativeArray,
    afterFormat: ({
      filenameRelative,
      status,
      statusDetail
    }) => {
      if (status === STATUS_ERRORED) {
        console.log(`${filenameRelative} -> ${erroredStyleWithIcon("errored")}`);
        console.log(statusDetail);
      }

      if (status === STATUS_IGNORED) {
        console.log(`${filenameRelative} -> ${ignoredStyleWithIcon("ignored")}`);
        return;
      }

      if (status === STATUS_UGLY) {
        console.log(`${filenameRelative} -> ${uglyStyleWithIcon("ugly")}`);
        return;
      }

      console.log(`${filenameRelative} -> ${prettyStyleWithIcon("pretty")}`);
    }
  });
  const erroredArray = filenameRelativeArray.filter(filenameRelativeArray => report[filenameRelativeArray].status === STATUS_ERRORED);
  const ignoredArray = filenameRelativeArray.filter(filenameRelativeArray => report[filenameRelativeArray].status === STATUS_IGNORED);
  const uglyArray = filenameRelativeArray.filter(filenameRelativeArray => report[filenameRelativeArray].status === STATUS_UGLY);
  const prettyArray = filenameRelativeArray.filter(filenameRelativeArray => report[filenameRelativeArray].status === STATUS_PRETTY);
  console.log(`
-------------- format check result ----------------
${filenameRelativeArray.length} files format checked
- ${erroredStyle(`${erroredArray.length} errored`)}
- ${ignoredStyle(`${ignoredArray.length} ignored`)}
- ${uglyStyle(`${uglyArray.length} ugly`)}
- ${prettyStyle(`${prettyArray.length} pretty`)}
---------------------------------------------------`);

  if (uglyArray.length) {
    process.exit(1);
  } else {
    process.exit(0);
  }
};

exports.prettiest = prettiest;
exports.checkFormat = checkFormat;
//# sourceMappingURL=index.js.map
