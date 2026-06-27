# 📓 Diário de Bordo Técnico — Linha do Tempo de Desenvolvimento Autoral (Padrão ABNT)

## 📅 2026-06-09 — RF08 — Pré-Processamento Inteligente de CSV
### 1. Contexto e Problemática (O Problema)
- Arquivos carregados contendo valores nulos, registros duplicados ou tipos de dados inválidos corrompiam a esteira de treinamento dos modelos de Machine Learning no cliente, levando a predições instáveis ou falhas de compilação.

### 2. Solução Proposta e Fundamentação (O Desenvolvimento)
- Criação de um pipeline de pré-processamento inteligente de dados em lote integrado ao fluxo de importação (`csv-import.tsx`). Implementação de um banner visual contendo o resumo quantitativo de otimização (registros limpos, nulos imputados, duplicados removidos) acompanhado por mensagens explicativas de IA.

### 3. Impacto e Resultados Técnicos (A Conclusão)
- Garantia de integridade da base estatística antes da alimentação dos modelos, reduzindo erros inesperados em tempo de execução e melhorando a qualidade geral do conjunto de treinamento.

---

## 📅 2026-06-11 — RF09 — Estatísticas Descritivas dos Dados
### 1. Contexto e Problemática (O Problema)
- Os analistas técnicos precisavam compreender as características e distribuições gerais do conjunto de dados importado antes do treinamento para tomar decisões informadas de calibração.

### 2. Solução Proposta e Fundamentação (O Desenvolvimento)
- Criação de painel de estatísticas descritivas (médias, medianas, desvios padrões) das colunas numéricas de dados de entrada na página de manutenção preditiva.

### 3. Impacto e Resultados Técnicos (A Conclusão)
- Conectividade aprimorada entre o analista e o estado da aplicação, permitindo validação rápida das variáveis estatísticas no navegador sem ferramentas auxiliares.

---

## 📅 2026-06-13 — RF12 — Simulação de Cenários de Falha Condicionada
### 1. Contexto e Problemática (O Problema)
- O usuário necessitava de um ambiente seguro (sandbox) para simular diferentes cenários de falhas mecânicas e verificar o comportamento preditivo do modelo de manutenção.

### 2. Solução Proposta e Fundamentação (O Desenvolvimento)
- Programação e integração de um motor local de simulação com sliders de controle para alterar parâmetros de vibração, temperatura e ruído, calculando o impacto direto no RUL (Remaining Useful Life) e disparando o comportamento simulado do equipamento.

### 3. Impacto e Resultados Técnicos (A Conclusão)
- Disponibilização de um sandbox reativo e isolado, permitindo que operadores testem cenários de risco extremos sem impactos no ambiente físico ou de produção.

---

## 📅 2026-06-17 — RF14 — Sandbox de Retreinamento e Comparativo pós-retreio
### 1. Contexto e Problemática (O Problema)
- Evitar o retreinamento acidental de modelos de inteligência consolidados e fornecer um fluxo de comparação side-by-side de métricas de performance antes de promover a nova versão para uso geral.

### 2. Solução Proposta e Fundamentação (O Desenvolvimento)
- Criação de modal de segurança contra retreio acidental e desenvolvimento de tabela de visualização comparativa pós-treino lado a lado (Métricas antigas vs Métricas novas). Estruturação e armazenamento do histórico de hiperparâmetros de retreio.

### 3. Impacto e Resultados Técnicos (A Conclusão)
- Ciclo de vida operacional seguro para calibração de inteligência do sistema, prevenindo a perda acidental de configurações ideais.

---

## 📅 2026-06-18 — RF15 — Predição Individual Manual
### 1. Contexto e Problemática (O Problema)
- Fornecer um meio para analistas e operadores realizarem testes de inferência rápidos (predição ad-hoc) inserindo valores em campos de formulário dinâmicos, sem precisar carregar lotes de dados em planilhas de arquivos CSV.

