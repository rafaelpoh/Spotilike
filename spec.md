# Project Specification & Development Rules (spec.md)

Este arquivo define os padrões de código, estrutura, segurança e comportamento esperados para este projeto. Ele deve ser lido e seguido estritamente pelo assistente de IA (Gemini) e pelos desenvolvedores.

## 1. Stack Tecnológico & Limitações

- **Linguagem:** JavaScript (Vanilla ES6+).
- **Marcação:** HTML5 Semântico.
- **Estilização:** CSS3.
- **Restrição Absoluta:** NÃO utilizar frameworks (React, Vue, Angular), bibliotecas de UI (Bootstrap, Tailwind) ou jQuery.
- **Gerenciamento de Pacotes:** Evitar dependências npm desnecessárias.

## 2. Estrutura de Diretórios e Arquivos

O assistente deve identificar o tipo de projeto e aplicar a estrutura correspondente:

### A. Projetos Web Padrão (Sites/Apps)

```text
/ (root)
├── index.html          # Ponto de entrada
├── spec.md             # Regras
├── /assets             # Imagens, ícones
├── /css                # Estilos
│   ├── reset.css       # Reset CSS
│   ├── var.css         # Variáveis (:root)
│   └── skin.css        # Layout e visual
└── /js                 # Lógica
    ├── main.js         # Entry point
    └── utils.js        # Helpers reutilizáveis
B. Extensões de Navegador (Manifest V3)
Plaintext

/ (root)
├── manifest.json       # Configuração Obrigatória
├── spec.md             # Regras
├── /icons              # Ícones da loja (16, 48, 128)
├── /_locales           # Internacionalização (se necessário)
├── /css                # Estilos Compartilhados
│   ├── reset.css
│   └── var.css
├── /lib                # Scripts Compartilhados
│   └── utils.js        # Helpers (com suporte a Promises)
├── /popup              # Interface da Extensão
│   ├── popup.html
│   ├── popup.css
│   └── popup.js
├── /options            # Página de Configurações
│   ├── options.html
│   ├── options.css
│   └── options.js
├── /background         # Service Workers
│   └── service-worker.js
└── /content            # Scripts Injetados
    ├── content.js
    └── content.css

```

3. Padrões de Código & Qualidade (Clean Code)
   3.1 JavaScript
   Modularização: Utilize import e export (ES Modules) para separar responsabilidades. Não escreva todo o código em um único arquivo gigante.

Nomenclatura:

Variáveis e Funções: camelCase (ex: toggleModal, userData).

Constantes: UPPER_SNAKE_CASE (ex: API_BASE_URL, MAX_RETRY_COUNT).

Classes (se usadas): PascalCase.

Princípio DRY (Don't Repeat Yourself): Se uma lógica for usada mais de duas vezes, extraia para utils.js.

Evitar Poluição Global: Não declare variáveis no escopo global (window). Use escopos de bloco ou módulos.

3.2 HTML & Acessibilidade (A11y)
Semântica: Use <header>, <main>, <footer>, <nav>, <article> em vez de <div> genéricas.

Ações: Botões (<button>) são para ações; Links (<a>) são para navegação. Não confunda os dois.

Mídia: Imagens devem conter atributo alt.

Formulários: Todo <input> deve ter um <label> associado via atributo for e id.

Ordem de Carregamento (Crítico): O CSS deve ser linkado no <head> estritamente nesta ordem:

reset.css (Limpa estilos do navegador)

var.css (Define as variáveis)

skin.css (Aplica o estilo do projeto)

Scripts: No final do <body> ou com atributo defer.

3.3 CSS
Metodologia: Mantenha o CSS plano (evite aninhamento excessivo).

Nomenclatura: Prefira nomes de classes descritivos e semânticos (ex: .card-profile, .btn-primary).

Responsividade: Mobile-first. Use @media (min-width: ...) para telas maiores.
Arquivos:

reset.css: Um reset moderno (ex: Eric Meyer's ou similar minimalista) para remover margens e paddings padrão.

var.css: Contém EXCLUSIVAMENTE as variáveis CSS no escopo :root (cores, fontes, espaçamentos). Nenhuma regra de layout deve estar aqui.

skin.css: Contém as regras de visual, layout e media queries.

Uso de Variáveis: Nunca use cores hexadecimais ou pixels arbitrários diretamente em skin.css. Sempre consuma as variáveis definidas em var.css (ex: color: var(--primary-color)).

4. Segurança (Crítico)
   Prevenção de XSS (Cross-Site Scripting):

PROIBIDO: O uso de innerHTML para renderizar dados vindos de inputs do usuário ou APIs externas.

OBRIGATÓRIO: Use textContent ou innerText para textos.

CRIAÇÃO DOM: Para elementos complexos, use document.createElement(), configure atributos e faça appendChild().

Validação de Input: Nunca confie no input do usuário. Valide tipos e formatos antes de processar qualquer lógica.

Dados Sensíveis: Nunca commitar chaves de API, tokens ou credenciais no código fonte.

5. Performance
   DOM Caching: Armazene referências a elementos do DOM em variáveis (const btn = document.querySelector(...)) fora de loops ou funções de eventos repetitivos.

Event Delegation: Ao manipular listas (ex: <ul>), adicione o listener no elemento pai e identifique o alvo via event.target, ao invés de adicionar um listener para cada <li>.

Scripts: Carregue scripts com o atributo defer ou no final do <body> para não bloquear a renderização inicial.

6. Regras Específicas para Extensões (Manifest V3)
   Aplicável apenas se o projeto for do tipo B:

Storage: Use chrome.storage.local em vez de localStorage.

Background: Lembre-se que Service Workers são efêmeros (não persistem variáveis globais).

Isolamento: Em Content Scripts, use prefixos em classes CSS ou Shadow DOM para não quebrar o site hospedeiro.

Comunicação: Use mensagens padronizadas: { action: 'ACAO', data: {} }.

7. Meta-Instruções para o Assistente AI

Leitura de Estilo: Ao criar novos estilos, sempre verifique primeiro o arquivo var.css para reutilizar as variáveis existentes. Se uma nova cor for necessária, sugira a adição dela em var.css primeiro.
Geração de HTML: Ao criar o esqueleto HTML, certifique-se de incluir os links na ordem exata:

HTML

<link rel="stylesheet" href="css/reset.css">
<link rel="stylesheet" href="css/var.css">
<link rel="stylesheet" href="css/skin.css">

Análise Prévia: Antes de gerar qualquer código, verifique se a solução proposta viola alguma regra de segurança (especialmente a regra 4).
Validação: Verifique se nenhuma regra de segurança (especialmente innerHTML) foi violada antes de entregar a resposta.
Verificação de Contexto: Antes de criar uma nova função, verifique se algo similar já não existe em utils.js para evitar redundância.
Saída: Ao fornecer código, priorize a estrutura de arquivos definida na seção 2. Se o código for longo, instrua onde cada parte deve ser salva.

8. Git & Versionamento
   Autonomia Zero: O assistente está estritamente proibido de realizar commits, pushs ou quaisquer alterações diretas no repositório git por conta própria.

Sugestões: O assistente pode sugerir mensagens de commit ou comandos git para o usuário executar no terminal, mas a execução final é responsabilidade exclusiva do usuário.
