# RelatÃ³rio de Progresso TÃ©cnico - SPAM System

Este relatÃ³rio documenta a implementaÃ§Ã£o dos Requisitos Funcionais (RFs) do sistema, detalhando o status, os componentes criados ou modificados, e como cada CritÃ©rio de AceitaÃ§Ã£o (CA) foi atendido tecnicamente.

---

## RF15 â€” PrediÃ§Ã£o Individual Manual
- **Status:** ConcluÃ­do
- **Componentes Modificados/Criados:**
  - `src/app/(domains)/credit-risk/page.tsx` (Componente de UI da pÃ¡gina de Risco de CrÃ©dito)
  - `src/lib/predictive-engine.ts` (Motor analÃ­tico local de prediÃ§Ãµes)

### Mapeamento dos CritÃ©rios de AceitaÃ§Ã£o (CA)
- **CA01 â€” FormulÃ¡rio DinÃ¢mico:** EstruturaÃ§Ã£o de campos de entrada baseados dinamicamente nas variÃ¡veis descritas no esquema do modelo (`DOMAIN_SCHEMAS["credit-risk"]`). Os campos incluem ID da Proposta, Nome do Cliente, Valor Solicitado e Score de CrÃ©dito.
- **CA02 â€” Resultado Destacado:** CartÃ£o com destaque visual dinÃ¢mico condicionado ao veredicto da prediÃ§Ã£o ("Aprovar" em verde, "AnÃ¡lise Manual" em amarelo, "Revisar Garantia" em laranja e "Rejeitar" em vermelho).
- **CA03 â€” Bloqueio sem Modelo Ativo:** ExibiÃ§Ã£o de mensagem informativa e bloqueio do formulÃ¡rio de prediÃ§Ã£o individual manual caso o modelo do domÃ­nio correspondente nÃ£o esteja treinado e ativo.
- **CA04 â€” ValidaÃ§Ã£o em Tempo Real:** ValidaÃ§Ã£o dinÃ¢mica de dados numÃ©ricos (ex. Score entre 300 e 1000, valor da proposta maior que zero) e de texto nas funÃ§Ãµes de input, exibindo mensagens de erro de forma imediata e destacando campos com contornos avermelhados.
- **CA05 â€” HistÃ³rico Lateral:** Painel na lateral direita que armazena e exibe as Ãºltimas 5 prediÃ§Ãµes individuais realizadas no dispositivo. O clique em um item do histÃ³rico recarrega os dados correspondentes de volta no formulÃ¡rio e no cartÃ£o de resultado.
- **CA06 â€” ImpressÃ£o do Comprovante:** BotÃ£o "Imprimir Comprovante Simplificado" que executa o mÃ©todo `window.print()` e aciona uma folha de estilos CSS de impressÃ£o (`@media print`) para renderizar um cupom fiscal/comprovante fÃ­sico com os detalhes da proposta e o veredicto do modelo.

---

## RF35 â€” Cadastro e Listagem de UsuÃ¡rios Administradores
- **Status:** ConcluÃ­do
- **Componentes Modificados/Criados:**
  - `src/app/admin/usuarios/page.tsx` (Interface administrativa de controle de usuÃ¡rios)
  - `src/lib/context/domain-context.tsx` (Estado global da aplicaÃ§Ã£o, controle de autenticaÃ§Ã£o e sessÃ£o)
  - `src/components/shared/header.tsx` (Header global com link para a tela administrativa de usuÃ¡rios)
  - `src/components/shared/sidebar.tsx` (Menu lateral de navegaÃ§Ã£o com link ativo destacado)