### 2. Solução Proposta e Fundamentação (O Desenvolvimento)
- Desenvolvimento de formulário dinâmico baseado no esquema do domínio que bloqueia envios caso não haja modelo treinado e ativo, exibindo o resultado em destaque colorido conforme o veredicto de criticidade, mantendo as últimas 5 previsões em histórico lateral recarregável e fornecendo impressão de comprovantes via folha de estilos de impressão `@media print`.

### 3. Impacto e Resultados Técnicos (A Conclusão)
- Agilidade operacional para testes rápidos de campo, permitindo a extração de comprovantes simplificados do veredicto do modelo.

---

## 📅 2026-06-19 — RF35 — Cadastro Administrativo de Usuários
### 1. Contexto e Problemática (O Problema)
- Gestão centralizada de contas administrativas dos analistas do sistema com diferentes perfis e políticas de segurança.

### 2. Solução Proposta e Fundamentação (O Desenvolvimento)
- Tela administrativa de cadastro contendo formulário estruturado de perfil e departamento, caixa interativa exibindo o progresso e o hash gerado pela criptografia SHA-256 no client, medidor dinâmico de força de senha, listagem de usuários em tabela e switch de ativação/inativação com polling a cada 2s para logout.

### 3. Impacto e Resultados Técnicos (A Conclusão)
- Centralização de credenciais administrativas e controle dinâmico e seguro de login no lado do cliente.

---

## 📅 2026-06-21 — RF22 — Emissão de Alertas na Interface e Refatoração para Drawer
### 1. Contexto e Problemática (O Problema)
- Poluição visual difusa na interface do dashboard por conta de notificações dispersas e a necessidade de reduzir a infoxicação visual do usuário.

### 2. Solução Proposta e Fundamentação (O Desenvolvimento)
- Substituição do menu flutuante de alertas por um Drawer lateral (`utility-drawer.tsx`), incluindo desfoque de fundo, cores por criticidade (rose para crítico, amber para atenção), e atalhos diretos.

### 3. Impacto e Resultados Técnicos (A Conclusão)
- UI/UX limpa, centralizada e livre de ruídos, fornecendo gestão de alertas em tempo real.

---

## 📅 2026-06-21 — RF23 — Histórico Persistente de Alertas
### 1. Contexto e Problemática (O Problema)
- Necessidade de registrar de forma perene os incidentes e anomalias emitidos nos domínios para análises retroativas e auditoria de sistemas.

### 2. Solução Proposta e Fundamentação (O Desenvolvimento)
- Criação de aba de histórico cronológico persistido no `localStorage` sob a chave `spam-alerts` com filtros por período e domínio e botão de exportação para CSV.

### 3. Impacto e Resultados Técnicos (A Conclusão)
- Histórico centralizado e exportável que serve como log técnico das ocorrências anômalas no ecossistema.

---

## 📅 2026-06-22 — RF38 — Log de Auditoria na Interface
### 1. Contexto e Problemática (O Problema)
- Rastrear e auditar ações críticas executadas na aplicação de forma legível e centralizada para fins de segurança da informação e governança corporativa.

### 2. Solução Proposta e Fundamentação (O Desenvolvimento)
- Adicionado o log de auditoria técnica estruturado no contexto global, exibido em aba dedicada no drawer contendo tabela cronológica com colunas de usuário/ação, filtros avançados, exportação CSV com suporte a BOM UTF-8 para Excel, painel de KPIs e drawer de detalhes expandidos.

### 3. Impacto e Resultados Técnicos (A Conclusão)
- Rastreabilidade total das interações no ecossistema e facilidade na auditoria de segurança da informação.

---

## 📅 2026-06-24 — RF39 — Consentimento de Privacidade LGPD no Upload
### 1. Contexto e Problemática (O Problema)
- Garantir conformidade jurídica com a LGPD ao processar arquivos contendo dados que podem ter relevância de privacidade.

