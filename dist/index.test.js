'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var fs = _interopDefault(require('fs'));
var path = _interopDefault(require('path'));

const somePrototypeMatch = (value, predicate) => {
  let prototype = Object.getPrototypeOf(value);
  while (prototype) {
    if (predicate(prototype)) return true
    prototype = Object.getPrototypeOf(prototype);
  }
  return false
};

const isComposite = (value) => {
  if (value === null) return false
  if (typeof value === "object") return true
  if (typeof value === "function") return true
  return false
};

const isPrimitive = (value) => !isComposite(value);

/* eslint-disable no-use-before-define */
// https://github.com/dmail/dom/blob/e55a8c7b4cda6be2f7a4b1222f96d028a379b67f/src/visit.js#L89

const findPreviousComparison = (comparison, predicate) => {
  const createPreviousIterator = () => {
    let current = comparison;
    const next = () => {
      const previous = getPrevious(current);
      current = previous;
      return {
        done: !previous,
        value: previous,
      }
    };
    return {
      next,
    }
  };

  const iterator = createPreviousIterator();
  let next = iterator.next();
  while (!next.done) {
    const value = next.value;
    if (predicate(value)) {
      return value
    }
    next = iterator.next();
  }
  return null
};

const getLastChild = (comparison) => {
  return comparison.children[comparison.children.length - 1]
};

const getDeepestChild = (comparison) => {
  let deepest = getLastChild(comparison);
  while (deepest) {
    const lastChild = getLastChild(deepest);
    if (lastChild) {
      deepest = lastChild;
    } else {
      break
    }
  }
  return deepest
};

const getPreviousSibling = (comparison) => {
  const { parent } = comparison;
  if (!parent) return null
  const { children } = parent;
  const index = children.indexOf(comparison);
  if (index === 0) return null
  return children[index - 1]
};

const getPrevious = (comparison) => {
  const previousSibling = getPreviousSibling(comparison);
  if (previousSibling) {
    const deepestChild = getDeepestChild(previousSibling);

    if (deepestChild) {
      return deepestChild
    }
    return previousSibling
  }
  const parent = comparison.parent;
  return parent
};

/* eslint-disable no-use-before-define */

const compare = ({ actual, expected }) => {
  const comparison = createComparison({ type: "root", actual, expected });
  comparison.failed = !defaultComparer(comparison);
  return comparison
};

const createComparison = ({ type, data, actual, expected, parent = null, children = [] }) => {
  const comparison = {
    type,
    data,
    actual,
    expected,
    parent,
    children,
  };
  return comparison
};

const defaultComparer = (comparison) => {
  const { actual, expected } = comparison;

  if (isPrimitive(expected) || isPrimitive(actual)) {
    compareIdentity(comparison);
    return !comparison.failed
  }

  const expectedReference = findPreviousComparison(
    comparison,
    (referenceComparisonCandidate) =>
      referenceComparisonCandidate !== comparison &&
      referenceComparisonCandidate.expected === comparison.expected,
  );
  if (expectedReference) {
    if (expectedReference.actual === comparison.actual) {
      subcompare(comparison, {
        type: "reference",
        actual: expectedReference,
        expected: expectedReference,
        comparer: () => true,
      });
      return true
    }
    subcompare(comparison, {
      type: "reference",
      actual: findPreviousComparison(
        comparison,
        (referenceComparisonCandidate) =>
          referenceComparisonCandidate !== comparison &&
          referenceComparisonCandidate.actual === comparison.actual,
      ),
      expected: expectedReference,
      comparer: ({ actual, expected }) => actual === expected,
    });
    if (comparison.failed) return false
    // if we expectedAReference and it did not fail, we are done
    // this expectation was already compared and comparing it again
    // would cause infinite loop
    return true
  }

  const actualReference = findPreviousComparison(
    comparison,
    (referenceComparisonCandidate) =>
      referenceComparisonCandidate !== comparison &&
      referenceComparisonCandidate.actual === comparison.actual,
  );
  if (actualReference) {
    subcompare(comparison, {
      type: "reference",
      actual: actualReference,
      expected: null,
      comparer: () => false,
    });
    return false
  }

  compareIdentity(comparison);
  // actual === expected, no need to compare prototype, properties, ...
  if (!comparison.failed) return true
  comparison.failed = false;

  comparePrototype(comparison);
  if (comparison.failed) return false

  compareIntegrity(comparison);
  if (comparison.failed) return false

  compareExtensibility(comparison);
  if (comparison.failed) return false

  compareProperties(comparison);
  if (comparison.failed) return false

  compareSymbols(comparison);
  if (comparison.failed) return false

  comparePropertiesDescriptors(comparison);
  if (comparison.failed) return false

  compareSymbolsDescriptors(comparison);
  if (comparison.failed) return false

  // always keep this one after properties because we must first ensure
  // valueOf is on both actual and expected
  if ("valueOf" in expected && typeof expected.valueOf === "function") {
    // usefull because new Date(10).valueOf() === 10
    // or new Boolean(true).valueOf() === true
    compareValueOfReturnValue(comparison);
    if (comparison.failed) return false
  }

  // required otherwise assert({ actual: /a/, expected: /b/ }) would not throw
  if (isRegExp(expected)) {
    compareToStringReturnValue(comparison);
    if (comparison.failed) return false
  }

  return true
};

