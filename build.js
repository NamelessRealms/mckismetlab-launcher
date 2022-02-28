const fs = require("fs-extra");
const path = require("path");

fs.emptyDirSync(path.join(__dirname, "dist"));

// copy public dist
fs.copySync(path.join(__dirname, "public"), path.join(__dirname, "dist/assets"));