### Mapeamento dos CritÃ©rios de AceitaÃ§Ã£o (CA)
- **CA01 â€” FormulÃ¡rio de Cadastro:** Interface para criaÃ§Ã£o de novos usuÃ¡rios administradores com campos estruturados para nome completo, usuÃ¡rio/username, perfil de acesso (Ex: Super Admin, Gestor AnalÃ­tico, Engenheiro de Dados), departamento e senha.
- **CA02 â€” Simulador de Criptografia:** Caixa interativa na tela mostrando o progresso em tempo real e o hash gerado pela criptografia SHA-256 no cliente durante a criaÃ§Ã£o do cadastro.
- **CA03 â€” Logs e ConfirmaÃ§Ãµes:** ExibiÃ§Ã£o de diÃ¡logos modais de confirmaÃ§Ã£o ao criar ou alterar status de usuÃ¡rios, seguidos de auditoria interna (`addLog`) persistida localmente.
- **CA04 â€” Indicador de ForÃ§a de Senha:** Medidor dinÃ¢mico sob a senha indicando a forÃ§a com base em regras (tamanho, caracteres especiais, nÃºmeros, maiÃºsculas) com barra de progresso colorida de vermelho a verde.
- **CA05 â€” Listagem de UsuÃ¡rios:** Tabela administrativa estruturada com colunas para nome completo, usuÃ¡rio, perfil de acesso, departamento, Ãºltimo login e status ativo/inativo.
- **CA06 â€” Controle de Status Ativo/Inativo:** Switch/botÃ£o de 1 clique para inativar ou ativar usuÃ¡rios. A inativaÃ§Ã£o suspende imediatamente o login daquela credencial, desconectando o usuÃ¡rio na prÃ³xima verificaÃ§Ã£o de sessÃ£o (realizada a cada 2 segundos via polling no `DomainContext`).

---

## RF22 â€” Emitir Alertas na Interface
- **Status:** ConcluÃ­do
- **Componentes Modificados/Criados:**
  - `src/lib/context/domain-context.tsx` (Estado global de alertas, temporizador e sincronizaÃ§Ã£o de dados)
  - `src/components/shared/alerts-menu.tsx` (Componente de menu/card de alertas)
  - `src/components/shared/header.tsx` (IntegraÃ§Ã£o do menu de alertas no cabeÃ§alho)
  - `src/app/(domains)/credit-risk/page.tsx` (Disparo de alertas em prediÃ§Ãµes de risco de crÃ©dito)
  - `src/app/(domains)/maintenance/page.tsx` (Disparo de alertas em simulaÃ§Ãµes de manutenÃ§Ã£o)
  - `src/app/(domains)/churn/page.tsx` (Disparo de alertas em simulaÃ§Ãµes de evasÃ£o de clientes)
  - `src/app/(domains)/demand/page.tsx` (Disparo de alertas em simulaÃ§Ãµes de sazonalidade de demanda)

### Mapeamento dos CritÃ©rios de AceitaÃ§Ã£o (CA)
- **CA01 â€” Destaque por Criticidade:** ExibiÃ§Ã£o visual de alertas destacados por criticidade no componente de menu. Os alertas de nÃ­vel "Alto" (CrÃ­tico) possuem borda vermelha vibrante (`border-rose-500`) e fundo avermelhado suave (`bg-rose-500/[0.03]`), enquanto os de nÃ­vel "MÃ©dio" (AtenÃ§Ã£o) possuem borda amarela (`border-amber-500`) e fundo amarelado suave (`bg-amber-500/[0.03]`).
- **CA02 â€” EmissÃ£o em Tempo Real:** Alertas sÃ£o gerenciados em estado global via React Context (`DomainProvider`). Quando novos dados sÃ£o gerados pelas prediÃ§Ãµes manuais ou simulaÃ§Ãµes, a funÃ§Ã£o `addAlert` Ã© chamada e o estado `alerts` Ã© atualizado instantaneamente, re-renderizando a interface de imediato sem recarregamento (reload) da pÃ¡gina.
- **CA03 â€” InformaÃ§Ãµes do Alerta:** Cada card de alerta exibe explicitamente as informaÃ§Ãµes exigidas: o domÃ­nio correspondente (com cor/Ã­cone representativos), o item afetado (como "Torno CNC 01 (M01)" ou "Tecnologia AvanÃ§ada Beta (C551)"), e o valor de mediÃ§Ã£o/mÃ©trica que disparou o alerta (ex: "VibraÃ§Ã£o: 8.5 mm/s, Temp: 92Â°C" ou "91%").
- **CA04 â€” AÃ§Ã£o de Reconhecer:** Permite marcar cada alerta como "reconhecido" com apenas 1 clique no botÃ£o "Reconhecer" integrado no card. Ao reconhecer o alerta, a funÃ§Ã£o `recognizeAlert` atualiza o estado correspondente e persiste no `localStorage`.
- **CA05 â€” PersistÃªncia Sem Desaparecer por Timer:** Os alertas ativos nÃ£o expiram por tempo (nÃ£o somem sozinhos via setTimeout ou timers). Ao clicar em "Reconhecer", o alerta permanece visÃ­vel na aba "Ativos", aplicando apenas uma opacidade reduzida para 50%, desaturaÃ§Ã£o total (`grayscale`) e transformando o botÃ£o em um selo sutil de "Reconhecido". O status "reconhecido" e a presenÃ§a dos alertas sÃ£o mantidos permanentemente no estado e em persistÃªncia (`localStorage`), permanecendo acessÃ­veis no histÃ³rico atÃ© aÃ§Ã£o voluntÃ¡ria de exclusÃ£o ("Limpar Tudo").
- **CA06 â€” Link de Atalho de DomÃ­nio:** InclusÃ£o de um botÃ£o de link de atalho em cada card de alerta (Ã­cone de link externo). Ao ser clicado, chama a funÃ§Ã£o de transiÃ§Ã£o `initiateDomainSwitch(domain)` redirecionando o usuÃ¡rio instantaneamente para o painel estatÃ­stico correspondente Ã quele domÃ­nio.