const subcompare = (comparison, { type, data, actual, expected, comparer = defaultComparer }) => {
  const subcomparison = createComparison({ type, data, actual, expected, parent: comparison });
  comparison.children.push(subcomparison);
  subcomparison.failed = !comparer(subcomparison);
  comparison.failed = subcomparison.failed;
  return subcomparison
};

const compareIdentity = (comparison) => {
  const { actual, expected } = comparison;
  subcompare(comparison, {
    type: "identity",
    actual,
    expected,
    comparer: () => {
      if (Object.is(expected, -0)) {
        return Object.is(actual, -0)
      }
      if (Object.is(actual, -0)) {
        return Object.is(expected, -0)
      }
      return actual === expected
    },
  });
};

const isRegExp = (value) => {
  return somePrototypeMatch(
    value,
    ({ constructor }) => constructor && constructor.name === "RegExp",
  )
};

const comparePrototype = (comparison) => {
  subcompare(comparison, {
    type: "prototype",
    actual: Object.getPrototypeOf(comparison.actual),
    expected: Object.getPrototypeOf(comparison.expected),
  });
};

const compareExtensibility = (comparison) => {
  subcompare(comparison, {
    type: "extensibility",
    actual: Object.isExtensible(comparison.actual) ? "extensible" : "non-extensible",
    expected: Object.isExtensible(comparison.expected) ? "extensible" : "non-extensible",
    comparer: ({ actual, expected }) => actual === expected,
  });
};

// https://tc39.github.io/ecma262/#sec-setintegritylevel
const compareIntegrity = (comparison) => {
  subcompare(comparison, {
    type: "integrity",
    actual: getIntegriy(comparison.actual),
    expected: getIntegriy(comparison.expected),
    comparer: ({ actual, expected }) => actual === expected,
  });
};

const getIntegriy = (value) => {
  if (Object.isFrozen(value)) return "frozen"
  if (Object.isSealed(value)) return "sealed"
  return "none"
};

const compareProperties = (comparison) => {
  const { actual, expected } = comparison;

  const expectedPropertyNames = Object.getOwnPropertyNames(expected);
  const actualPropertyNames = Object.getOwnPropertyNames(actual);
  const actualMissing = expectedPropertyNames.filter(
    (name) => actualPropertyNames.indexOf(name) === -1,
  );
  const actualExtra = actualPropertyNames.filter(
    (name) => expectedPropertyNames.indexOf(name) === -1,
  );
  const expectedMissing = [];
  const expectedExtra = [];

  subcompare(comparison, {
    type: "properties",
    actual: { missing: actualMissing, extra: actualExtra },
    expected: { missing: expectedMissing, extra: expectedExtra },
    comparer: () => actualMissing.length === 0 && actualExtra.length === 0,
  });
};

