---
trigger: always_on
---

Toda vez que um "grande prompt" (uma funcionalidade inteira, não um ajuste
trivial) for executado, registre automaticamente uma entrada em
`docs/prompt-engineering/log.md` com este formato:
[RF0X] <nome curto da funcionalidade>

Prompt usado: <resumo do prompt>
Funcionou bem: <o que a IA acertou de primeira>
Dificuldade: <onde a IA errou ou precisou de correção>
Correção aplicada: <como o prompt/instrução foi ajustado>
Melhoria de UX sugerida pela IA: <se houve, qual e por quê>


Se o arquivo `docs/prompt-engineering/log.md` não existir, crie-o na
primeira vez. Pergunte ao usuário se ele quer revisar a entrada antes de
seguir para o próximo requisito — isso facilita montar o relatório final
pedido pelo professor (incluindo prints "antes x depois").