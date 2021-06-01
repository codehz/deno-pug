import { parse } from "https://deno.land/std@0.97.0/flags/mod.ts";
import { createRequire } from "https://deno.land/std@0.97.0/node/module.ts";

const require = createRequire(import.meta.url);

const pug = require("pug");

function main() {
  const args = parse(Deno.args);

  if (args._.length < 1) {
    console.error("input files required");
    return;
  }
  if (args._.length > 1) {
    console.error("too many input files");
    return;
  }

  const file = args._[0] + "";

  const out = pug.compileFileClient(file, {
    inlineRuntimeFunctions: false,
    pretty: true,
    compileDebug: !args.release,
  });

  const url = new URL("./runtime.js", import.meta.url);
  const rt = `import * as pug from ${JSON.stringify(url)};
/**
 * Template function
 * generated from ${file}
 * 
 * @param {object} locals
 * @return {string}
 */
export default `;

  const final = rt + out;

  if (typeof args.output === "string") {
    Deno.writeTextFileSync(args.output, final);
  } else {
    console.log(final);
  }
}

main();
