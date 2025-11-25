# Aula 13 - Escalabilidade com Websockets e Filas <a name="unifaat-frontend-project"></a>

## 📑 Sumário

- [Instalação e Execução](#instalacao-e-execucao)
- [Acesse](#acesse)
- [🚀 Como Criar Elementos](#como-criar-elementos)
  - [🧩 Criar uma Rota](#criar-uma-rota)
  - [📦 Criar um Controller](#criar-um-controller)
  - [⛓️ Criar um Middleware](#criar-um-middleware)
  - [💻 Criar um Command](#criar-um-command)
  - [📦 Migrations do Projeto](#migrations)
  - [🌱 Seeds do Projeto](#seeds)
- [📦 Bibliotecas Utilizadas](#bibliotecas-utilizadas)
- [📁 Estrutura de Diretórios (raiz)](#estrutura-de-diretorios-raiz)
- [🧾 Como Criar um Novo Documento Swagger](#swagger)
- [🐳 Containers e Imagens Docker](#containers-e-imagens-docker)

---

## Instalação e Execução <a name="instalacao-e-execucao"></a>

### Siga os passos abaixo para rodar o projeto via Docker:

1. Clonar o repositório:

   ```sh
   git clone https://github.com/luan-tavares/unifaat-frontend-project
   ```

2. Entrar na pasta do projeto:

   ```sh
   cd unifaat-frontend-project
   ```

3. Criar o arquivo `.env` na raiz do projeto copiando o `.env.example`:

   > No Windows:

   ```sh
   copy .env.example .env
   ```

   > No Linux:

   ```sh
   cp .env.example .env
   ```

4. Abrir o arquivo `.env` recém criado e preencher os campos abaixo:

   ```env
   POSTGRES_PASSWORD=123456
   JWT_SECRET=segredo
   ```

5. Instalar as dependências:

   ```sh
   npm install
   ```

6. Em um novo terminal, executar o pré-compilador

   ```sh
   npm run watch
   ```

7. Subir a aplicação com Docker Compose:

   > Docker Compose tradicional:

   ```sh
   docker-compose up --build
   ```

   > Docker Compose moderno:

   ```sh
   docker compose up --build
   ```

8. Executar as migrations utilizando UM desses comandos:

   > Container (Docker Compose tradicional):

   ```sh
   docker-compose run --rm nodecli-container migrate
   ```

   > Container (Docker Compose moderno):

   ```sh
   docker compose run --rm nodecli-container migrate
   ```

   > Host:

   ```sh
   node command migrate
   ```

9. Executar as seeds utilizando UM desses comandos:

   > Container (Docker Compose tradicional):

   ```sh
   docker-compose run --rm nodecli-container seed
   ```

   > Container (Docker Compose moderno):

   ```sh
   docker compose run --rm nodecli-container seed
   ```

   > Host:

   ```sh
   node command seed
   ```

10. Instalar vite globalmente no host e executar (opcional)

   ```sh
   npm install -g vite
   ```
   ```sh
   vite
   ```
---

## Acesse <a name="acesse"></a>

- Servidor nginx: [http://localhost:8080](http://localhost:8080)
- Documentação da API: [http://localhost:8080/docs](http://localhost:8080/docs)
- Servidor Vite: [http://localhost:5173](http://localhost:5173)


**Importante:** O arquivo `./Insomnia.yml` DEVE ser utilizado no Insomnia para testar as rotas.

---

## 🚀 Como Criar Elementos <a name="como-criar-elementos"></a>

### 🧩 Criar uma Rota <a name="criar-uma-rota"></a>

1. Defina o path da rota em `routes/web.js` ou `routes/api.js`
2. Associe um controller da `app/Http/Controllers/`

Exemplo (`routes/api.js`):
```js
router.get('/exemplo', MeuController);
```

### 📦 Criar um Controller <a name="criar-um-controller"></a>

1. Crie um novo arquivo em `app/Http/Controllers/...`

```js
export default async function(request, response) {
  ...
  # Minha Lógica
  ...
  response.status(200).json({"success": "Minha resposta"});
}
```

### ⛓️ Criar um Middleware <a name="criar-um-middleware"></a>

Adicione em `app/Http/Middlewares/`, por exemplo:

```js
export default async function (request, response, next) {
  console.log(`[${request.method}] ${request.url}`);
  next();
}
```

Depois registre na rota.


### 💻 Criar um Command <a name="criar-um-command"></a>

1. Crie um arquivo em `app/Commands/NomeDoCommand.js`:

```js
export default {
    name: 'nome-comando',
    description: 'minha descrição',
    arguments: {
        ...
    },

    handle: async function ({ argument1 }) {
        console.log(argument1);
        ...
        # Minha lógica
        ...
    }
}
```

2. Execute via terminal:

```sh
node command meu-comando
```

---

### 📦 Migrations do Projeto <a name="migrations"></a>

As migrations deste projeto são responsáveis por versionar a estrutura do banco de dados de forma incremental e ordenada por data.

#### 📁 Localização

Todos os arquivos de migrations ficam em:

```
./database/migrations
```

#### 📄 Formato do Arquivo

Cada migration segue o seguinte padrão de nomenclatura:

```
YYYY_MM_DD_HH_MM_SS_nome_descritivo.js
```

Exemplo:

```
2025_06_07_00_00_00_create_roles_table.js
```

#### 🧬 Estrutura do Código

Cada migration exporta dois métodos assíncronos: `up()` e `down()`.
```js
import db from '../../config/db.js';

async function up() {
  await db.query(`
    CREATE TABLE IF NOT EXISTS roles (
        id SERIAL PRIMARY KEY,
        nome VARCHAR(155) UNIQUE NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `);
}

async function down() {
  await db.query(`DROP TABLE roles;`);
}

export default { up, down };
```

#### 🛠 Como Criar uma Nova Migration

1. **Defina um nome descritivo e a hora atual no início**  
2. **Implemente as funções `up()` e `down()`**  
3. **Salve o arquivo em `./database/migrations`**

#### 🚀 Execução das Migrations

A execução é feita via CLI e respeita a ordem de timestamp.

#### ✅ Boas Práticas

- Uma migration por alteração
- Sempre implemente `down()`
- Não altere migrations antigas

---

### 🌱 Seeds do Projeto <a name="seeds"></a>

Seeds são scripts responsáveis por popular o banco de dados com dados iniciais ou de teste.

#### 📁 Localização

```
./database/seeds/
```

#### 🧾 Nome do Arquivo

```
001_roles_and_users.js
002_outra_seed.js
...
```

#### 🧬 Estrutura do Arquivo

```js
import bcrypt from 'bcrypt';
import UserModel from '../../app/Models/UserModel.js';

export default {
    up: async () => {

        const senha = "123456";

        await UserModel.bulkCreate([
            { nome: 'User1', email: 'user1@example.com', id_role: rows[0].id, senha: await bcrypt.hash(senha, 10) },
            { nome: 'User2', email: 'user2@example.com', id_role: rows[1].id, senha: await bcrypt.hash(senha, 10) },
        ])
    },

    down: async () => {
        await UserModel.destroy({
            where: {
                email: ['user1@example.com', 'user2@example.com']
            }
        });

       
    }
};
```

#### ⚠️ Importante

Execute as migrations antes das seeds.

#### 🚀 Execução das Seeds

Ordena os arquivos e executa `up()`, com suporte a rollback via `down()`.

#### ✅ Boas Práticas

- Escopo pequeno por seed
- Sempre implemente `down()`
- Não reutilize emails/names
- Não use em lógica de produção


---

## 📦 Bibliotecas Utilizadas <a name="bibliotecas-utilizadas"></a>

| Biblioteca            | Finalidade                                                                 |
|-----------------------|----------------------------------------------------------------------------|
| `express`             | Framework web para Node.js usado para criar APIs e servidores HTTP.        |
| `chalk`               | Biblioteca para estilizar saídas no terminal com cores e ênfases.          |
| `dotenv`              | Carrega variáveis de ambiente de um arquivo `.env` para `process.env`.     |
| `pg`                  | Cliente PostgreSQL para Node.js, usado para conexão e execução de queries. |
| `sequelize`           | ORM (Object-Relational Mapping) para trabalhar com bancos relacionais.     |
| `jsonwebtoken`        | Geração e verificação de tokens JWT para autenticação.                     |
| `bcrypt`              | Criptografia e comparação de senhas com hash seguro.                       |
| `swagger-jsdoc`       | Gera especificações Swagger a partir de JSDoc nos comentários do código.   |
| `swagger-ui-express`  | Middleware que serve a UI do Swagger para documentar e testar APIs.        |
| `express-fileupload`  | Middleware para lidar com upload de arquivos via `multipart/form-data`.    |
| `minimist`            | Faz o parsing de argumentos de linha de comando.                           |
| `cli-table3`          | Cria tabelas formatadas para exibição no terminal.                         |
| `axios`               | Cliente HTTP para fazer requisições a APIs externas.                       |
| `amqplib`             | Biblioteca cliente para comunicação com RabbitMQ via protocolo AMQP.       |
| `nodemon`             | Ferramenta que reinicia automaticamente a aplicação ao detectar mudanças.  |
| `vite`                | servidor de desenvolvimento e bundler com HMR (Hot Module Replacement) para projetos web modernos; inicializa rápido e recarrega as mudanças instantaneamente.  |

---

## 📁 Estrutura de Diretórios (raiz) <a name="estrutura-de-diretorios-raiz"></a>

| Caminho / Pasta             | Descrição                                                                                                 |
|-----------------------------|-----------------------------------------------------------------------------------------------------------|
| `app/`                      | Lógica principal da aplicação organizada por domínio.                                                     |
| `app/Commands/`             | Comandos CLI como `migrate`, `seed`, `dispatch`, executados com `node command <comando>`.                |
| `app/Http/`                 | Código relacionado as requisições HTTP.                                                                   |
| `app/Http/Controllers/`     | Controllers que lidam com requisições e respostas das rotas.                                              |
| `app/Http/Middlewares/`     | Middlewares como autenticação, validação e logger HTTP.                                                   |
| `app/Models/`               | Models Sequelize que representam e manipulam tabelas do banco de dados.                                  |
| `bootstrap/`                | Inicializações específicas do projeto, como setup global de helpers, constantes e variáveis de ambiente.  |
| `config/`                   | Arquivos de configuração para serviços como RabbitMQ, Postgres, JWT, Sequelize, Swagger, etc.             |
| `Core/`                     | Núcleo do sistema, como se fosse uma lib interna criada por nós mesmos.                                   |
| `database/migrations/`      | Scripts de criação/modificação de tabelas versionados.                                                    |
| `database/seeds/`           | Scripts para popular dados iniciais no banco.                                                             |
| `docker/`                   | Dockerfiles específicos para cada serviço da aplicação.                                                   |
| `docs/`                     | (Opcional) Documentação de APIs Swagger em JSON.                                                          |
| `node_modules/`             | Pacotes npm instalados automaticamente.                                                                   |
| `public/`                   | Arquivos públicos (como `index.html`) servidos diretamente por HTTP.                                      |
| `routes/`                   | Arquivos de definição de rotas, geralmente organizados por entidade.                                      |
| `storage/`                  | Uploads, arquivos temporários ou pastas auxiliares da aplicação.                                          |
| `.env`                      | Variáveis de ambiente sensíveis carregadas em tempo de execução.                                          |
| `.env.example`              | Template de `.env` para novos devs copiarem e configurarem.                                               |
| `.gitignore`                | Lista de arquivos e pastas que o Git deve ignorar.                                                        |
| `command`                   | Entry point dos comandos CLI (`node command ...`).                                                        |
| `docker-compose.yml`        | Arquivo de orquestração dos containers (web, worker, postgres, rabbit, etc).                             |
| `Insomnia.yaml`             | Export das rotas da API para importar no Insomnia.                                                        |
| `package.json`              | Lista de dependências, scripts npm e metadados do projeto.                                                |
| `package-lock.json`         | Trava exata das versões das dependências instaladas.                                                      |
| `readme.md`                 | Documentação principal do projeto (este arquivo).                                                         |
| `server.js`                 | Entry point HTTP da aplicação. Sobe o Express e inicializa a API.                                         |

---

## 🧾 Como Criar um Novo Documento Swagger<a name="swagger"></a>

Este projeto utiliza o Swagger para documentar a API de forma modular. Cada grupo de endpoints possui um arquivo `.js` dentro do diretório `docs/`, e todos são unidos dinamicamente pelo `SwaggerCore`.

### 🗂 Estrutura esperada

```
docs/
├── 01-loginDoc.js
├── 02-colaboradorDoc.js
├── ...
```

### 🧑‍💻 Criando um novo arquivo de documentação

1. **Nomeie o arquivo com prefixo numérico e sufixo `Doc.js`**  
2. **Exporte um objeto no formato OpenAPI (Swagger 3.0)**  
3. **Salvar o arquivo em `./docs/`**
4. **O Swagger será montado automaticamente**

---

## 🐳 Containers e Imagens Docker <a name="containers-e-imagens-docker"></a>

### 🔧 Containers da Aplicação

| Container               | Dockerfile                             | Função                                                                 | Porta Interna |
|-------------------------|-----------------------------------------|------------------------------------------------------------------------|-------|
| `nodeweb-container`     | `docker/node24-web/Dockerfile.dev`        | API HTTP principal (`server.js`). | 3000 |
| `nodecli-container`     | `docker/node24-cli/Dockerfile`            | Executa comandos como `migrate`, `seed`, `dispatch`. Container efêmero. | - |
| `nodevitehmr-container`     | `docker/node24-vite-hmr/Dockerfile`            | Servidor HMR Vite | 5173 |
| `nodevitecompiler-container`     | `docker/node24-vite-compiler/Dockerfile`            | Pré-Compilador JS |

### 🗄️ Containers de Infraestrutura

| Container              | Imagem Base               | Função                                                                 | Porta Interna |
|------------------------|---------------------------|------------------------------------------------------------------------|---------------|
| `postgres-container`   | `postgres:15`             | Banco de dados PostgreSQL usado pela aplicação.                        | 5432      |
| `nginx-container`      | `nginx:1.25-alpine`       | Proxy reverso que expõe a API HTTP para fora.                          | 80      |

### 💾 Volumes Persistentes

| Volume                         | Utilizado por                      | Finalidade                                          |
|--------------------------------|------------------------------------|-----------------------------------------------------|
| `nodemodules-aula04-volume` | `nodeweb`, `nodecli`, `nodevite`  | Evita reinstalação de dependências a cada build     |
| `pgdata-aula04-volume`| `postgres-container`                | Persistência dos dados do banco PostgreSQL          |

### 🌐 Redes

Todos os containers estão conectados à rede Docker personalizada:

```
app-network
```

### 🌍 Portas Expostas Externamente

| Serviço     | Porta Interna | Porta Externa | Acesso Externo                      |
|-------------|----------------|----------------|-------------------------------------|
| NGINX       | 80             | **8080**       | http://localhost:8080               |
| PostgreSQL  | 5432           | **6789**       | usado por clients (beekeeper, dbeaver, ...)/ORM/CLI               |
| Node Vite HMR    | 5173    | **5173** | http://localhost:5173  |