### 2. Solução Proposta e Fundamentação (O Desenvolvimento)
- Modal impeditivo de consentimento exigindo checkbox de aceitação antes de liberar uploads em qualquer domínio, gravação automática de logs de auditoria contendo informações do aceite, e textarea de gestão do aviso legal na área administrativa.

### 3. Impacto e Resultados Técnicos (A Conclusão)
- Conformidade e segurança legal estabelecida na esteira de tratamento e importação de dados históricos.

---

## 📅 2026-06-25 — RF30 — Seleção de Algoritmos por Domínio e Tabela Side-by-Side
### 1. Contexto e Problemática (O Problema)
- Dar flexibilidade técnica aos engenheiros na escolha de modelos de regressão ou classificação por domínio de negócio, comparando as métricas lado a lado de forma clara.

### 2. Solução Proposta e Fundamentação (O Desenvolvimento)
- Criação de botões de rádio com descrições técnicas claras de modelos (Random Forest vs Regressão Logística/Linear) por domínio, tabela comparativa side-by-side de métricas de validação, persistência local e registro no log de auditoria corporativa.

### 3. Impacto e Resultados Técnicos (A Conclusão)
- Flexibilidade analítica no client permitindo calibrações personalizadas com base nos desvios.

---

## 📅 2026-06-25 — Refatoração de Layout por Abas (Módulo de Manutenção Preditiva)
### 1. Contexto e Problemática (O Problema)
- Infoxicação visual e desorganização de layouts contendo múltiplos cards estatísticos, sandbox e calibração na mesma página de manutenção.

### 2. Solução Proposta e Fundamentação (O Desenvolvimento)
- Refatoração da página de manutenção preditiva para uma interface de abas estruturada ("Monitoramento", "Simulação" e "Calibração").

### 3. Impacto e Resultados Técnicos (A Conclusão)
- UX ergonômica, respiro de tela e foco operacional em cada tarefa.

---

## 📅 2026-06-26 — RF28 — Portabilidade e Exportação de Modelos em JSON
### 1. Contexto e Problemática (O Problema)
- Possibilitar a portabilidade do modelo treinado no navegador, permitindo fazer o download das configurações e métricas do modelo em arquivo físico estruturado para auditorias externas.

### 2. Solução Proposta e Fundamentação (O Desenvolvimento)
- Geração automática de payload JSON contendo metadados completos, ID do modelo, métricas, timestamp e contagem de registros, disparo automático de download após treino e modal de diálogo de confirmação contra sobreposição.

### 3. Impacto e Resultados Técnicos (A Conclusão)
- Portabilidade dos modelos de machine learning treinados e segurança operacional no salvamento de calibrações.

---

## 📅 2026-06-26 — RF29 — Carregar Modelo Salvo Automaticamente e Validação de Integridade
### 1. Contexto e Problemática (O Problema)
- Inicialização e validação de integridade dos modelos armazenados em cache local, indicando obsolescência dos dados e simulando tempo de processamento para fidelidade à experiência real de uso.

### 2. Solução Proposta e Fundamentação (O Desenvolvimento)
- Algoritmo de inicialização com atraso simulado de 1.5s a 3.0s usando esqueletos visuais, verificação rigorosa de chaves estruturais com expurgo de dados corrompidos, badge de modelo ativo pulsante e cálculo dinâmico de obsolescência (>30 dias com base no ano de 2026).

### 3. Impacto e Resultados Técnicos (A Conclusão)
- Robustez no carregamento e recuperação automática dos modelos e alertas oportunos sobre a idade das calibrações.

---

## 📅 2026-06-26 — RF52 — Acessibilidade, Contraste WCAG e Hub de Perfil Dedicado
### 1. Contexto e Problemática (O Problema)
- O seletor de tema e dados de usuário dispersos poluíam o Drawer de Utilidades. Além disso, havia necessidade de conformidade estrita com padrões WCAG de acessibilidade para contrastes e eixos de gráficos.

