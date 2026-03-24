let translations = {};

const supportedLangs = ["en", "nb"];
const languageAliases = {
  no: "nb",
};

const browserLang = navigator.language.split("-")[0];
const normalizedLang = languageAliases[browserLang] || browserLang;
const lang = supportedLangs.includes(normalizedLang) ? normalizedLang : "en";

const ready = fetch(`/i18n/${lang}.json`)
  .then((res) => res.json())
  .then((data) => {
    translations = data;
    document.documentElement.lang = lang;
  });

function t(key) {
  return translations[key] || key;
}

function translatePage(root) {
  const container = root || document;

  container.querySelectorAll("[data-i18n]").forEach((el) => {
    el.textContent = t(el.getAttribute("data-i18n"));
  });

  container.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
    el.placeholder = t(el.getAttribute("data-i18n-placeholder"));
  });

  container.querySelectorAll("[data-i18n-html]").forEach((el) => {
    el.innerHTML = t(el.getAttribute("data-i18n-html"));
  });
}

export { ready, t, translatePage };
