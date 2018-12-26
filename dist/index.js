'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var fs = _interopDefault(require('fs'));

// https://git-scm.com/docs/gitignore
// https://github.com/kaelzhang/node-ignore
const match = ({
  patterns,
  parts,
  skipPredicate,
  lastSkipRequired,
  lastPatternRequired,
  matchPart,
  skipUntilStartsMatching = false
}) => {
  let matched;
  let patternIndex = 0;
  let partIndex = 0;
  let matchIndex = 0;

  if (patterns.length === 0 && parts.length === 0) {
    matched = true;
  } else if (patterns.length === 0 && parts.length) {
    matched = true;
    matchIndex = parts.length;
  } else if (patterns.length && parts.length === 0) {
    matched = false;
  } else {
    matched = true; // eslint-disable-next-line no-constant-condition

    while (true) {
      const pattern = patterns[patternIndex];
      const part = parts[partIndex];
      const isSkipPattern = skipPredicate(pattern);
      const isLastPattern = patternIndex === patterns.length - 1;
      const isLastPart = partIndex === parts.length - 1;

      if (isSkipPattern && isLastPart && isLastPattern) {
        matchIndex += part.length;
        break;
      }

      if (isSkipPattern && isLastPattern && isLastPart === false) {
        matchIndex += part.length;
        break;
      }

      if (isSkipPattern && isLastPattern === false && isLastPart) {
        // test next pattern on current part
        patternIndex++;
        const nextPatternResult = match({
          patterns: patterns.slice(patternIndex),
          parts: parts.slice(partIndex),
          skipPredicate,
          lastSkipRequired,
          lastPatternRequired,
          matchPart
        });
        matched = nextPatternResult.matched;
        patternIndex += nextPatternResult.patternIndex;
        partIndex += nextPatternResult.partIndex;

        if (matched && patternIndex === patterns.length - 1) {
          matchIndex += nextPatternResult.matchIndex;
          break;
        }

        if (matched && partIndex === parts.length - 1) {
          matchIndex += nextPatternResult.matchIndex;
          break;
        }

        if (matched) {
          matchIndex += nextPatternResult.matchIndex;
          continue;
        } // we still increase the matchIndex by the length of the part because
        // this part has matched even if the full pattern is not satisfied


        matchIndex += part.length;
        break;
      }

      if (isSkipPattern && isLastPattern === false && isLastPart === false) {
        // test next pattern on current part
        patternIndex++;
        const skipResult = match({
          patterns: patterns.slice(patternIndex),
          parts: parts.slice(partIndex),
          skipPredicate,
          lastSkipRequired,
          lastPatternRequired,
          matchPart,
          skipUntilStartsMatching: true
        });
        matched = skipResult.matched;
        patternIndex += skipResult.patternIndex;
        partIndex += skipResult.partIndex;
        matchIndex += skipResult.matchIndex;

        if (matched && patternIndex === patterns.length - 1) {
          break;
        }

        if (matched && partIndex === parts.length - 1) {
          break;
        }

        if (matched) {
          continue;
        }

        break;
      }

      const partMatch = matchPart(pattern, part);
      matched = partMatch.matched;
      matchIndex += partMatch.matchIndex;

      if (matched === false && skipUntilStartsMatching) {
        matchIndex += part.length;
      }

      if (matched && isLastPattern && isLastPart) {
        break;
      }

      if (matched && isLastPattern && isLastPart === false) {
        if (lastPatternRequired) {
          matched = false;
        }

        break;
      }

      if (matched && isLastPattern === false && isLastPart) {
        const remainingPatternAreSkip = patterns.slice(patternIndex + 1).every(pattern => skipPredicate(pattern));

        if (remainingPatternAreSkip && lastSkipRequired) {
          matched = false;
          break;
        }

        if (remainingPatternAreSkip === false) {
          matched = false;
          break;
        }

        break;
      }

      if (matched && isLastPattern === false && isLastPart === false) {
        patternIndex++;
        partIndex++;
        continue;
      }

      if (matched === false && skipUntilStartsMatching && isLastPart === false) {
        partIndex++; // keep searching for that pattern

        continue;
      }

      break;
    }
  }

  return {
    matched,
    matchIndex,
    patternIndex,
    partIndex
  };
};

