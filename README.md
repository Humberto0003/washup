# WashUp

WashUp e uma aplicacao web para gestao de fila de atendimento em lava jato.

## Objetivo Academico

O projeto foi desenvolvido como atividade academica para demonstrar a criacao
de uma aplicacao front-end com Next.js, componentizacao, gerenciamento de estado,
consultas com TanStack Query, formularios validados e interface responsiva.

## Tecnologias Utilizadas

- Next.js
- React
- TypeScript
- Tailwind CSS
- TanStack Query
- React Hook Form
- Yup
- React Toastify

## Funcionalidades Implementadas

- Dashboard principal com cards de resumo.
- Kanban com as etapas Aguardando, Em Lavagem e Finalizado.
- Cadastro de novo atendimento por modal.
- Validacao de formulario com schema.
- Avanco de veiculos entre status da fila.
- Toasts de sucesso para acoes do usuario.
- Pagina de clientes.
- Pagina de fidelidade com simulacao de resgate.
- Pagina publica de acompanhamento da fila.
- Layout responsivo para diferentes tamanhos de tela.

## Rotas Principais

- `/`: tela inicial/login.
- `/acompanhamento/clientes`: fila publica do cliente.
- `/acompanhamento/operacional`: area operacional protegida.
- `/clientes`: clientes, protegido.
- `/fidelidade`: fidelidade, protegido.

## Observacao Sobre os Dados

Nesta etapa, o WashUp nao possui backend, banco de dados, Prisma, API real ou
autenticacao. Todos os dados sao mockados no front-end e persistidos localmente
com `localStorage`.

## Como Instalar e Executar

Instale as dependencias:

```bash
npm install
```

Execute o servidor de desenvolvimento:

```bash
npm run dev
```

Acesse no navegador:

```bash
http://localhost:3000
```

Para gerar a build de producao:

```bash
npm run build
```

## Deploy na Vercel

Link do deploy:

```text

```

## Repositorio GitHub

Link do repositorio:

```text

```
