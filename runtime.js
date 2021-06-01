const has_own_property = Object.prototype.hasOwnProperty;

/**
 * Merge two attribute objects giving precedence
 * to values in object `b`. Classes are special-cased
 * allowing for arrays and merging/joining appropriately
 * resulting in a string.
 *
 * @template A, B
 * @param {A} a
 * @param {B} b
 * @return {A & B} a
 * @api private
 */
export function merge(a, b) {
  if (arguments.length === 1) {
    let attrs = a[0];
    for (let i = 1; i < a.length; i++) {
      attrs = merge(attrs, a[i]);
    }
    return attrs;
  }

  for (const key in b) {
    if (key === "class") {
      const valA = a[key] || [];
      a[key] = (Array.isArray(valA) ? valA : [valA]).concat(b[key] || []);
    } else if (key === "style") {
      const valA = style(a[key]);
      valA = valA && valA[valA.length - 1] !== ";" ? valA + ";" : valA;
      const valB = style(b[key]);
      valB = valB && valB[valB.length - 1] !== ";" ? valB + ";" : valB;
      a[key] = valA + valB;
    } else {
      a[key] = b[key];
    }
  }

  return a;
}

function classes_array(val, escaping) {
  let classString = "",
    className,
    padding = "",
    escapeEnabled = Array.isArray(escaping);
  for (let i = 0; i < val.length; i++) {
    className = classes(val[i]);
    if (!className) continue;
    escapeEnabled && escaping[i] && (className = escape(className));
    classString = classString + padding + className;
    padding = " ";
  }
  return classString;
}
function classes_object(val) {
  let classString = "",
    padding = "";
  for (const key in val) {
    if (key && val[key] && has_own_property.call(val, key)) {
      classString = classString + padding + key;
      padding = " ";
    }
  }
  return classString;
}

/**
 * Process array, object, or string as a string of classes delimited by a space.
 *
 * If `val` is an array, all members of it and its subarrays are counted as
 * classes. If `escaping` is an array, then whether or not the item in `val` is
 * escaped depends on the corresponding item in `escaping`. If `escaping` is
 * not an array, no escaping is done.
 *
 * If `val` is an object, all the keys whose value is truthy are counted as
 * classes. No escaping is done.
 *
 * If `val` is a string, it is counted as a class. No escaping is done.
 *
 * @param {(string[]|Record<string, boolean>|string)} val
 * @param {?string[]} escaping
 * @return {string}
 */
export function classes(val, escaping) {
  if (Array.isArray(val)) {
    return classes_array(val, escaping);
  } else if (val && typeof val === "object") {
    return classes_object(val);
  } else {
    return val || "";
  }
}

/**
 * Convert object or string to a string of CSS styles delimited by a semicolon.
 *
 * @param {(Record<string, string>|string)} val
 * @return {string}
 */
export function style(val) {
  if (!val) return "";
  if (typeof val === "object") {
    let out = "";
    for (const style in val) {
      /* istanbul ignore else */
      if (has_own_property.call(val, style)) {
        out = out + style + ":" + val[style] + ";";
      }
    }
    return out;
  } else {
    return val + "";
  }
}

/**
 * Render the given attribute.
 *
 * @param {string} key
 * @param {string} val
 * @param {boolean} escaped
 * @param {boolean} terse
 * @return {string}
 */
export function attr(key, val, escaped, terse) {
  if (
    val === false ||
    val == null ||
    (!val && (key === "class" || key === "style"))
  ) {
    return "";
  }
  if (val === true) {
    return " " + (terse ? key : key + '="' + key + '"');
  }
  const type = typeof val;
  if (
    (type === "object" || type === "function") &&
    typeof val.toJSON === "function"
  ) {
    val = val.toJSON();
  }
  if (typeof val !== "string") {
    val = JSON.stringify(val);
    if (!escaped && val.indexOf('"') !== -1) {
      return " " + key + "='" + val.replace(/'/g, "&#39;") + "'";
    }
  }
  if (escaped) val = escape(val);
  return " " + key + '="' + val + '"';
}

/**
 * Render the given attributes object.
 *
 * @param {Record<string, string>} obj
 * @param {boolean} terse whether to use HTML5 terse boolean attributes
 * @return {String}
 */
export function attrs(obj, terse) {
  const attrs = "";

  for (const key in obj) {
    if (has_own_property.call(obj, key)) {
      let val = obj[key];

      if ("class" === key) {
        val = classes(val);
        attrs = attr(key, val, false, terse) + attrs;
        continue;
      }
      if ("style" === key) {
        val = style(val);
      }
      attrs += attr(key, val, false, terse);
    }
  }

  return attrs;
}

const match_html = /["&<>]/;

/**
 * Escape the given string of `html`.
 *
 * @param {string} html
 * @return {string}
 * @api private
 */
export function escape(_html) {
  const html = "" + _html;
  const regexResult = match_html.exec(html);
  if (!regexResult) return _html;

  let result = "";
  let i, lastIndex, escape;
  for (i = regexResult.index, lastIndex = 0; i < html.length; i++) {
    switch (html.charCodeAt(i)) {
      case 34:
        escape = "&quot;";
        break;
      case 38:
        escape = "&amp;";
        break;
      case 60:
        escape = "&lt;";
        break;
      case 62:
        escape = "&gt;";
        break;
      default:
        continue;
    }
    if (lastIndex !== i) result += html.substring(lastIndex, i);
    lastIndex = i + 1;
    result += escape;
  }
  if (lastIndex !== i) return result + html.substring(lastIndex, i);
  else return result;
}

/**
 * Re-throw the given `err` in context to the
 * the pug in `filename` at the given `lineno`.
 *
 * @param {Error} err
 * @param {string} filename
 * @param {string} lineno
 * @param {string} str original source
 * @api private
 */
export function rethrow(err, filename, lineno, str) {
  if (!(err instanceof Error)) throw err;
  if ((typeof window != "undefined" || !filename) && !str) {
    err.message += " on line " + lineno;
    throw err;
  }
  let context, lines, start, end;
  try {
    str = str || Deno.readTextFileSync(filename);
    context = 3;
    lines = str.split("\n");
    start = Math.max(lineno - context, 0);
    end = Math.min(lines.length, lineno + context);
  } catch (ex) {
    err.message += " - could not read from " + filename + " (" + ex.message +
      ")";
    rethrow(err, null, lineno);
    return;
  }

  // Error context
  context = lines
    .slice(start, end)
    .map(function (line, i) {
      const curr = i + start + 1;
      return (curr == lineno ? "  > " : "    ") + curr + "| " + line;
    })
    .join("\n");

  // Alter exception message
  err.path = filename;
  try {
    err.message = (filename || "Pug") +
      ":" +
      lineno +
      "\n" +
      context +
      "\n\n" +
      err.message;
  } catch (e) {}
  throw err;
}