const compareSymbols = (comparison) => {
  const { actual, expected } = comparison;

  const expectedSymbols = Object.getOwnPropertySymbols(expected);
  const actualSymbols = Object.getOwnPropertySymbols(actual);
  const actualMissing = expectedSymbols.filter((symbol) => actualSymbols.indexOf(symbol) === -1);
  const actualExtra = actualSymbols.filter((symbol) => expectedSymbols.indexOf(symbol) === -1);
  const expectedMissing = [];
  const expectedExtra = [];

  subcompare(comparison, {
    type: "symbols",
    actual: { missing: actualMissing, extra: actualExtra },
    expected: { missing: expectedMissing, extra: expectedExtra },
    comparer: () => actualMissing.length === 0 && actualExtra.length === 0,
  });
};

const comparePropertiesDescriptors = (comparison) => {
  const { expected } = comparison;
  const expectedPropertyNames = Object.getOwnPropertyNames(expected);
  for (const expectedPropertyName of expectedPropertyNames) {
    comparePropertyDescriptor(comparison, expectedPropertyName, expected);
    if (comparison.failed) break
  }
};

const compareSymbolsDescriptors = (comparison) => {
  const { expected } = comparison;
  const expectedSymbols = Object.getOwnPropertySymbols(expected);
  for (const expectedSymbol of expectedSymbols) {
    comparePropertyDescriptor(comparison, expectedSymbol, expected);
    if (comparison.failed) break
  }
};

const comparePropertyDescriptor = (comparison, property, owner) => {
  const { actual, expected } = comparison;

  const expectedDescriptor = Object.getOwnPropertyDescriptor(expected, property);
  const actualDescriptor = Object.getOwnPropertyDescriptor(actual, property);

  const configurableComparison = subcompare(comparison, {
    type: "property-configurable",
    data: property,
    actual: actualDescriptor.configurable ? "configurable" : "non-configurable",
    expected: expectedDescriptor.configurable ? "configurable" : "non-configurable",
    comparer: ({ actual, expected }) => actual === expected,
  });
  if (configurableComparison.failed) return

  const enumerableComparison = subcompare(comparison, {
    type: "property-enumerable",
    data: property,
    actual: actualDescriptor.enumerable ? "enumerable" : "non-enumerable",
    expected: expectedDescriptor.enumerable ? "enumerable" : "non-enumerable",
    comparer: ({ actual, expected }) => actual === expected,
  });
  if (enumerableComparison.failed) return

  const writableComparison = subcompare(comparison, {
    type: "property-writable",
    data: property,
    actual: actualDescriptor.writable ? "writable" : "non-writable",
    expected: expectedDescriptor.writable ? "writable" : "non-writable",
    comparer: ({ actual, expected }) => actual === expected,
  });
  if (writableComparison.failed) return

  if (isError(owner)) {
    // error stack always differ, ignore it
    if (property === "stack") return
  }

  if (typeof owner === "function") {
    // function caller could differ but we want to ignore that
    if (property === "caller") return
    // function arguments could differ but we want to ignore that
    if (property === "arguments") return
  }

  const getComparison = subcompare(comparison, {
    type: "property-get",
    data: property,
    actual: actualDescriptor.get,
    expected: expectedDescriptor.get,
  });
  if (getComparison.failed) return

  const setComparison = subcompare(comparison, {
    type: "property-set",
    data: property,
    actual: actualDescriptor.set,
    expected: expectedDescriptor.set,
  });
  if (setComparison.failed) return

  const valueComparison = subcompare(comparison, {
    type: "property-value",
    data: isArray(expected) ? propertyToArrayIndex(property) : property,
    actual: actualDescriptor.value,
    expected: expectedDescriptor.value,
  });
  if (valueComparison.failed) return
};

const propertyToArrayIndex = (property) => {
  if (typeof property !== "string") return property
  const propertyAsNumber = parseInt(property, 10);
  if (Number.isInteger(propertyAsNumber) && propertyAsNumber >= 0) {
    return propertyAsNumber
  }
  return property
};

const isArray = (value) =>
  somePrototypeMatch(value, ({ constructor }) => constructor && constructor.name === "Array");

const isError = (value) =>
  somePrototypeMatch(value, ({ constructor }) => constructor && constructor.name === "Error");

const compareValueOfReturnValue = (comparison) => {
  subcompare(comparison, {
    type: "value-of-return-value",
    actual: comparison.actual.valueOf(),
    expected: comparison.expected.valueOf(),
  });
};

const compareToStringReturnValue = (comparison) => {
  subcompare(comparison, {
    type: "to-string-return-value",
    actual: comparison.actual.toString(),
    expected: comparison.expected.toString(),
  });
};

