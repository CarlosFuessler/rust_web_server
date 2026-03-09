const fs = require("fs");
const path = require("path");

const mapPath = path.join(
  __dirname,
  "..",
  "node_modules",
  "@mediapipe",
  "tasks-vision",
  "vision_bundle_mjs.js.map"
);

if (!fs.existsSync(path.dirname(mapPath))) {
  process.exit(0);
}

if (!fs.existsSync(mapPath)) {
  const minimalMap = JSON.stringify({
    version: 3,
    file: "vision_bundle.mjs",
    sources: [],
    names: [],
    mappings: "",
  });
  fs.writeFileSync(mapPath, minimalMap, "utf8");
}