---

## RF23 â€” Registrar HistÃ³rico de Alertas
- **Status:** ConcluÃ­do
- **Componentes Modificados/Criados:**
  - `src/lib/context/domain-context.tsx` (PersistÃªncia, estados e lÃ³gica de filtros para o histÃ³rico)
  - `src/components/shared/utility-drawer.tsx` (Filtros na UI, botÃ£o voltar, listagem cronolÃ³gica com status e exportaÃ§Ã£o CSV)
  - `src/app/page.tsx` (RemoÃ§Ã£o do banner de SaÃºde do Sistema para faxina visual)

### Mapeamento dos CritÃ©rios de AceitaÃ§Ã£o (CA)
- **CA01 â€” HistÃ³rico CronolÃ³gico:** ExibiÃ§Ã£o da lista de alertas na aba de histÃ³rico do painel em ordem estritamente cronolÃ³gica, do mais recente para o mais antigo.
- **CA02 â€” Detalhes da OcorrÃªncia:** Cada card no histÃ³rico apresenta as informaÃ§Ãµes completas do disparo: DomÃ­nio, Data, HorÃ¡rio formatado, Valor do disparo e a mÃ©trica correspondente.
- **CA03 â€” Filtros Discretos:** Controles integrados no topo da aba de histÃ³rico permitindo filtrar a listagem dinamicamente por DomÃ­nio e por PerÃ­odo (Todos, Ãšltimas 24h, Ãšltimos 7 dias, Ãšltimos 30 dias).
- **CA04 â€” Status Visual Claro:** Cada item exibe um indicador visual claro do status atual ("Pendente" em laranja vibrante ou "Reconhecido" em tom sÃ³brio acinzentado).
- **CA05 â€” ExportaÃ§Ã£o CSV:** BotÃ£o "Exportar CSV" que gera um arquivo `.csv` legÃ­vel contendo todas as colunas de dados dos alertas atualmente filtrados e aciona o download automÃ¡tico no navegador.
- **CA06 â€” PersistÃªncia localStorage:** PersistÃªncia contÃ­nua e Ã­ntegra do histÃ³rico completo no `localStorage` sob a chave `spam-alerts`, sobrevivendo a recarregamentos de pÃ¡gina e suportando o esvaziamento completo e imediato sem loops ou perdas de dados.

---

## RF38 â€” Exibir Log de Auditoria na Interface Administrativa
- **Status:** ConcluÃ­do
- **Componentes Modificados/Criados:**
  - `src/lib/context/domain-context.tsx` (EstruturaÃ§Ã£o e carga inicial de logs de auditoria e enriquecimento de gravaÃ§Ã£o)
  - `src/components/shared/utility-drawer.tsx` (Interface de visualizaÃ§Ã£o dos logs, filtros avanÃ§ados, exportaÃ§Ã£o e painel de detalhes)
  - `PROGRESS_REPORT.md` (Mapeamento do progresso)