// https://github.com/joliss/js-string-escape/blob/master/index.js
// http://javascript.crockford.com/remedial.html
const quote = (value) => {
  const string = String(value);
  let i = 0;
  const j = string.length;
  var escapedString = "";
  while (i < j) {
    const char = string[i];
    let escapedChar;
    if (char === '"' || char === "'" || char === "\\") {
      escapedChar = `\\${char}`;
    } else if (char === "\n") {
      escapedChar = "\\n";
    } else if (char === "\r") {
      escapedChar = "\\r";
    } else if (char === "\u2028") {
      escapedChar = "\\u2028";
    } else if (char === "\u2029") {
      escapedChar = "\\u2029";
    } else {
      escapedChar = char;
    }
    escapedString += escapedChar;
    i++;
  }
  return escapedString
};

const unevalConstructor = (value, { parenthesis, useNew }) => {
  let formattedString = value;

  if (parenthesis) {
    formattedString = `(${value})`;
  }

  if (useNew) {
    formattedString = `new ${formattedString}`;
  }

  return formattedString
};

const newLineAndIndent = ({ count, useTabs, size }) => {
  if (useTabs) {
    // eslint-disable-next-line prefer-template
    return "\n" + "\t".repeat(count)
  }
  // eslint-disable-next-line prefer-template
  return "\n" + " ".repeat(count * size)
};

const preNewLineAndIndentation = (value, { depth = 0, indentUsingTab, indentSize }) => {
  return `${newLineAndIndent({
    count: depth + 1,
    useTabs: indentUsingTab,
    size: indentSize,
  })}${value}`
};

const postNewLineAndIndentation = ({ depth = 0, indentUsingTab, indentSize }) => {
  return newLineAndIndent({ count: depth, useTabs: indentUsingTab, size: indentSize })
};

const wrapNewLineAndIndentation = (value, options) => {
  return `${preNewLineAndIndentation(value, options)}${postNewLineAndIndentation(options)}`
};

const unevalArray = (value, options = {}) => {
  const { seen = [] } = options;
  if (seen.indexOf(value) > -1) {
    return "Symbol.for('circular')"
  }
  seen.push(value);

  let valuesSource = "";
  let i = 0;
  const j = value.length;
  const { compact } = options;
  const { depth = 0 } = options;

  const nestedOptions = {
    ...options,
    depth: depth + 1,
    seen,
  };

  while (i < j) {
    const valueSource = value.hasOwnProperty(i) ? unevalPrimitive(value[i], nestedOptions) : "";
    if (compact) {
      if (i === 0) {
        valuesSource += valueSource;
      } else if (valueSource) {
        valuesSource += `, ${valueSource}`;
      } else {
        valuesSource += `,`;
      }
    } else if (i === 0) {
      valuesSource += valueSource;
    } else {
      valuesSource += `,${preNewLineAndIndentation(valueSource, options)}`;
    }
    i++;
  }

  let arraySource;
  if (valuesSource.length) {
    if (compact) {
      arraySource = `${valuesSource}`;
    } else {
      arraySource = wrapNewLineAndIndentation(valuesSource, options);
    }
  } else {
    arraySource = "";
  }

  arraySource = `[${arraySource}]`;

  return unevalConstructor(arraySource, options)
};

