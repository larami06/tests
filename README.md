# Trabalho de Qualidade e Testes de Software 
## CC5N

# Suíte de Testes Automatizados — Playwright & TypeScript

Este repositório/pacote contém os testes automatizados end-to-end (E2E) desenvolvidos com **Playwright** e **TypeScript**, cobrindo fluxos de ordenação, gestão de carrinho e checkout de uma aplicação web.

## 📁 Estrutura do Projeto

- `tests/rf01-ordenacao.spec.ts` — Cenários de teste relacionados ao **RF01 (Ordenação)** (ex.: ordenação por nome A–Z / Z–A, preço menor/maior, persistência após recarregar ou navegar para detalhes).
- `tests/rf02-carrinho.spec.ts` — Cenários de teste relacionados ao **RF02 (Carrinho)** (ex.: catálogo, adição/remoção de itens, persistência na navegação, carrinho em `cart.html` e limpeza do carrinho).
- `tests/rf03-checkout.spec.ts` — Cenários de teste relacionados ao **RF03 (Checkout)** e testes exploratórios (ex.: fluxo completo/happy path, validações de campos obrigatórios, retorno ao carrinho e cenário com carrinho vazio).
- `helpers.ts` — Funções auxiliares compartilhadas entre os testes.
- `playwright.config.ts` — Configuração do Playwright Test Runner.
- `resultados.json` — Arquivo consolidado com os resultados da execução dos testes.
- `playwright-report/` — Relatório HTML interativo gerado pelo Playwright, incluindo traces e evidências.
- `test-results/` — Artefatos por execução de teste (`trace.zip` e, nos casos com falha, `test-failed-1.png`, `video.webm` e `error-context.md`).

## 🚀 Como Executar

1. **Instale as dependências** (caso ainda não estejam instaladas no ambiente):
   ```bash
   npm install