### 2. Solução Proposta e Fundamentação (O Desenvolvimento)
- Criação da página `/profile` com abas para seletor de temas e gerenciamento de usuários. Ajuste de contraste em fontes WCAG no modo claro, unificação semântica de cores de modais e gráficos, detecção automática do tema do SO e menu hamburger responsivo ao tema ativo.

### 3. Impacto e Resultados Técnicos (A Conclusão)
- Plena acessibilidade de contraste visual em toda a aplicação e simplificação ergonômica das configurações de preferências e perfil.

---

## 📅 2026-06-27 — RF32 — Visualização Comparativa Real vs Previsto e Sidebar Contextual Vertical
### 1. Contexto e Problemática (O Problema)
- O usuário necessita validar a qualidade preditiva do modelo treinado carregando um lote de dados reais e comparando os resultados gerados com a inferência obtida, calculando erros clássicos (MAE, RMSE, Acurácia, AUC-ROC), e tendo uma navegação fluida em sidebar unificada.

### 2. Solução Proposta e Fundamentação (O Desenvolvimento)
- Desenvolvimento do componente `ComparisonView` para upload de CSV de validação contendo dados reais, exibindo estatísticas comparativas, detecção de outliers (desvio superior a 20%), curva de dispersão com Recharts, histórico das últimas comparações persistido no local e paginação. Refatoração da navegação para uma sidebar contextual vertical unificada.

### 3. Impacto e Resultados Técnicos (A Conclusão)
- Facilidade na validação e homologação técnica de campo dos modelos estatísticos, fornecendo gráficos dinâmicos de regressão e relatórios exportáveis com paginação livre de ruídos.

---

## 📅 2026-06-27 — RF41 — Notificar por E-mail em Caso de Alerta Crítico (Mecanismo de Buffer e Modo Demo)
### 1. Contexto e Problemática (O Problema)
- Necessidade de alertar os gestores e engenheiros de campo imediatamente por e-mail quando o status de uma predição atinge níveis críticos em qualquer um dos 4 domínios (Manutenção, Demanda, Churn, Risco de Crédito). Adicionalmente, múltiplos disparos em sequência rápida (como upload de dados em lote ou simulações simultâneas) causavam infoxicação de comunicações repetidas, exigindo um mecanismo inteligente de consolidação/buffer temporal para agrupar as mensagens.

### 2. Solução Proposta e Fundamentação (O Desenvolvimento)
- Modificação da interface `/profile` adicionando a seção "Configuração de Notificações por E-mail", incluindo validação Regex rigorosa no endereço e chaves de ativação individual por domínio persistidas no `localStorage`.
- No `DomainContext`, interceptação de alertas críticos (`criticality === "high"`) no método `addAlert`.
- Criação de um mecanismo de agrupamento baseado em buffer temporal por domínio de 2 segundos. Se novos alertas entram na fila, o temporizador reinicia, agrupando as previsões críticas em uma única estrutura de e-mail.
- Desenvolvimento do componente `EmailNotificationsRenderer` para simular visualmente de forma premium o e-mail enviado com glassmorphism, badge por domínio, limiares, valores e marcas temporais no client-side.
- Inclusão do botão "Simular Disparo Crítico em Lote (Modo Demo)" no perfil para simular a concorrência e provar o correto funcionamento do agrupamento.
- Integração de log de envio de e-mails de notificação no Log de Auditoria Técnica global do sistema.

### 3. Impacto e Resultados Técnicos (A Conclusão)
- Otimização do tráfego de notificações via consolidação inteligente client-side, mitigando e-mails redundantes, além de plena auditoria técnica e rastreabilidade nos logs do sistema em conformidade com as regras operacionais.

---

## 📅 2026-06-27 — RF53 — Customização de Tema com Cores Personalizadas (Branding Corporativo e WCAG 2.1)
### 1. Contexto e Problemática (O Problema)
- Necessidade de customizar as cores da aplicação (destaque, sucesso, alertas) para que a interface reflita a identidade visual corporativa da organização, sem que elementos de contraste visual fiquem inelegíveis ou fora dos padrões mínimos de acessibilidade de software.

