import fs from "fs";
import path from "path";
import { execSync } from "child_process";

const files = execSync('find dist -name "*.js"', { encoding: "utf8" })
  .trim()
  .split("\n")
  .filter(Boolean);

let fixed = 0;
for (const file of files) {
  let content = fs.readFileSync(file, "utf8");
  const orig = content;
  content = content.replace(
    /from\s+['"](\.\.?\/[^'"]+)['"]/g,
    (match, importPath) => {
      if (importPath.endsWith(".js")) return match;
      const dir = path.dirname(file);
      const abs = path.resolve(dir, importPath);
      if (fs.existsSync(abs + ".js"))
        return match.replace(importPath, importPath + ".js");
      if (fs.existsSync(abs + "/index.js"))
        return match.replace(importPath, importPath + "/index.js");
      return match;
    }
  );
  if (content !== orig) {
    fs.writeFileSync(file, content);
    fixed++;
  }
}
console.log(`postbuild: fixed ${fixed} ESM imports`);