### Mapeamento dos CritÃ©rios de AceitaÃ§Ã£o (CA)
- **CA01 â€” Tabela de Logs CronolÃ³gica:** RenderizaÃ§Ã£o dos eventos em uma tabela estritamente cronolÃ³gica (do mais recente ao mais antigo) contendo colunas de Data, HorÃ¡rio, Nome do UsuÃ¡rio, Perfil de Acesso e DescriÃ§Ã£o da AÃ§Ã£o.
- **CA02 & CA04 â€” Filtros AvanÃ§ados e Busca Vazia:** InclusÃ£o de componentes de filtro funcionais acima da tabela para pesquisa rÃ¡pida por Nome de UsuÃ¡rio (dropdown dinÃ¢mico), Intervalo de Datas (Data Inicial e Final) e Tipo de AÃ§Ã£o (AutenticaÃ§Ã£o, Modelos/Treino, Alertas/Limiares, Outros). ExibiÃ§Ã£o de mensagem informativa amigÃ¡vel e botÃ£o para limpar os filtros quando nenhum resultado Ã© retornado.
- **CA03 â€” ExportaÃ§Ã£o CSV:** BotÃ£o "Exportar CSV" que converte a listagem atualmente filtrada em arquivo `.csv` codificado com BOM (\uFEFF) para compatibilidade com o Excel e aciona o download instantÃ¢neo no navegador.
- **CA05 â€” Painel de Indicadores Resumidos:** Painel no topo da aba de logs com uma visÃ£o consolidada e quantitativa das operaÃ§Ãµes, exibindo: Total de AÃ§Ãµes, AÃ§Ãµes CrÃ­ticas (contendo falhas, erros ou bloqueios) e UsuÃ¡rios Ativos.
- **CA06 â€” VisualizaÃ§Ã£o Expandida de Detalhes:** LÃ³gica de clique em qualquer linha da tabela que abre um sub-painel lateral/overlay animado (`slide-in-from-right`) contendo a visualizaÃ§Ã£o detalhada e completa daquela aÃ§Ã£o de auditoria especÃ­fica.

---

