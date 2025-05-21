#!/usr/bin/env node

import fs from "fs";
import path from "path";
import readline from "readline";
import { fileURLToPath } from "url";

// Resolve current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cek manifest.json
const manifestPath = path.resolve(process.cwd(), "manifest.json");

if (!fs.existsSync(manifestPath)) {
  console.error("❌ manifest.json not found in current directory.");
  process.exit(1);
}

const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));

// Info
console.log(`\n📦  Existing Project\n`);
console.log(`Name: ${manifest.header.name}`);
console.log(`UUID: ${manifest.header.uuid}`);
console.log(`Version: ${manifest.header.version}`);
const entryPath =
  manifest.modules.find((mod) => mod.type === "script")?.entry ?? "scripts/";
console.log(`Scripts Path: ${entryPath}`);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.question(
  "\nAre you sure you want to install mcHook into this project? (y/N) ",
  (answer) => {
    if (answer.toLowerCase() !== "y") {
      console.log("❌ Cancelled.");
      rl.close();
      return;
    }

    const targetDir = path.resolve(process.cwd(), path.dirname(entryPath));
    const sourceDir = path.resolve(__dirname, "template");

    copyDirRecursive(sourceDir, targetDir);
    console.log(`✅ mcHook installed to ${targetDir}`);
    rl.close();
  }
);

function copyDirRecursive(src, dest) {
  if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
  for (const file of fs.readdirSync(src)) {
    const srcPath = path.join(src, file);
    const destPath = path.join(dest, file);
    if (fs.statSync(srcPath).isDirectory()) {
      copyDirRecursive(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}
