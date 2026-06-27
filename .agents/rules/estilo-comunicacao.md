---
trigger: always_on
---

- Responda em português (PT-BR), de forma direta e objetiva.
- Quando o usuário corrigir uma instrução sua para alinhar com o que o
  professor pediu, aplique a correção sem repetir a discussão — apenas
  confirme o ajuste em uma frase.
- Prefira exemplos concretos de código a explicações abstratas.
- Nunca implemente lógica de machine learning real no frontend; os dados de
  predição devem continuar passando por `lib/predictive-engine.ts` (já
  existente). Toda nova função de previsão entra ali, com uma assinatura
  clara (ex: `getPrediction(domain, params)`), simulando hoje o retorno do
  backend, mas isolada o suficiente para ser substituída por uma chamada de
  API real sem alterar os componentes que a consomem.