### Melhorias Visuais e ReduÃ§Ã£o de RuÃ­do (Diretriz de Qualidade)
- **Contadores Discretos:** RemoÃ§Ã£o do efeito de pulsaÃ§Ã£o (`animate-pulse`) do Ã­cone do sino e reduÃ§Ã£o do tamanho do contador (`h-4 w-4`). Para contagens elevadas de alertas (> 9), a cor de fundo do contador Ã© ajustada para um tom vermelho/rose mais suave e com menor contraste (`bg-rose-500/70`) para mitigar a fadiga visual. RemoÃ§Ã£o completa da badge numÃ©rica do Ã­cone de escudo (Auditoria) no cabeÃ§alho global, mantendo apenas a indicaÃ§Ã£o numÃ©rica do sino.
- **EspaÃ§amento e Respiro:** Redesenho das notificaÃ§Ãµes como cartÃµes individuais com bordas suaves (`border border-border/30 rounded-xl`) e aumento do espaÃ§amento interno (`p-4.5`) e externo (`gap-3`) para melhor legibilidade. No Dashboard Principal (`page.tsx`), foi implementada uma ampliaÃ§Ã£o de padding e gap (`pt-5 space-y-7` no `CardContent`, e `pt-4 border-t` nas Ãºltimas atividades) para aumentar o respiro das informaÃ§Ãµes e isolar visualmente os blocos.
- **Contraste de Textos SecundÃ¡rios:** O contraste de dados como ID do alerta (ex: `#ALT-MNT...` reduzido e na cor de baixo contraste `text-zinc-500/40`) e hora/minuto (segundos ocultados e na cor `text-zinc-550/50`) foi mitigado para destacar a legibilidade das informaÃ§Ãµes principais (nome do item e mÃ©trica de disparo).
- **Faxina nos Cards de DomÃ­nio:** RemoÃ§Ã£o de descriÃ§Ãµes textuais longas dos mÃ³dulos do dashboard principal para conter a complexidade cognitiva.
- **SuavizaÃ§Ã£o do Card de SaÃºde do Sistema:** ReduÃ§Ã£o da altura (padding alterado para `px-4 py-2`), diminuiÃ§Ã£o do tamanho da tipografia (de `text-sm` para `text-xs`) e substituiÃ§Ã£o dos fundos berrantes de status por bordas sutis com alta transparÃªncia (`border-emerald-500/20 bg-emerald-500/[0.02]`), promovendo um visual elegante e integrado.
- **Painel Lateral de Alertas (Format Drawer):** RefatoraÃ§Ã£o completa do componente de menu dropdown suspenso para formato Drawer lateral Ã  direita, incorporando um pano de fundo com desfoque (`bg-black/40 backdrop-blur-sm`) para isolar visualmente o foco de atenÃ§Ã£o e reduzir a fadiga cognitiva.
- **Painel de Utilidades Unificado (Hub Lateral Direto):** ConsolidaÃ§Ã£o dos painÃ©is de Alertas e Logs de Auditoria sob um Ãºnico Drawer lateral altamente modular e escalÃ¡vel (`utility-drawer.tsx`), controlado por estado global (`activeUtilityPanel: null | 'alerts' | 'logs' | 'menu'`) no `DomainContext`. As listas possuem rolagem independente com `flex-1 overflow-y-auto`, e o acionamento via Header foi centralizado nesse estado unificado, extinguindo modais isolados e potenciais bugs de conflito de z-index.
- **Limpeza Radical do CabeÃ§alho (Header):** RemoÃ§Ã£o dos componentes dropdown flutuantes de Administrador e de MÃ³dulos, bem como do botÃ£o de troca de tema no topo. AdiÃ§Ã£o de um Ãºnico botÃ£o com Ã­cone de menu hambÃºrguer na extremidade direita do cabeÃ§alho, centralizando o disparo da Sidebar UtilitÃ¡ria.
- **Estrutura Interna da Sidebar Ãšnica:**
  - **Topo:** Bloco fixo com informaÃ§Ãµes do perfil do Administrador (Nome, Cargo, Departamento).
  - **Corpo Central:** BotÃµes de navegaÃ§Ã£o para alternar a gaveta para "Alertas do Sistema" ou "Log de Auditoria". Linha divisÃ³ria e botÃµes rÃ¡pidos para navegaÃ§Ã£o entre os mÃ³dulos de domÃ­nio.
  - **RodapÃ©:** BotÃ£o para alternar o tema da interface (Claro/Escuro) e botÃ£o de Logout ("Sair") com cor de alerta sutil. Tudo reunido em um Ãºnico hub que otimiza espaÃ§o de tela e organiza a hierarquia da aplicaÃ§Ã£o.

---

## RF24, RF25, RF31 e RF40 - Histórico de Previsões e Relatórios Consolidados
- **Status:** Concluído
- **Componentes Modificados/Criados:**
  - \src/lib/context/domain-context.tsx\ (Abstração global do histórico de predições)
  - \src/app/(domains)/credit-risk/page.tsx\ (Refatoração para consumir o histórico global ao invés de local state)
  - \src/components/shared/utility-drawer.tsx\ (Criação da aba 'Histórico de Previsões' e relatório consolidado)

### Mapeamento dos Critérios de Aceitação (CA)
- **RF24 (Histórico Global):** A abstração de predições foi centralizada no \DomainContext\, permitindo unificar todas as chamadas preditivas de Risco de Crédito e demais domínios. Uma aba específica no Drawer exibe os registros em tempo real.
- **RF25 (Exportação CSV):** Adicionado botão de 'Exportar CSV' para o histórico de previsões filtrado, permitindo o download em arquivo decodificado para análise externa.
- **RF31 (Filtros de Data):** Incorporados dropdowns de filtro na aba do histórico (Todas, Últimas 24h, Últimos 7 dias, Últimos 30 dias) e por domínio.
- **RF40 (Relatório Consolidado):** Incluído no menu do painel utilitário um botão para 'Relatório Consolidado' que condensa ativamente tanto Alertas Pendentes/Reconhecidos quanto Previsões Recentes em um único CSV.

