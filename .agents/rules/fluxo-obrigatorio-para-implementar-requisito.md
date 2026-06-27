---
trigger: always_on
---

Sempre que for pedido para implementar um RFxx, siga esta sequência e não
pule etapas:

1. **Confirmar o requisito**: relembre em 1 frase o que o RFxx exige e quais
   critérios de aceitação (CA) ele precisa satisfazer.
2. **Verificar dependências de UI**: o RFxx depende de layout, rota ou
   componente que ainda não existe? Se sim, avise antes de codar.
3. **Implementar com liberdade de UX, mas documentada**: você tem liberdade
   para melhorar o protótipo original com padrões shadcn/ui e boas práticas
   de UX atuais. Toda melhoria aplicada deve ser declarada explicitamente na
   resposta (ex: "troquei X por Y porque..."), nunca silenciosa.
4. **Checar responsividade**: todo componente/tela novo deve ser usável em
   mobile (≥360px) e desktop. Não declare uma tela "pronta" sem isso.
5. **Apontar o que falta**: ao final, diga claramente se algum critério de
   aceitação do RFxx ainda não foi atendido.