### 2. Solução Proposta e Fundamentação (O Desenvolvimento)
- Desenvolvimento do painel de customização de tema `ThemeCustomizer` sob a aba dedicada no perfil administrativo `/profile`, visível unicamente para Administradores.
- Implementação de seletores visuais de cores (color pickers) integrados a caixas de entrada hexadecimais, com atualização de visualização em tempo real (instant preview) de componentes chaves da aplicação.
- Criação de regras de sobrescrita e mapeamento global em `globals.css` utilizando variáveis CSS HSL injetadas no `:root` sob o atributo `data-custom-theme="true"` para reestilizar elementos contendo cores de Tailwind padrão.
- Algoritmo de validação de legibilidade em tempo real segundo padrões de acessibilidade WCAG 2.1 (AA), medindo a proporção de contraste em tempo real contra o fundo ativo e exibindo alertas destacados em caso de desconformidade (< 4.5:1).
- Suporte para salvar múltiplos temas personalizados no `localStorage`, exclusão e alternância ágil de temas visuais, além do botão de redefinição para restaurar os padrões visuais originais.
- Dispositivo de Modo Demo no perfil para carga de 4 presets corporativos pré-definidos (como Tech Blue e Warm Orange).
- Registro detalhado e rastreável de todas as ações de tema no Log de Auditoria do sistema (contendo data, hora, admin responsável e cores editadas).

### 3. Impacto e Resultados Técnicos (A Conclusão)
- Uniformidade estética em toda a aplicação sob branding corporativo sob demanda, mantendo controle rígido e auditável de acessibilidade e rastreamento em conformidade com as regras de governança visual corporativas.

---

## 📅 2026-06-27 — RF54 — Interface em Múltiplos Idiomas (Tradução Profissional e Contextual)
### 1. Contexto e Problemática (O Problema)
- Necessidade de tornar o sistema preditivo acessível a usuários internacionais ou preferentes de diferentes línguas (Português Brasileiro, Inglês e Espanhol), eliminando as barreiras linguísticas e garantindo precisão contextual no uso de terminologias técnicas de negócios.

### 2. Solução Proposta e Fundamentação (O Desenvolvimento)
- Criação e estruturação da base de dados de internacionalização em `src/lib/translations.ts` cobrindo o mapeamento de mais de 90 chaves e termos da interface.
- Acoplamento do suporte a idioma nativo e de funções dinâmicas de tradução (`language`, `setLanguage`, `t`, e `getDomainName`) no contexto global de estados (`DomainContext`).
- Implementação de um seletor dinâmico de idiomas no formato dropdown com bandeiras no cabeçalho principal (`header.tsx`) para acesso rápido e alta visibilidade, além da aba de configurações no Hub de Perfil Administrativo (`/profile`).
- Mapeamento e substituição de strings estáticas por referências multilíngues nas principais partes do sistema: Sidebar, Header, Profile (incluindo cartão de usuário, configurações de aparência e modo claro/escuro), e no Drawer de Utilidades (tabelas e detalhes de Logs de Auditoria, abas de Alertas Críticos, histórico e filtros de Previsões, além das exportações em CSV de dados consolidados).
- Inclusão do Modo Demo nas configurações de perfil para facilitar a alternância de tradução e testes de visualização instantâneos.
- Registro automático das ações de mudança de idioma no Log de Auditoria Técnica para plena conformidade e rastreabilidade de preferências.

### 3. Impacto e Resultados Técnicos (A Conclusão)
- Interface de usuário multilíngue ágil e responsiva, com cabeçalho traduzível e detecção dinâmica de módulos do domínio, reduzindo de forma drástica a fricção cognitiva e simplificando o fluxo de predição e auditoria para usuários globais sem dependência de extensões ou tradutores de terceiros.