---

## RF34 - Aplicar Regras de Controle de Acesso Baseado em Role
- **Status:** Concluído
- **Componentes Modificados/Criados:**
  - \src/components/shared/alert-threshold-settings.tsx\ (Bloqueio da edição de limites)
  - \src/components/shared/csv-uploader.tsx\ (Bloqueio do botão de treinamento de IA)

### Mapeamento dos Critérios de Aceitação (CA)
- **Restrição de Funcionalidades Críticas:** A edição de limiares de alertas e o disparo de treinamentos de modelo foram logicamente e visualmente restritos. Somente usuários com o \ccessProfile === 'Super Admin'\ possuem acesso livre a estas opções, exibindo tags e tooltips indicativas da falta de permissão caso o login seja de hierarquia inferior.


---

## RF39 - Exibir Aviso de Privacidade no Upload de Dados
- **Status:** ConcluÃ­do
- **Componentes Modificados/Criados:**
  - `src/lib/context/domain-context.tsx` (DefiniÃ§Ã£o do texto padrÃ£o do aviso e estado global persistente)
  - `src/app/admin/usuarios/page.tsx` (AdiÃ§Ã£o do painel de ediÃ§Ã£o do aviso legal pelo administrador)
  - `src/components/shared/csv-uploader.tsx` (InterceptaÃ§Ã£o do uploader de dados de treino e exibiÃ§Ã£o do modal impeditivo)
  - `src/components/shared/csv-import.tsx` (InterceptaÃ§Ã£o do prÃ©-processador inteligente e exibiÃ§Ã£o do modal impeditivo)

### Mapeamento dos CritÃ©rios de AceitaÃ§Ã£o (CA)
- **CA01, CA02, CA04 & CA05 â€“ Modal de Consentimento LGPD:** InterceptaÃ§Ã£o imediata do fluxo de upload em qualquer domÃ­nio. ExibiÃ§Ã£o de modal impeditivo contendo citaÃ§Ã£o da LGPD, finalidade de uso exclusivo em anÃ¡lise preditiva, nÃ£o compartilhamento com terceiros, link para a PolÃ­tica de Privacidade e contato do encarregado de proteÃ§Ã£o de dados (DPO). O upload e o processamento de arquivos sÃ£o interrompidos se o usuÃ¡rio recusar ou fechar o modal, prosseguindo apenas apÃ³s o consentimento explÃ­cito (por meio de checkbox e botÃ£o).
- **CA03 â€“ Logs de Auditoria de Consentimento:** Disparo de log automÃ¡tico ao confirmar o consentimento, registrando a data, horÃ¡rio, nome completo do usuÃ¡rio, perfil e a mensagem contendo o nome do domÃ­nio exato onde o consentimento foi efetuado.
- **CA06 â€“ GestÃ£o do Texto DinÃ¢mico:** SeÃ§Ã£o na Ã�rea Administrativa com textarea que permite a visualizaÃ§Ã£o e ediÃ§Ã£o dinÃ¢mica do aviso de privacidade no contexto global (armazenado no localStorage). O modal de upload consome dinamicamente o texto atualizado pelo administrador.


---

## RF30 â€” Selecionar Algoritmo por DomÃ­nio
- **Status:** ConcluÃ­do
- **Componentes Modificados/Criados:**
  - `src/lib/context/domain-context.tsx` (EstruturaÃ§Ã£o e persistÃªncia de algoritmos selecionados e modelos treinados por algoritmo, e logs de treinamento)
  - `src/components/shared/csv-uploader.tsx` (Interface de seleÃ§Ã£o de algoritmo e tabela comparativa de mÃ©tricas side-by-side)

### Mapeamento dos CritÃ©rios de AceitaÃ§Ã£o (CA)
- **Status:** Concluído
- **Componentes Modificados/Criados:**
  - `src/lib/context/domain-context.tsx` (Definição do texto padrão do aviso e estado global persistente)
  - `src/app/admin/usuarios/page.tsx` (Adição do painel de edição do aviso legal pelo administrador)
  - `src/components/shared/csv-uploader.tsx` (Interceptação do uploader de dados de treino e exibição do modal impeditivo)
  - `src/components/shared/csv-import.tsx` (Interceptação do pré-processador inteligente e exibição do modal impeditivo)

