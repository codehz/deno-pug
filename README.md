# Pug for deno

Just a wrapper for official pug release.

Current upstream version: v3.0.2

Usage:

```typescript
import { compileFileClient } from "https://deno.land/x/pug/mod.ts";

console.log(compileFileClient("some.pug"));
```

It is also act as a cli program, execute
`deno run --allow-read --allow-write https://deno.land/x/pug/mod.ts some.pug --output some.js`
to compile pug file to js file (can be imported directly from deno code)
