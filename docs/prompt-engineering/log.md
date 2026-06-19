# Log de Prompt Engineering

[Lote domain-predictions] Implementar Predições por Domínio, Gráficos de Importância e Painéis

Prompt usado: "Vamos implementar o lote: domain-predictions. Lote: RF16 — Prever Demanda, RF17 — Identificar Clientes com Risco de Evasão, RF18 — Avaliar Risco de Crédito, RF19 — Exibir Gráfico de Importância das Variáveis, RF26 — Exibir Painel Visual por Domínio. Para RF19 e RF26 usar documentação. Para RF16, RF17 e RF18 usar textos fornecidos corrigidos. Seguir regras estritas e workflow."
Funcionou bem: A identificação das contradições no primeiro envio. A recriação visual das tabelas de Churn (RF17) e Risco de Crédito (RF18) com cores e colunas expansíveis. A criação de um componente reutilizável `FeatureImportanceChart` (RF19) que foi incluído condicionalmente em cada domínio se o modelo estiver treinado. Inclusão dos insights e botão de exportação conforme RF26 em todas as telas (`demand`, `churn`, `credit-risk`, e `maintenance`).
Dificuldade: A página do domínio de "Churn" possuía inicialmente 270 linhas, e eu precisei sobrescrevê-la por completo dado a complexidade de inserir as novas requisições mantendo a hierarquia coerente e de componentes limpos. Para "Credit-Risk" tive que revisar e definir qual era a ordem apropriada do score de risco.
Correção aplicada: Foi utilizado `write_to_file` com `Overwrite: true` em vez de `replace_file_content` para lidar com toda a página de forma atômica para RF17 e RF18.
Melhoria de UX sugerida pela IA: As tabelas foram implementadas permitindo não só visualizar a classificação e probabilidade, mas as linhas são interativas (`expandedRow`), de forma que ao clicar na linha o painel detalha os fatores de influência locais para aquela pessoa/empresa, conforme o critério CA05.

