---
trigger: always_on
---

- Commits pequenos e por funcionalidade, nunca um commit gigante por sessão.
- Mensagem obrigatória no padrão da disciplina:
  `feat: [descrição curta] (RF0X)`
  Outros prefixos permitidos: `fix:`, `refactor:`, `style:`, `docs:`,
  `chore:`, seguindo sempre `tipo: descrição (RF0X)` quando aplicável a um
  requisito.
- Branches: `feature/rf0X-nome-curto` a partir de `main` (ou `develop`, se
  o grupo adotar). Nunca commitar direto em `main` sem o grupo concordar.
- Antes de propor um commit, monte a mensagem e pergunte se pode executar
  `git add` + `git commit` — não assuma.

### Implementação em lote (vários RFs na mesma sessão)

- Antes de implementar qualquer RF, **sempre crie/troque para uma branch
  isolada** a partir de `main` atualizada. Nunca implemente direto em `main`,
  mesmo que pareça "rápido".
  - 1 RF isolado → `feature/rf0X-nome-curto`
  - Lote de várias RFs relacionadas → `feature/lote-<tema-curto>` (ex:
    `feature/lote-domain-predictions`)
- Dentro de um lote, cada RF ainda gera **seu próprio commit** (`feat: ...
  (RF0X)`) e **sua própria entrada no log de prompt engineering** — a branch
  é compartilhada, mas a rastreabilidade por requisito não pode se perder.
- **Nunca execute `git push` nem abra Pull Request automaticamente.** Pare
  após o último commit do lote e aguarde o usuário revisar o diff/log
  localmente. Push e PR são sempre uma decisão manual do usuário, nunca uma
  ação implícita da IA — o repositório é compartilhado com o resto do grupo.
- Ao final do lote, resuma: o que foi implementado, o que ficou pendente, e
  quais arquivos/componentes foram tocados — para facilitar a revisão antes
  do merge.