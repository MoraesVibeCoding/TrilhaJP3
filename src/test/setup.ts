import { afterEach, vi } from "vitest";

// Fora do app não há roteador do Next montado: o push faz o que o Next faz no navegador, trocar o endereço.
// Teste que precisa controlar o roteador declara o próprio mock de next/navigation.
vi.mock("next/navigation", async (actual) => ({
  ...(await actual<typeof import("next/navigation")>()),
  useRouter: () => ({
    push: (url: string) => history.pushState(null, "", url),
  }),
}));

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
