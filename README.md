
# 📚 Sistema de Documentação de Projetos

Um sistema completo de gerenciamento de conteúdo para projetos técnicos, construído com React e Express.js. Permite que administradores criem, editem e gerenciem documentação de projetos enquanto oferece uma interface pública elegante para navegação.

## ✨ Características

### 🎯 Para Administradores
- **Editor de Markdown** com preview em tempo real
- **Gerenciamento de categorias** e ferramentas
- **Upload de imagens** integrado com Supabase
- **Sistema de rascunhos/publicação**
- **Painel administrativo** completo com estatísticas
- **Autenticação segura** com sessões

### 🌐 Para Usuários
- **Interface pública** responsiva e moderna
- **Navegação intuitiva** por categorias e ferramentas
- **URLs amigáveis** com slugs SEO-friendly
- **Visualização rica** de conteúdo em markdown
- **Design adaptativo** para todos os dispositivos

## 🛠️ Tecnologias Utilizadas

### Frontend
- **React 18** com TypeScript
- **Vite** para desenvolvimento rápido
- **Tailwind CSS** para estilização
- **shadcn/ui** componentes baseados em Radix UI
- **TanStack React Query** para gerenciamento de estado
- **React Hook Form** + Zod para formulários
- **Wouter** para roteamento

### Backend
- **Express.js** com TypeScript
- **Drizzle ORM** com PostgreSQL
- **bcrypt** para hash de senhas
- **express-session** para autenticação
- **Zod** para validação de schemas

### Infraestrutura
- **PostgreSQL** (Neon Database)
- **Supabase Storage** para arquivos
- **Replit** para hospedagem

## 🚀 Começando

### Pré-requisitos
- Node.js 20+
- PostgreSQL (ou conta no Neon)
- Conta no Supabase (para storage)

### Instalação

1. **Clone o repositório**
```bash
git clone <url-do-repositorio>
cd projeto-documentacao
```

2. **Instale as dependências**
```bash
npm install
```

3. **Configure as variáveis de ambiente**
```bash
cp .env.example .env
```

Edite o arquivo `.env` com suas configurações:
```env
DATABASE_URL="postgresql://..."
SESSION_SECRET="sua-chave-secreta"
VITE_SUPABASE_URL="https://..."
VITE_SUPABASE_ANON_KEY="..."
```

4. **Configure o banco de dados**
```bash
npm run db:push
```

5. **Inicie o servidor de desenvolvimento**
```bash
npm run dev
```

6. **Configure o sistema**
Acesse `http://localhost:5000/api/setup` para criar o usuário admin inicial.

Credenciais padrão:
- **Email:** admin@sistema.com
- **Senha:** admin123

## 📁 Estrutura do Projeto

```
├── client/                 # Frontend React
│   ├── src/
│   │   ├── components/     # Componentes React
│   │   ├── pages/          # Páginas da aplicação
│   │   ├── hooks/          # Hooks customizados
│   │   └── lib/            # Utilitários
├── server/                 # Backend Express
│   ├── routes.ts           # Rotas da API
│   ├── storage.ts          # Camada de dados
│   └── index.ts            # Servidor principal
├── shared/                 # Código compartilhado
│   └── schema.ts           # Schemas Zod/Drizzle
└── scripts/                # Scripts utilitários
```

## 🔧 Scripts Disponíveis

```bash
npm run dev      # Inicia o servidor de desenvolvimento
npm run build    # Constrói para produção
npm start        # Inicia o servidor de produção
npm run check    # Verifica tipos TypeScript
npm run db:push  # Aplica mudanças no banco
```

## 📱 Funcionalidades Principais

### Gerenciamento de Projetos
- ✅ Criação e edição com markdown
- ✅ Sistema de categorias e tags
- ✅ Upload e gerenciamento de imagens
- ✅ Status de rascunho/publicado
- ✅ Links externos personalizáveis

### Interface Administrativa
- ✅ Dashboard com estatísticas
- ✅ Gerenciamento de categorias
- ✅ Gerenciamento de ferramentas
- ✅ Configurações do sistema
- ✅ Backup e exportação

### Interface Pública
- ✅ Listagem responsiva de projetos
- ✅ Visualização detalhada
- ✅ Filtros por categoria/ferramenta
- ✅ URLs SEO-friendly

## 🎨 Personalização

O sistema utiliza CSS variables para temas e é totalmente customizável através do Tailwind CSS. Os componentes seguem o design system do shadcn/ui.

## 🔐 Segurança

- Autenticação baseada em sessões
- Hash de senhas com bcrypt
- Validação de dados com Zod
- Proteção CSRF automática
- Headers de segurança configurados

## 📄 API

### Endpoints Principais

- `GET /api/projects/public` - Lista projetos públicos
- `GET /api/projects/:id` - Detalhes de um projeto
- `POST /api/projects` - Cria novo projeto (admin)
- `GET /api/categories` - Lista categorias
- `GET /api/tools` - Lista ferramentas

## 🤝 Contribuindo

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 🆘 Suporte

Se você encontrar algum problema ou tiver dúvidas:

1. Verifique a [documentação](replit.md)
2. Procure por issues similares
3. Abra uma nova issue se necessário

---

<p align="center">
  Feito com ❤️ usando React e Express.js
</p>
