import { parse } from "https://deno.land/std@0.180.0/flags/mod.ts";
// @deno-types="./globals.d.ts"
import { compileFileClient } from "https://esm.sh/v111/pug@3.0.2/deno/pug.bundle.js";
export * from "https://esm.sh/v111/pug@3.0.2/deno/pug.bundle.js";

export const runtime = new URL("./runtime.js", import.meta.url);
export function generateHeader(filename: string) {
  return `import * as pug from ${JSON.stringify(runtime)};
  /**
   * Template function
   * generated from ${filename}
   * 
   * @param {object} locals
   * @return {string}
   */
  export default `;
}

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

  const header = generateHeader(file);
  const final = header + out;

  if (typeof args.output === "string") {
    Deno.writeTextFileSync(args.output, final);
  } else {
    console.log(final);
  }
}

if (import.meta.main) {
  main();
}
