# Log de Prompt Engineering

[Lote domain-predictions] Implementar Predi√ß√µes por Dom√≠nio, Gr√°ficos de Import√¢ncia e Pain√©is

Prompt usado: "Vamos implementar o lote: domain-predictions. Lote: RF16 ‚Äî Prever Demanda, RF17 ‚Äî Identificar Clientes com Risco de Evas√£o, RF18 ‚Äî Avaliar Risco de Cr√©dito, RF19 ‚Äî Exibir Gr√°fico de Import√¢ncia das Vari√°veis, RF26 ‚Äî Exibir Painel Visual por Dom√≠nio. Para RF19 e RF26 usar documenta√ß√£o. Para RF16, RF17 e RF18 usar textos fornecidos corrigidos. Seguir regras estritas e workflow."
Funcionou bem: A identifica√ß√£o das contradi√ß√µes no primeiro envio. A recria√ß√£o visual das tabelas de Churn (RF17) e Risco de Cr√©dito (RF18) com cores e colunas expans√≠veis. A cria√ß√£o de um componente reutiliz√°vel `FeatureImportanceChart` (RF19) que foi inclu√≠do condicionalmente em cada dom√≠nio se o modelo estiver treinado. Inclus√£o dos insights e bot√£o de exporta√ß√£o conforme RF26 em todas as telas (`demand`, `churn`, `credit-risk`, e `maintenance`).
Dificuldade: A p√°gina do dom√≠nio de "Churn" possu√≠a inicialmente 270 linhas, e eu precisei sobrescrev√™-la por completo dado a complexidade de inserir as novas requisi√ß√µes mantendo a hierarquia coerente e de componentes limpos. Para "Credit-Risk" tive que revisar e definir qual era a ordem apropriada do score de risco.
Corre√ß√£o aplicada: Foi utilizado `write_to_file` com `Overwrite: true` em vez de `replace_file_content` para lidar com toda a p√°gina de forma at√¥mica para RF17 e RF18.
Melhoria de UX sugerida pela IA: As tabelas foram implementadas permitindo n√£o s√≥ visualizar a classifica√ß√£o e probabilidade, mas as linhas s√£o interativas (`expandedRow`), de forma que ao clicar na linha o painel detalha os fatores de influ√™ncia locais para aquela pessoa/empresa, conforme o crit√©rio CA05.


[Lote historico-relatorios] Implementar HistÛrico de Previsıes, RelatÛrios e Controle de Acesso (RF24, RF25, RF31, RF40, RF34)

Prompt usado: Implemente esse requisitos e dps de npm run dev para analise
Funcionou bem: A abstraÁ„o do histÛrico no \DomainContext\, permitindo unificar as prediÁıes de Risco de CrÈdito e demais domÌnios. A implementaÁ„o r·pida do filtro por domÌnios e perÌodo na interface de Utility Drawer e integraÁ„o de relatÛrios via CSV.
Dificuldade: Refatorar o \CreditRiskPage\ para usar o histÛrico global em vez do estado local e ajustar o layout da aba do Drawer de forma a n„o quebrar o layout das outras abas (Alertas e Logs).
CorreÁ„o aplicada: Para resolver o acesso aos logs, foi passado um mock de controle de role onde apenas o 'Super Admin' ou usu·rios nulos (deslogados) podem executar ediÁ„o nas ·reas crÌticas.
Melhoria de UX sugerida pela IA: No painel de Previsıes, cada card inclui atalho para as p·ginas dos domÌnios em vez de apenas texto, com micro-interaÁıes de destaque.

