// Script inline que aplica uma preferência salva em <html> antes da primeira pintura.
// O catch fica de propósito sem efeito: com o armazenamento bloqueado o script nunca pode derrubar a página.
export const attributeScript = (
  key: string,
  attr: string,
  allowed: readonly string[],
) =>
  `(function(){try{var t=localStorage.getItem(${JSON.stringify(key)});if(${allowed
    .map((v) => `t===${JSON.stringify(v)}`)
    .join(
      "||",
    )})document.documentElement.setAttribute(${JSON.stringify(attr)},t)}catch(e){/* armazenamento bloqueado: a página segue com o padrão */}})()`;
