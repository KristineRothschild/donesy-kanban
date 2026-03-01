const views = {};
let currentView = null;

export function registerView(name, element) {
  views[name] = element;
}

export function navigateTo(name) {
  window.location.hash = name;
}

export function onNavigate(callback) {
  function handleHashChange() {
    const viewName = window.location.hash.slice(1) || "login";

    if (currentView) {
      currentView.classList.add("hidden");
    }

    const nextView = views[viewName];
    if (nextView) {
      nextView.classList.remove("hidden");
      currentView = nextView;
    }

    callback(viewName);
  }

  window.addEventListener("hashchange", handleHashChange);
  handleHashChange();
}