### Mapeamento dos Critérios de Aceitação (CA)
- **CA01, CA02, CA04 & CA05 – Modal de Consentimento LGPD:** Interceptação imediata do fluxo de upload em qualquer domínio. Exibição de modal impeditivo contendo citação da LGPD, finalidade de uso exclusivo em análise preditiva, não compartilhamento com terceiros, link para a Política de Privacidade e contato do encarregado de proteção de dados (DPO). O upload e o processamento de arquivos são interrompidos se o usuário recusar ou fechar o modal, prosseguindo apenas após o consentimento explícito (por meio de checkbox e botão).
- **CA03 – Logs de Auditoria de Consentimento:** Disparo de log automático ao confirmar o consentimento, registrando a data, horário, nome completo do usuário, perfil e a mensagem contendo o nome do domínio exato onde o consentimento foi efetuado.
- **CA06 – Gestão do Texto Dinâmico:** Seção na Área Administrativa com textarea que permite a visualização e edição dinâmica do aviso de privacidade no contexto global (armazenado no localStorage). O modal de upload consome dinamicamente o texto atualizado pelo administrador.


---

## RF30 — Selecionar Algoritmo por Domínio
- **Status:** Concluído
- **Componentes Modificados/Criados:**
  - `src/lib/context/domain-context.tsx` (Estruturação e persistência de algoritmos selecionados e modelos treinados por algoritmo, e logs de treinamento)
  - `src/components/shared/csv-uploader.tsx` (Interface de seleção de algoritmo e tabela comparativa de métricas side-by-side)

### Mapeamento dos Critérios de Aceitação (CA)
- **CA01 & CA02 — Interface de Seleção e Descrição Técnica:** Adicionada uma interface de seleção (Radio Cards premium) para cada um dos 4 domínios contendo exatamente 2 algoritmos compatíveis com descrições técnicas claras:
  - Classificação (Retenção e Crédito): *Random Forest* (Método ensemble robusto não-linear) vs *Regressão Logística* (Modelo estatístico linear clássico).
  - Regressão (Demanda e Manutenção): *Random Forest* (Método ensemble robusto não-linear) vs *Regressão Linear* (Modelo estatístico linear simples).
- **CA03 — Algoritmo nas Métricas:** Nome do algoritmo utilizado no treinamento é exibido explicitamente nas métricas de desempenho do modelo ativo e nos metadados.
- **CA04 — Comparação Side-by-Side:** Exibição de uma tabela comparativa detalhada lado a lado exibindo o desempenho de ambos os algoritmos em tempo real. Destaca automaticamente em verde o melhor resultado em cada métrica (tratando métricas de erro como RMSE e MAE onde menor é melhor).
- **CA05 — Persistência no localStorage:** A preferência de algoritmo selecionado e os modelos treinados são salvos no `localStorage` por domínio para virem pré-selecionados ao recarregar a página (F5).
- **CA06 — Logs de Auditoria do Treinamento:** Gravação automática no Log de Auditoria usando a função `addLogWithProfile` ao concluir o treinamento, contendo a mensagem: `"Treinamento realizado no domínio [Nome do Domínio] utilizando o algoritmo [Nome do Algoritmo]"`.

---

## Refatoração de Layout por Abas (Módulo de Manutenção Preditiva)
- **Status:** Concluído
- **Componentes Modificados/Criados:**
  - `src/app/(domains)/maintenance/page.tsx` (Refatoração da página principal para estrutura de Abas)
  - `src/components/ui/tabs.tsx` (Novo componente reutilizável de Abas)
  - `src/components/ui/accordion.tsx` (Novo componente reutilizável de Accordion)

