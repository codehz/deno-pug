import { parse } from "https://deno.land/std@0.97.0/flags/mod.ts";
// @deno-types="./globals.d.ts"
import { compileFileClient } from "https://cdn.esm.sh/v41/pug@3.0.2/deno/pug.bundle.js";

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

  const out = compileFileClient(file, {
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
