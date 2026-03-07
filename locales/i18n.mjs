import { readFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const en = JSON.parse(readFileSync(join(__dirname, "en.json"), "utf-8"));
const nb = JSON.parse(readFileSync(join(__dirname, "nb.json"), "utf-8"));

const languages = { en, nb };

function getLanguage(acceptLanguage) {
  if (!acceptLanguage) return "en";
  const lang = acceptLanguage.split(",")[0].split("-")[0].trim().toLowerCase();
  return languages[lang] ? lang : "en";
}

function translate(lang, key) {
  return languages[lang]?.[key] || key;
}

export { getLanguage, translate };