const unevalObject = (value, options = {}) => {
  const { seen = [] } = options;
  if (seen.indexOf(value) > -1) {
    return "Symbol.for('circular')"
  }
  seen.push(value);

  let propertiesSource = "";
  const propertyNames = Object.getOwnPropertyNames(value);
  let i = 0;
  const j = propertyNames.length;
  const { depth = 0 } = options;
  const { compact } = options;

  const nestedOptions = {
    ...options,
    depth: depth + 1,
    seen,
  };

  while (i < j) {
    const propertyName = propertyNames[i];
    const propertyNameAsNumber = parseInt(propertyName, 10);
    const propertyNameSource = unevalPrimitive(
      Number.isInteger(propertyNameAsNumber) ? propertyNameAsNumber : propertyName,
      nestedOptions,
    );
    const propertyValueSource = unevalPrimitive(value[propertyName], nestedOptions);

    if (compact) {
      if (i === 0) {
        propertiesSource += `${propertyNameSource}: ${propertyValueSource}`;
      } else {
        propertiesSource += `, ${propertyNameSource}: ${propertyValueSource}`;
      }
    } else if (i === 0) {
      propertiesSource += `${propertyNameSource}: ${propertyValueSource}`;
    } else {
      propertiesSource += `,${preNewLineAndIndentation(
        `${propertyNameSource}: ${propertyValueSource}`,
        options,
      )}`;
    }

    i++;
  }

  let objectSource;
  if (propertiesSource.length) {
    if (compact) {
      objectSource = `${propertiesSource}`;
    } else {
      objectSource = `${wrapNewLineAndIndentation(propertiesSource, options)}`;
    }
  } else {
    objectSource = "";
  }

  const { objectConstructor } = options;
  if (objectConstructor) {
    objectSource = `Object({${objectSource}})`;
  } else {
    objectSource = `{${objectSource}}`;
  }

  return unevalConstructor(objectSource, options)
};

const unevalBoolean = (value, options = {}) => {
  const { depth = 0 } = options;
  const booleanSource = unevalPrimitive(value.valueOf(), { ...options, depth: depth + 1 });

  return unevalConstructor(`Boolean(${booleanSource})`, options)
};

const unevalDate = (value, options = {}) => {
  const { depth = 0 } = options;
  const dateSource = unevalPrimitive(value.valueOf(), { ...options, depth: depth + 1 });

  return unevalConstructor(`Date(${dateSource})`, options)
};

const unevalError = (value, options = {}) => {
  const { depth = 0 } = options;
  const messageSource = unevalPrimitive(value.message, { ...options, depth: depth + 1 });

  return unevalConstructor(`${value.name}(${messageSource})`, options)
};

const unevalRegExp = (value) => {
  return value.toString()
};

const unevalNumber = (value, options = {}) => {
  const { depth = 0 } = options;
  const numberSource = unevalPrimitive(value.valueOf(), { ...options, depth: depth + 1 });

  return unevalConstructor(`Number(${numberSource})`, options)
};

const unevalString = (value, options) => {
  const { depth = 0 } = options;
  const stringSource = unevalPrimitive(value.valueOf(), { ...options, depth: depth + 1 });

  return unevalConstructor(`String(${stringSource})`, options)
};

const { toString } = Object.prototype;

const getCompositeType = (object) => {
  const toStringResult = toString.call(object);
  // returns format is '[object ${tagName}]';
  // and we want ${tagName}
  const tagName = toStringResult.slice("[object ".length, -1);
  if (tagName === "Object") {
    const objectConstructorName = object.constructor.name;
    if (objectConstructorName !== "Object") {
      return objectConstructorName
    }
  }
  return tagName
};

const mapping = {
  Array: unevalArray,
  Boolean: unevalBoolean,
  Date: unevalDate,
  Error: unevalError,
  Number: unevalNumber,
  Object: unevalObject,
  RegExp: unevalRegExp,
  String: unevalString,
};

const unevalComposite = (value, options) => {
  const type = getCompositeType(value);

  if (type in mapping) {
    return mapping[type](value, options)
  }

  return unevalConstructor(`${type}(${unevalObject(value, options)})`, {
    ...options,
    parenthesis: false,
  })
};

const unevalBoolean$1 = (value) => value.toString();

const unevalFunction = (value, { showFunctionBody, parenthesis, depth }) => {
  let functionSource;
  if (showFunctionBody) {
    functionSource = value.toString();
  } else {
    const isArrowFunction = value.prototype === undefined;
    const head = isArrowFunction ? "() =>" : `function ${depth === 0 ? value.name : ""}()`;
    functionSource = `${head} {/* hidden */}`;
  }

  if (parenthesis) {
    return `(${functionSource})`
  }
  return functionSource
};

const unevalNull = () => "null";

const unevalNumber$1 = (value) => {
  return Object.is(value, -0) ? "-0" : value.toString()
};

const unevalString$1 = (value, { singleQuote }) => {
  const quotedValue = quote(value);
  return singleQuote ? `'${quotedValue}'` : `"${quotedValue}"`
};