### Mapeamento dos Critérios de Aceitação (CA)
- **Estruturação por Abas:** Organização em 3 abas principais ("Monitoramento", "Simulação" e "Calibração [Algoritmo Ativo]") para eliminar a infoxicação visual.
- **Aba 1 - Painel de Monitoramento:** Apresentação de KPIs do topo (OEE Médio, Disponibilidade, Alertas Ativos, RUL Médio), lista de equipamentos sob monitoramento e insights automáticos. Card de Modelos Estatísticos removido e botão de simulação realocado para a aba 2.
- **Aba 2 - Sandbox de Simulação:** Contém sliders de controle de variáveis e card comparativo "Cenário Real vs Cenário Simulado", com botão de "Simular Anomalia" posicionado de forma discreta como preset rápido.
- **Aba 3 - Calibração do Modelo:** Título dinâmico exibindo o algoritmo ativo atual. Reúne o card de Modelos Estatísticos (R²), o seletor de algoritmo (RF30), a zona de upload de CSV, a tabela comparativa side-by-side e o gráfico de resíduos (recolhido em Accordion sob demanda).

---

## RF29 — Carregar Modelo Salvo Automatically
- **Status:** Concluído
- **Componentes Modificados/Criados:**
  - `src/lib/context/domain-context.tsx` (Validação de integridade estrutural, persistência e logs de integridade)
  - `src/app/(domains)/layout.tsx` (Tela de carregamento simulado por esqueleto e spinner)
  - `src/components/shared/csv-uploader.tsx` (Exibição de resumo consolidado, aviso de obsolescência e aviso de ausência de modelo)
  - `src/app/(domains)/maintenance/page.tsx` (Badge do modelo ativo no banner, aviso de obsolescência e avisos condicionais nas abas)
  - `src/app/(domains)/demand/page.tsx` (Badge do modelo ativo no banner, aviso de obsolescência e aviso condicional de ausência de modelo)
  - `src/app/(domains)/churn/page.tsx` (Badge do modelo ativo no banner, aviso de obsolescência e aviso condicional de ausência de modelo)
  - `src/app/(domains)/credit-risk/page.tsx` (Badge do modelo ativo no banner, aviso de obsolescência e aviso condicional de ausência de modelo)

### Mapeamento dos Critérios de Aceitação (CA)
- **CA01 & CA03 — Carregamento Automático e Atraso Simulado:** Ao carregar ou alternar para a página de qualquer domínio, a aplicação simula um tempo de carregamento realista de 1.5 a 3 segundos (respeitando o limite de 10s). Durante este atraso, renderiza-se um indicador de progresso (loading spinner/bar) e um esqueleto visual (skeleton loader) estilizado de acordo com o domínio. Caso exista um modelo válido no localStorage, o sistema carrega-o de forma automática, aplicando um distintivo "✓ Modelo Pronto para Uso" com animação pulsante.
- **CA02 — Mensagem Informativa de Ausência de Modelo:** Caso não exista modelo salvo no localStorage para o domínio correspondente, a interface exibe de forma amigável e informativa instruções claras orientando o usuário a realizar o upload da base histórica em CSV e efetuar o treinamento do modelo, impedindo a quebra de tela e permitindo o uso parcial do sistema.
- **CA04 — Verificação de Integridade Estrutural:** A rotina de montagem do context realiza uma validação rigorosa das propriedades críticas do modelo recuperado (`metrics`, `algorithm`, `modelId`, `domain`). Havendo ausência de propriedade crítica, o cache do modelo defeituoso é descartado, a persistência é limpa e um alerta técnico de alta criticidade juntamente com logs de auditoria correspondentes são emitidos alertando e sugerindo uma nova calibração.
- **CA05 — Resumo Consolidado na Aba de Calibração:** Um painel consolidado é dinamicamente exibido na seção de calibração reunindo os metadados críticos do modelo (Domínio correspondente, Algoritmo utilizado, Data e Hora exatas do treinamento) e a listagem de suas métricas de desempenho correspondentes (AUC-ROC, Acurácia, R², RMSE, etc.).
- **CA06 — Alerta Visual de Obsolescência:** O sistema calcula o tempo de vida do modelo ativo com base no ano atual do ecossistema (2026). Caso a data de calibração ultrapasse 30 dias de idade, um alerta de obsolescência de baixa fadiga cognitiva é renderizado no resumo consolidado sugerindo uma nova recalibração com novos dados de telemetria, sem bloquear ou travar o funcionamento e previsões do modelo ativo atual.
