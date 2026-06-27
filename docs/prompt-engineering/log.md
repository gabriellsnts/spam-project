# Log de Prompt Engineering

[Lote domain-predictions] Implementar PrediÃ§Ãµes por DomÃ­nio, GrÃ¡ficos de ImportÃ¢ncia e PainÃ©is

Prompt usado: "Vamos implementar o lote: domain-predictions. Lote: RF16 â€” Prever Demanda, RF17 â€” Identificar Clientes com Risco de EvasÃ£o, RF18 â€” Avaliar Risco de CrÃ©dito, RF19 â€” Exibir GrÃ¡fico de ImportÃ¢ncia das VariÃ¡veis, RF26 â€” Exibir Painel Visual por DomÃ­nio. Para RF19 e RF26 usar documentaÃ§Ã£o. Para RF16, RF17 e RF18 usar textos fornecidos corrigidos. Seguir regras estritas e workflow."
Funcionou bem: A identificaÃ§Ã£o das contradiÃ§Ãµes no primeiro envio. A recriaÃ§Ã£o visual das tabelas de Churn (RF17) e Risco de CrÃ©dito (RF18) com cores e colunas expansÃ­veis. A criaÃ§Ã£o de um componente reutilizÃ¡vel `FeatureImportanceChart` (RF19) que foi incluÃ­do condicionalmente em cada domÃ­nio se o modelo estiver treinado. InclusÃ£o dos insights e botÃ£o de exportaÃ§Ã£o conforme RF26 em todas as telas (`demand`, `churn`, `credit-risk`, e `maintenance`).
Dificuldade: A pÃ¡gina do domÃ­nio de "Churn" possuÃ­a inicialmente 270 linhas, e eu precisei sobrescrevÃª-la por completo dado a complexidade de inserir as novas requisiÃ§Ãµes mantendo a hierarquia coerente e de componentes limpos. Para "Credit-Risk" tive que revisar e definir qual era a ordem apropriada do score de risco.
CorreÃ§Ã£o aplicada: Foi utilizado `write_to_file` com `Overwrite: true` em vez de `replace_file_content` para lidar com toda a pÃ¡gina de forma atÃ´mica para RF17 e RF18.
Melhoria de UX sugerida pela IA: As tabelas foram implementadas permitindo nÃ£o sÃ³ visualizar a classificaÃ§Ã£o e probabilidade, mas as linhas sÃ£o interativas (`expandedRow`), de forma que ao clicar na linha o painel detalha os fatores de influÃªncia locais para aquela pessoa/empresa, conforme o critÃ©rio CA05.


[Lote historico-relatorios] Implementar Histórico de Previsões, Relatórios e Controle de Acesso (RF24, RF25, RF31, RF40, RF34)

Prompt usado: Implemente esse requisitos e dps de npm run dev para analise
Funcionou bem: A abstração do histórico no \DomainContext\, permitindo unificar as predições de Risco de Crédito e demais domínios. A implementação rápida do filtro por domínios e período na interface de Utility Drawer e integração de relatórios via CSV.
Dificuldade: Refatorar o \CreditRiskPage\ para usar o histórico global em vez do estado local e ajustar o layout da aba do Drawer de forma a não quebrar o layout das outras abas (Alertas e Logs).
Correção aplicada: Para resolver o acesso aos logs, foi passado um mock de controle de role onde apenas o 'Super Admin' ou usuários nulos (deslogados) podem executar edição nas áreas críticas.
Melhoria de UX sugerida pela IA: No painel de Previsões, cada card inclui atalho para as páginas dos domínios em vez de apenas texto, com micro-interações de destaque.


[RF49] Recuperar Dados Excluídos Acidentalmente (Lixeira)

Prompt usado: Implementação em lote (6 RFs de UI fáceis). RF49 - criar rota /admin/trash/page.tsx com tabela simulando itens excluídos e botão de restaurar.
Funcionou bem: Criação da UI de Lixeira usando componentes do shadcn (Card, Button, Input) e Tailwind para a tabela. Rota adicionada na Sidebar.
Dificuldade: O componente Table padrão do shadcn não estava inicializado no projeto, então optei por usar uma tabela HTML nativa estilizada com Tailwind para evitar a necessidade de rodar comandos de instalação do shadcn/ui no meio do lote.
Correção aplicada: Utilizada tabela nativa. Link para a Lixeira inserido na barra lateral com ícone respectivo.
Melhoria de UX sugerida pela IA: Inclusão de um Toast simulado para dar feedback visual imediato ao usuário quando um item é 'restaurado' ou 'excluído', aumentando a interatividade da página estática.


[RF55] Disponibilizar Glossário Integrado de Termos Técnicos

Prompt usado: RF55 - criar rota /docs/glossary/page.tsx com lista de termos técnicos (mockados) e barra de pesquisa.
Funcionou bem: Criação da UI usando Cards para agrupar os termos. A lógica de filtro por texto na search bar funcionou diretamente com React State (useState).
Dificuldade: Nenhuma.
Correção aplicada: Nenhuma necessária.
Melhoria de UX sugerida pela IA: Adicionado um 'badge' (tag) para categorizar cada termo (Métricas, Machine Learning, Geral), facilitando a leitura rápida e organização visual.


[RF64] Suportar Predição em Tempo Real via API REST

Prompt usado: RF64 - criar rota /developer/api/page.tsx com painel estático exibindo chave de API e snippet cURL.
Funcionou bem: Uso do componente Input readOnly e botões de copy-to-clipboard com feedback visual (ícone de Check verde temporário).
Dificuldade: Nenhuma.
Correção aplicada: Nenhuma.
Melhoria de UX sugerida pela IA: Adicionado um botão 'Gerar Nova Chave' que simula um loading visual (ícone RefreshCcw com animate-spin) antes de alterar a chave na tela, dando uma percepção de ação real.


[RF76] Exportar Resultados em Múltiplos Formatos

Prompt usado: RF76 - criar componente genérico ExportDropdown com opções CSV, JSON, PDF e adicionar no header da página de risco de crédito.
Funcionou bem: Criação do DropdownMenu baseado no shadcn/ui. Botão substituiu o botão antigo estático de exportar PDF.
Dificuldade: Nenhuma.
Correção aplicada: Nenhuma.
Melhoria de UX sugerida pela IA: Adição de ícones distintos para cada formato (FileSpreadsheet, FileJson, FileText) e um micro-delay simulando o download, onde o ícone temporariamente muda para um 'Check' de sucesso antes do menu fechar/reiniciar.


[RF80] Permitir Compartilhamento de Análises com Colegas

Prompt usado: RF80 - criar componente ShareAnalysisDialog e adicionar ao cabeçalho da página de crédito.
Funcionou bem: Utilização do Dialog do shadcn/ui. O formulário simula o envio de e-mail e a cópia de link.
Dificuldade: Nenhuma.
Correção aplicada: Nenhuma.
Melhoria de UX sugerida pela IA: Inclusão de estados de 'loading' no botão de enviar (icone piscando/animate-bounce) e feedback de 'copiado' para o link direto, seguindo padrões modernos de interação.