const unevalSymbol = (value, options) => {
  const toStringResult = value.toString();
  const openingParenthesisIndex = toStringResult.indexOf("(");
  const closingParenthesisIndex = toStringResult.indexOf(")");
  const symbolDescription = toStringResult.slice(
    openingParenthesisIndex + 1,
    closingParenthesisIndex,
  );
  const symbolDescriptionSource = symbolDescription ? unevalString$1(symbolDescription, options) : "";
  const symbolSource = `Symbol(${symbolDescriptionSource})`;
  if (options.parenthesis) {
    return `${symbolSource}`
  }
  return symbolSource
};

const unevalUndefined = () => "undefined";

const getPrimitiveType = (value) => {
  if (value === null) {
    return "null"
  }

  if (value === undefined) {
    return "undefined"
  }

  return typeof value
};

const mappings = {
  boolean: unevalBoolean$1,
  function: unevalFunction,
  null: unevalNull,
  number: unevalNumber$1,
  object: unevalComposite,
  string: unevalString$1,
  symbol: unevalSymbol,
  undefined: unevalUndefined,
};

const unevalPrimitive = (
  value,
  {
    parenthesis = false,
    singleQuote = false,
    useNew = false,
    objectConstructor = false,
    compact = false,
    showFunctionBody = false,
    indentUsingTab = false,
    indentSize = 2,
    depth = 0, // internal, not meant to be used in public api
    ...remainingProps
  } = {},
) => {
  const type = getPrimitiveType(value);
  return mappings[type](value, {
    parenthesis,
    singleQuote,
    useNew,
    objectConstructor,
    compact,
    showFunctionBody,
    indentUsingTab,
    indentSize,
    depth,
    ...remainingProps,
  })
};

// https://github.com/jsenv/core/blob/959e76068b62c23d7047f6a8c7a3d6582ac25177/src/api/util/uneval.js

/* eslint-disable no-use-before-define */

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Symbol#Well-known_symbols
const symbolToWellKnownSymbol = (symbol) => {
  const wellKnownSymbolName = Object.getOwnPropertyNames(Symbol).find(
    (name) => symbol === Symbol[name],
  );
  if (wellKnownSymbolName) {
    return `Symbol${propertyToAccessorString(wellKnownSymbolName)}`
  }

  const description = symbolToDescription(symbol);
  if (description) {
    const key = Symbol.keyFor(symbol);
    if (key) {
      return `Symbol.for(${unevalPrimitive(description)})`
    }
    return `Symbol(${unevalPrimitive(description)})`
  }
  return `Symbol()`
};

const symbolToDescription = (symbol) => {
  const toStringResult = symbol.toString();
  const openingParenthesisIndex = toStringResult.indexOf("(");
  const closingParenthesisIndex = toStringResult.indexOf(")");
  return toStringResult.slice(openingParenthesisIndex + 1, closingParenthesisIndex)
  // return symbol.description // does not work on node
};

const propertyNameToDotNotationAllowed = (propertyName) => {
  return /^[a-z_$]+[0-9a-z_&]$/i.test(propertyName)
};

/* eslint-disable no-use-before-define */

const propertyToAccessorString = (property) => {
  if (typeof property === "number") {
    return `[${unevalPrimitive(property)}]`
  }
  if (typeof property === "string") {
    const dotNotationAllowedForProperty = propertyNameToDotNotationAllowed(property);
    if (dotNotationAllowedForProperty) {
      return `.${property}`
    }
    return `[${unevalPrimitive(property)}]`
  }

  return `[${symbolToWellKnownSymbol(property)}]`
};

/* eslint-disable no-use-before-define */

