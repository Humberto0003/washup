# WashUp

WashUp é uma aplicação web para gestão de fila de atendimento em lava jato.

## Objetivo Acadêmico

O projeto foi desenvolvido como atividade acadêmica para demonstrar a criação
de uma aplicação front-end com Next.js, componentização, gerenciamento de estado,
consultas com TanStack Query, formulários validados e interface responsiva.

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
- Validação de formulário com schema.
- Avanço de veículos entre status da fila.
- Toasts de sucesso para ações do usuário.
- Página de clientes.
- Página de fidelidade com simulação de resgate.
- Página pública de acompanhamento da fila.
- Layout responsivo para diferentes tamanhos de tela.

## Rotas Principais

- `/`: tela inicial/login.
- `/acompanhamento/clientes`: fila pública do cliente.
- `/acompanhamento/operacional`: área operacional protegida.
- `/clientes`: clientes, protegido.
- `/fidelidade`: fidelidade, protegido.

## Observação Sobre os Dados

Nesta etapa, o WashUp não possui backend, banco de dados, Prisma, API real ou
autenticação. Todos os dados são mockados no front-end e persistidos localmente
com `localStorage`.

## Como Instalar e Executar

Instale as dependências:

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

Para gerar a build de produção:

```bash
npm run build
```

## Deploy na Vercel

Link do deploy:

```text
https://washup-roan.vercel.app/
```

## Repositório GitHub

Link do repositório:

```text
https://github.com/Humberto0003/washup
```
