# Sistema de Gestão de Eventos Acadêmicos

> Plataforma fullstack para gestão de eventos acadêmicos com múltiplos perfis de acesso, check-in via QR Code e emissão automática de certificados.

🔗 **Deploy:** [sistema-de-gestao-de-eventos.vercel.app](https://sistema-de-gestao-de-eventos.vercel.app)

---

## ✨ Funcionalidades

- **3 perfis de acesso** — Diretor, Coordenador e Aluno, com permissões distintas
- **Check-in via QR Code** — geração e leitura de QR Code para entrada nos eventos
- **Check-out registrado** — controle de saída para validação de presença
- **Certificados automáticos** — geração de certificado digital ao confirmar presença completa
- **Cadastro de alunos** — sistema de registro e autenticação
- **Painel administrativo** — gerenciamento de eventos, inscrições e participantes

---

## 🛠️ Stack

| Tecnologia | Uso |
|---|---|
| Next.js 14 | Framework principal, SSR e roteamento |
| React | Componentização da interface |
| TypeScript | Tipagem estática |
| Tailwind CSS | Estilização utilitária |
| Prisma | ORM e modelagem do banco de dados |
| Supabase | Banco de dados PostgreSQL e storage |

---

## 📁 Estrutura do Projeto

```
Sistema-de-Gestao-de-Eventos/
├── app/
│   ├── api/             # Rotas da API (Next.js API Routes)
│   ├── cadastro/        # Tela de cadastro de alunos
│   ├── dashboard/       # Painel administrativo
│   ├── login/           # Autenticação
│   ├── layout.tsx       # Layout global e metadata
│   └── page.tsx         # Página inicial
├── lib/                 # Configuração do Prisma e Supabase
├── prisma/
│   └── schema.prisma    # Modelagem do banco de dados
└── public/              # Assets estáticos
```

---

## 🗄️ Modelo de Dados

```prisma
// Perfis de acesso
enum Role {
  DIRETOR
  COORDENADOR
  ALUNO
}

// Principais entidades
- Usuario (id, nome, email, senha, role)
- Evento (id, titulo, data, local, descricao)
- Inscricao (id, usuarioId, eventoId, qrCode)
- Presenca (id, inscricaoId, checkIn, checkOut)
- Certificado (id, inscricaoId, emitidoEm)
```

---

## 🚀 Rodando localmente

```bash
# Clone o repositório
git clone https://github.com/Robert-739/Sistema-de-Gestao-de-Eventos.git

# Instale as dependências
npm install

# Configure as variáveis de ambiente
cp .env.example .env.local
# Preencha com suas credenciais do Supabase

# Execute as migrations do banco
npx prisma migrate dev

# Rode o servidor de desenvolvimento
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000) no navegador.

---

## 🔐 Variáveis de Ambiente

```env
DATABASE_URL=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

---

## 📌 Contexto

Projeto desenvolvido como trabalho acadêmico no curso de Tecnólogo em Análise e Desenvolvimento de Sistemas — Faculdades Integradas Einstein de Limeira.

---

Desenvolvido por [Robert Pereira](https://github.com/Robert-739)