const comparisonToSubject = (comparison, name = "value") => {
  const comparisonPath = [];

  let ancestor = comparison.parent;
  while (ancestor && ancestor.type !== "root") {
    comparisonPath.unshift(ancestor);
    ancestor = ancestor.parent;
  }
  if (comparison.type !== "root") {
    comparisonPath.push(comparison);
  }

  const subject = comparisonPath.reduce((previous, { type, data }) => {
    if (type === "property-enumerable") {
      return `${previous}${propertyToAccessorString(data)}[[Enumerable]]`
    }
    if (type === "property-configurable") {
      return `${previous}${propertyToAccessorString(data)}[[Configurable]]`
    }
    if (type === "property-writable") {
      return `${previous}${propertyToAccessorString(data)}[[Writable]]`
    }
    if (type === "property-get") {
      return `${previous}${propertyToAccessorString(data)}[[Get]]`
    }
    if (type === "property-set") {
      return `${previous}${propertyToAccessorString(data)}[[Set]]`
    }
    if (type === "property-value") {
      return `${previous}${propertyToAccessorString(data)}`
    }
    if (type === "reference") {
      return `${previous}`
    }
    if (type === "integrity") {
      return `${previous}[[Integrity]]`
    }
    if (type === "extensibility") {
      return `${previous}[[Extensible]]`
    }
    if (type === "prototype") {
      return `${previous}[[Prototype]]`
    }
    if (type === "properties") {
      return `${previous}`
    }
    if (type === "symbols") {
      return `${previous}`
    }
    if (type === "to-string-return-value") {
      return `${previous}.toString()`
    }
    if (type === "value-of-return-value") {
      return `${previous}.valueOf()`
    }
    if (type === "identity") {
      return previous
    }
    return `${previous} type:${type}, data:${data}`
  }, name);

  return subject
};

/* eslint-disable no-use-before-define */

const valueToWellKnown = (value) => {
  const compositeWellKnownPath = valueToCompositeWellKnownPath(value);
  if (compositeWellKnownPath) {
    return compositeWellKnownPath
      .slice(1)
      .reduce(
        (previous, property) => `${previous}${propertyToAccessorString(property)}`,
        compositeWellKnownPath[0],
      )
  }
  return null
};

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/WeakMap
const compositeWellKnownMap = new WeakMap();
const primitiveWellKnownMap = new Map();

const valueToCompositeWellKnownPath = (value) => {
  return compositeWellKnownMap.get(value)
};

const isPrimitive$1 = (value) => !isComposite(value);

const addWellKnownComposite = (value, name) => {
  const visitValue = (value, path$$1) => {
    if (isPrimitive$1(value)) {
      primitiveWellKnownMap.set(value, path$$1);
      return
    }

    if (compositeWellKnownMap.has(value)) return // prevent infinite recursion
    compositeWellKnownMap.set(value, path$$1);

    const visitProperty = (property) => {
      const descriptor = Object.getOwnPropertyDescriptor(value, property);
      // do not trigger getter/setter
      if ("value" in descriptor) {
        const propertyValue = descriptor.value;
        visitValue(propertyValue, [...path$$1, property]);
      }
    };

    Object.getOwnPropertyNames(value).forEach((name) => visitProperty(name));
    Object.getOwnPropertySymbols(value).forEach((symbol) => visitProperty(symbol));
  };

  visitValue(value, [name]);
};

if (typeof global === "object") {
  addWellKnownComposite(global, "global");
}
if (typeof window === "object") {
  addWellKnownComposite(window, "window");
}

const valueToString = (value) => {
  return valueToWellKnown(value) || unevalPrimitive(value)
};

/* eslint-disable no-use-before-define */

const defaultComparisonToErrorMessage = (comparison) => {
  const subject = comparisonToSubject(comparison, "actual");
  return `unexpected value at ${subject}
--- expected value ---
${valueToString(comparison.expected)}
--- actual value ---
${valueToString(comparison.actual)}`
};

/* eslint-disable no-use-before-define */

const referenceComparisonToErrorMessage = (comparison) => {
  if (comparison.type !== "reference") return undefined

  const { actual, expected } = comparison;
  const isMissing = expected && !actual;
  const isUnexpected = !expected && actual;
  const subject = comparisonToSubject(comparison, "actual");

  if (isMissing) {
    return `missing reference at ${subject}
--- expected reference ---
${comparisonToSubject(expected, "expected")}
--- actual value ---
${valueToString(comparison.parent.actual)}`
  }

  if (isUnexpected) {
    return `extra reference at ${subject}
--- expected value ---
${valueToString(comparison.parent.expected)}
--- extra reference ---
${comparisonToSubject(actual, "actual")}`
  }

  return `unexpected reference at ${subject}
--- expected reference ---
${comparisonToSubject(expected, "expected")}
--- actual reference ---
${comparisonToSubject(actual, "actual")}`
};

