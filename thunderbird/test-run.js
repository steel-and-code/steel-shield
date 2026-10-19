// Runs the add-on's rules on a parsed message (JSON from
// `steel-shield-scamcheck --parse-json`) and prints the verdict. Used by
// tests/scamcheck/run.sh so the add-on and the Python checker stay in step.
//   node test-run.js < message.json   -> exit 0 safe, 1 careful, 2 scam
"use strict";
const { check } = require("./scamcheck.js");
let data = "";
process.stdin.setEncoding("utf8");
process.stdin.on("data", c => { data += c; });
process.stdin.on("end", async () => {
  const msg = JSON.parse(data);
  const r = await check(msg, false);
  console.log(r.headline);
  for (const x of r.reasons) console.log(" " + { scam: "!!", careful: "! ", info: "  " }[x.level] + " " + x.text);
  process.exit({ scam: 2, careful: 1, safe: 0 }[r.verdict]);
});
