const fs = require("fs");
const path = require("path");

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function copyFile(src, dest) {
  ensureDir(path.dirname(dest));
  fs.copyFileSync(src, dest);
  console.log(`Copied ${src} -> ${dest}`);
}

function findEngine() {
  const cwd = process.cwd();
  const candidates = [
    path.join(cwd, "node_modules", "@prisma", "client"),
    path.join(cwd, "node_modules", ".prisma", "client"),
    path.join(cwd, "node_modules", "@prisma", "client", "runtime"),
  ];

  const engines = [];
  for (const dir of candidates) {
    if (!fs.existsSync(dir)) continue;
    const files = fs.readdirSync(dir);
    for (const f of files) {
      if (/libquery_engine.*\.so\.node$/.test(f) || /query_engine-.*\.node$/.test(f) || /query_engine.*\.so\.node$/.test(f)) {
        engines.push(path.join(dir, f));
      }
    }
    // also scan subdirs
    const subdirs = fs.readdirSync(dir, { withFileTypes: true }).filter(d=>d.isDirectory()).map(d=>path.join(dir,d.name));
    for (const sub of subdirs) {
      try {
        const files2 = fs.readdirSync(sub);
        for (const f of files2) {
          if (/libquery_engine.*\.so\.node$/.test(f) || /query_engine-.*\.node$/.test(f) || /query_engine.*\.so\.node$/.test(f)) {
            engines.push(path.join(sub, f));
          }
        }
      } catch(e) {}
    }
  }
  return engines;
}

function main() {
  const destDir = path.join(process.cwd(), "src", "generated", "prisma");
  ensureDir(destDir);

  const engines = findEngine();
  if (engines.length === 0) {
    console.warn("No Prisma query engine files found in node_modules. Did prisma generate run successfully?");
    return;
  }

  for (const eng of engines) {
    const dest = path.join(destDir, path.basename(eng));
    try {
      copyFile(eng, dest);
    } catch (e) {
      console.error(`Failed to copy ${eng}: ${e}`);
    }
  }
}

main();