const comparisonToRootComparison = (comparison) => {
  let current = comparison;
  while (current) {
    if (current.parent) {
      current = current.parent;
    } else {
      break
    }
  }
  return current
};

/* eslint-disable no-use-before-define */

const prototypeComparisonToErrorMessage = (comparison) => {
  const prototypeComparison = findPrototypeComparison(comparison);
  if (!prototypeComparison) return null

  const rootComparison = comparisonToRootComparison(comparison);
  const subject = comparisonToSubject(prototypeComparison, "actual");
  const prototypeToString = (prototype) => {
    const wellKnown = valueToWellKnown(prototype);
    if (wellKnown) return wellKnown
    // we could check in the whole comparison tree, not only for actual/expected
    // but any reference to that prototype
    // to have a better name for it
    // if anything refer to it except himself
    // it would be a better name for that object no ?
    if (prototype === rootComparison.expected) return "expected"
    if (prototype === rootComparison.actual) return "actual"
    return unevalPrimitive(prototype)
  };
  const expectedPrototype = prototypeComparison.expected;
  const actualPrototype = prototypeComparison.actual;

  return `unexpected value at ${subject}
--- expected value ---
${prototypeToString(expectedPrototype)}
--- actual value ---
${prototypeToString(actualPrototype)}`
};

const findPrototypeComparison = (comparison) => {
  let current = comparison;
  let prototypeComparison;
  while (current) {
    if (current && current.type === "prototype") {
      prototypeComparison = current;
      current = prototypeComparison.parent;
      while (current) {
        if (current.type === "prototype") prototypeComparison = current;
        current = current.parent;
      }
      return prototypeComparison
    }
    current = current.parent;
  }
  return null
};

/* eslint-disable no-use-before-define */

const propertiesComparisonToErrorMessage = (comparison) => {
  if (comparison.type !== "properties") return undefined

  const subject = comparisonToSubject(comparison, "actual");

  return `unexpected properties at ${subject}
--- missing properties ---
${unevalPrimitive(comparison.actual.missing)}
--- extra properties ---
${unevalPrimitive(comparison.actual.extra)}`
};

/* eslint-disable no-use-before-define */

const symbolsComparisonToErrorMessage = (comparison) => {
  if (comparison.type !== "symbols") return undefined

  const subject = comparisonToSubject(comparison, "actual");

  return `unexpected symbols at ${subject}
--- missing symbols ---
${unevalPrimitive(comparison.actual.missing)}
--- extra symbols ---
${unevalPrimitive(comparison.actual.extra)}`
};

/* eslint-disable no-use-before-define */

const comparisonToErrorMessage = (comparison) => {
  const failedComparison = deepestComparison(comparison);
  return firstFunctionReturningSomething(
    [
      prototypeComparisonToErrorMessage,
      referenceComparisonToErrorMessage,
      propertiesComparisonToErrorMessage,
      symbolsComparisonToErrorMessage,
      defaultComparisonToErrorMessage,
    ],
    failedComparison,
  )
};

const deepestComparison = (comparison) => {
  let current = comparison;

  while (current) {
    const { children } = current;
    if (children.length === 0) break
    current = children[children.length - 1];
  }

  return current
};

const firstFunctionReturningSomething = (fns, ...args) => {
  for (const fn of fns) {
    const returnValue = fn(...args);
    if (returnValue !== null && returnValue !== undefined) return returnValue
  }
  return undefined
};

/* eslint-disable no-use-before-define */

const assert = ({ message, actual, expected }) => {
  const expectation = {
    actual,
    expected,
  };

  const comparison = compare(expectation);
  if (comparison.failed) {
    if (message) {
      throw createAssertionError(message)
    } else {
      throw createAssertionError(comparisonToErrorMessage(comparison))
    }
  }
};

const createAssertionError = (message) => {
  const error = new Error(message);
  error.name = "AssertionError";
  return error
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

// checkmark ✔

const projectFolder = path.resolve(__dirname, "../") // because runned from dist
;

(async () => {
  const filenameRelativeArray = [`index.js`];
  const report = await checkFormat({
    folder: projectFolder,
    filenameRelativeArray
  });
  assert({
    actual: report,
    expected: {
      [`index.js`]: {
        pretty: true,
        ignored: false
      }
    }
  });
})();
//# sourceMappingURL=index.test.js.map
