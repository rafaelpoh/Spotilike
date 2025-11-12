# Spotilike

![image](https://github.com/user-attachments/assets/2e6a8a75-63cd-4a4b-9d72-69877fd65839)

## :clipboard: Sobre o Projeto
Spotilike é uma aplicação web que simula a interface do Spotify. Este projeto foi desenvolvido como parte da imersão Front-End da Alura e evoluiu para uma arquitetura mais completa, incluindo um backend dedicado e uma interface moderna com React.

O projeto é dividido em três partes principais:
1.  **Interface Original:** Uma implementação inicial feita com HTML, CSS e JavaScript puros.
2.  **Backend:** Um servidor Node.js usando Express para fornecer dados, como informações de artistas.
3.  **Spotilike-React:** Uma versão mais robusta e escalável da interface, construída com React.

## ✨ Features
- **Interface Inspirada no Spotify:** Design familiar e intuitivo.
- **Pesquisa de Artistas:** Funcionalidade de busca para encontrar artistas.
- **Playlists:** Seções de playlists pré-definidas.
- **Responsividade:** Layout adaptável para diferentes tamanhos de tela.

## :computer: Tecnologias utilizadas
- **Frontend (Original):**
  - HTML5
  - CSS3
  - JavaScript
- **Frontend (Moderno):**
  - React
- **Backend:**
  - Node.js
  - Express.js
  - Cors
- **Ícones:**
  - [Font Awesome](https://fontawesome.com/)

## 🚀 Como Executar
Siga as instruções abaixo para executar cada parte do projeto.

### 1. Backend
O servidor é responsável por fornecer os dados para as aplicações frontend.
```bash
# 1. Navegue até a pasta do backend
cd backend

# 2. Instale as dependências
npm install

# 3. Inicie o servidor
npm start
```
O servidor estará rodando em `http://localhost:3000`.

### 2. Spotilike-React
A nova interface construída com React.
```bash
# 1. Navegue até a pasta do projeto React
cd spotilike-react

# 2. Instale as dependências
npm install

# 3. Inicie a aplicação
npm start
```
A aplicação React estará disponível em `http://localhost:3001` (ou outra porta, se a 3001 estiver em uso).

### 3. Interface Original (Vanilla JS)
Para executar a versão original do projeto, basta abrir o arquivo `index.html` no seu navegador.
```bash
# Abra o arquivo `index.html` na raiz do projeto.
```

## 📂 Estrutura do Projeto
```
c:\Dev\Spotilike\
├───.gitignore
├───busca.js
├───config.js
├───index.html
├───package-lock.json
├───package.json
├───player.js
├───README.md
├───script.js
├───spotify-api.js
├───.git\
├───api-artists\
│   └───artists.json
├───backend\
│   ├───.gitignore
│   ├───package-lock.json
│   ├───package.json
│   └───server.js
├───spotilike-react\
│   ├───.gitignore
│   ├───package-lock.json
│   ├───package.json
│   ├───README.md
│   ├───public\
│   └───src\
└───src\
    ├───imagens\
    │   ├───icons\
    │   └───playlist\
    └───styles\
        ├───reset.css
        ├───skin.css
        └───vars.css
```
