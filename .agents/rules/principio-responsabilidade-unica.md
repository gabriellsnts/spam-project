---
trigger: always_on
---

- Todo elemento visual reconhecível (botão de ação, card de métrica,
  formulário, gráfico, tabela) é um componente próprio em `/components`.
- Use componentes base do shadcn/ui sempre que existir um equivalente
  (Button, Card, Dialog, Tabs, Slider, etc.) antes de criar do zero.
- Antes de implementar qualquer tela completa, garanta que existam e
  estejam consistentes: o roteamento (App Router), o layout principal
  (Sidebar + Navbar) e o `DomainSwitcher` (RF01–RF04).
- Um componente que passar de ~150 linhas é candidato a ser quebrado.