const ressourceMatch = (pattern, ressource) => {
  return match({
    patterns: pattern.split("/"),
    parts: ressource.split("/"),
    lastPatternRequired: false,
    lastSkipRequired: true,
    skipPredicate: sequencePattern => sequencePattern === "**",
    matchPart: (sequencePattern, sequencePart) => {
      return match({
        patterns: sequencePattern.split(""),
        parts: sequencePart.split(""),
        lastPatternRequired: true,
        lastSkipRequired: false,
        skipPredicate: charPattern => charPattern === "*",
        matchPart: (charPattern, charSource) => {
          const matched = charPattern === charSource;
          return {
            matched,
            patternIndex: 0,
            partIndex: 0,
            matchIndex: matched ? 1 : 0
          };
        }
      });
    }
  });
};

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

const ressourceToMeta = (metaMap, ressource) => {
  return Object.keys(metaMap).reduce((previousMeta, pattern) => {
    const {
      matched
    } = ressourceMatch(pattern, ressource);
    return matched ? _objectSpread({}, previousMeta, metaMap[pattern]) : previousMeta;
  }, {});
};

const ressourceCanContainsMetaMatching = (metaMap, ressource, predicate) => {
  if (typeof metaMap !== "object") {
    throw new TypeError(`ressourceCanContainsMetaMatching metaMap must be an object, got ${metaMap}`);
  }

  if (typeof ressource !== "string") {
    throw new TypeError(`ressourceCanContainsMetaMatching ressource must be a string, got ${ressource}`);
  }

  if (typeof predicate !== "function") {
    throw new TypeError(`ressourceCanContainsMetaMatching predicate must be a function, got ${predicate}`);
  }

  const matchIndexForRessource = ressource.split("/").join("").length;
  const partialMatch = Object.keys(metaMap).some(pattern => {
    const {
      matched,
      matchIndex
    } = ressourceMatch(pattern, ressource);
    return matched === false && matchIndex >= matchIndexForRessource && predicate(metaMap[pattern]);
  });

  if (partialMatch) {
    return true;
  } // no partial match satisfies predicate, does it work on a full match ?


  const meta = ressourceToMeta(metaMap, ressource);
  return Boolean(predicate(meta));
};

const forEachRessourceMatching = async ({
  localRoot,
  metaMap,
  predicate,
  callback = ressource => ressource
}) => {
  if (typeof localRoot !== "string") {
    throw new TypeError(`forEachRessourceMatching localRoot must be a string, got ${localRoot}`);
  }

  if (typeof metaMap !== "object") {
    throw new TypeError(`forEachRessourceMatching metaMap must be a object, got ${metaMap}`);
  }

  if (typeof predicate !== "function") {
    throw new TypeError(`forEachRessourceMatching predicate must be a function, got ${predicate}`);
  }

  if (typeof callback !== "function") {
    throw new TypeError(`forEachRessourceMatching callback must be a function, got ${callback}`);
  }

  const results = [];

  const visitFolder = async folder => {
    const folderAbsolute = folder ? `${localRoot}/${folder}` : localRoot;
    const names = await readDirectory(folderAbsolute);
    await Promise.all(names.map(async name => {
      const ressource = folder ? `${folder}/${name}` : name;
      const ressourceAbsolute = `${localRoot}/${ressource}`;
      const stat = await readStat(ressourceAbsolute);

      if (stat.isDirectory()) {
        if (!ressourceCanContainsMetaMatching(metaMap, ressource, predicate)) {
          return null;
        }

        return visitFolder(ressource);
      }

      const meta = ressourceToMeta(metaMap, ressource);

      if (!predicate(meta)) {
        return null;
      }

      const result = await callback(ressource, meta);
      results.push(result);
      return null;
    }));
  };

  await visitFolder();
  return results;
};

const readDirectory = dirname => new Promise((resolve, reject) => {
  fs.readdir(dirname, (error, names) => {
    if (error) {
      reject(error);
    } else {
      resolve(names);
    }
  });
});

const readStat = filename => new Promise((resolve, reject) => {
  fs.stat(filename, (error, stat) => {
    if (error) {
      reject(error);
    } else {
      resolve(stat);
    }
  });
});

const {
  resolveConfig,
  getFileInfo,
  check
} = require("prettier");

const generateReport = async ({
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
  const report = await generateReport({
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

const format = async ({
  localRoot,
  metaMap
}) => {
  const ressources = await forEachRessourceMatching({
    localRoot,
    metaMap,
    predicate: meta => meta.format === true
  });
  return prettiest({
    localRoot,
    ressources
  });
};

exports.format = format;
exports.prettiest = prettiest;
exports.generateReport = generateReport;
//# sourceMappingURL=index.js.map
