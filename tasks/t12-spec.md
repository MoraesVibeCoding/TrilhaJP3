# T12: PWA (app instalável)

Status: **rascunho, aguardando aprovação do Pedro.** Escolhido em 2026-10-26 como próxima tarefa enquanto o Supabase não chega.

## 1. Objetivo

O Pedro adiciona o TrilhaJp3 à tela inicial do iPad (Safari, "Adicionar à Tela de Início") e o instala no computador (Chrome ou Edge, "Instalar app"). O app abre em tela cheia, sem a barra do navegador, com o ícone e o nome da marca.

## 2. Requisitos funcionais

1. `src/app/manifest.ts` (convenção do Next 16, servido em `/manifest.webmanifest`): `name` e `short_name` "TrilhaJp3", `description`, `lang` "pt-BR", `start_url` "/", `scope` "/", `display` "standalone", `background_color` Papel `#F8FAF5`, `theme_color` igual ao fundo do ícone escolhido.
2. Ícones PNG gerados do SVG da marca (`docs/brand/evolucao/logo/`), com a origem registrada:
   - `src/app/apple-icon.png` 180×180, quadrado e opaco (o iOS arredonda os cantos sozinho);
   - `public/icons/icon-192.png` e `public/icons/icon-512.png` (`purpose: any`);
   - `public/icons/icon-maskable-512.png` (`purpose: maskable`, desenho dentro dos 80% centrais).
3. Cor da barra do navegador por tema (`viewport.themeColor`): Papel `#F8FAF5` no claro, Tinta `#0F1F14` no escuro.
4. `metadata.appleWebApp`: título "TrilhaJp3", barra de status `default` (o conteúdo não fica por baixo dela).
5. O `public/icon.svg` atual continua como favicon.

## 3. Fora do escopo

Funcionar sem internet, service worker, notificações e tela de abertura própria. Modo offline está fora da v1 (`PRODUCT.md`); a documentação do Next 16 confirma que a instalação não depende de suporte offline.

## 4. Design: ícone na tela inicial (3 propostas, `impeccable`)

Maquete em `.impeccable/mocks/t12/opcoes.png` (fora do Git). Mesmo desenho da marca V2; muda só o fundo.

- **A · Floresta:** fundo `#1B4D2E`, M em Neblina, pulso lime. É o ícone que o app já usa como favicon. O Pulso fica sobre fundo escuro, como a regra da marca pede.
- **B · Papel:** fundo `#F8FAF5`, M em Floresta, pulso lime com contorno Floresta (regra do Pulso sobre fundo claro).
- **C · Tinta:** fundo `#0F1F14`, mais escuro; some num papel de parede escuro.

## 5. Testes e critérios de aceitação

1. Unitário: `manifest()` devolve os campos do item 2.1 e os 3 ícones com tamanhos e `purpose` certos.
2. E2E: `/manifest.webmanifest` responde JSON válido; cada ícone responde 200 com o tamanho em pixels declarado; o `<head>` tem `link rel="manifest"`, `link rel="apple-touch-icon"` e as duas `meta name="theme-color"`.
3. Manual (Pedro): no iPad, "Adicionar à Tela de Início" mostra o ícone escolhido e o app abre sem a barra do Safari.
4. Todas as checagens do `CONSTRAINTS.md` verdes, mais o CI do repositório.

**Para o teste manual no iPad:** o endereço precisa ser HTTPS público. A porta 3000 do Codespace tem de estar como **Public** (aba Portas, botão direito na porta, Port Visibility, Public), senão o app instalado perde o login do GitHub e não carrega. A alternativa é a Vercel (T14).

## 6. Riscos

1. Ícone recortado em formatos redondos do Android ou do Chrome: o ícone `maskable` resolve.
2. Cache do iOS: depois de trocar o ícone, é preciso remover e adicionar de novo o app à tela inicial.

## 7. Fatias

1. Ícones PNG e `manifest.ts`, com teste unitário. Cerca de 40 min.
2. `viewport.themeColor` e `appleWebApp`, com E2E. Cerca de 30 min.
3. Revisão final do `impeccable`, `DESIGN.md` e STATUS. Cerca de 20 min.

Total estimado: cerca de 1h30.
