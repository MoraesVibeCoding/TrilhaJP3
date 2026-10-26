import { afterEach } from "vitest";

// jsdom não implementa <dialog>; o comportamento real é provado no Playwright.
HTMLDialogElement.prototype.showModal = function () {
  this.setAttribute("open", "");
};
HTMLDialogElement.prototype.close = function () {
  this.removeAttribute("open");
  this.dispatchEvent(new Event("close"));
};

// O estado salvo no navegador e o endereço não podem passar de um teste para outro.
afterEach(() => {
  localStorage.clear();
  history.replaceState(null, "", "/");
});
