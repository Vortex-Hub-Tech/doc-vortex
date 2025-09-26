import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertCategorySchema, insertToolSchema, insertProjectSchema } from "@shared/schema";
import bcrypt from "bcrypt";
import session from "express-session";
import "./types";

export async function registerRoutes(app: Express): Promise<Server> {
  // Session configuration
  app.use(session({
    secret: process.env.SESSION_SECRET || "fallback-secret-key",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false, // Set to true in production with HTTPS
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    }
  }));

  // Auth middleware
  const requireAuth = (req: any, res: any, next: any) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Não autorizado" });
    }
    next();
  };

  // Auth routes
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ message: "Email e senha são obrigatórios" });
      }

      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ message: "Credenciais inválidas" });
      }

      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: "Credenciais inválidas" });
      }

      req.session.userId = user.id;
      res.json({ user: { id: user.id, email: user.email } });
    } catch (error) {
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  app.post("/api/auth/register", async (req, res) => {
    try {
      const validatedData = insertUserSchema.parse(req.body);
      const hashedPassword = await bcrypt.hash(validatedData.password, 10);
      
      const user = await storage.createUser({
        ...validatedData,
        password: hashedPassword
      });

      res.status(201).json({ user: { id: user.id, email: user.email } });
    } catch (error) {
      if (error instanceof Error && error.message.includes("unique")) {
        return res.status(409).json({ message: "Email já está em uso" });
      }
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Erro ao fazer logout" });
      }
      res.clearCookie('connect.sid');
      res.json({ message: "Logout realizado com sucesso" });
    });
  });

  app.get("/api/auth/me", requireAuth, async (req, res) => {
    try {
      const user = await storage.getUser(req.session.userId!);
      if (!user) {
        return res.status(404).json({ message: "Usuário não encontrado" });
      }
      res.json({ user: { id: user.id, email: user.email } });
    } catch (error) {
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  // Setup endpoint - create first admin user
  app.post("/api/setup", async (req, res) => {
    try {
      // Check if any users exist
      const existingUsers = await storage.getUserByEmail("admin@sistema.com");
      if (existingUsers) {
        return res.status(409).json({ message: "Sistema já foi configurado" });
      }

      // Create admin user
      const hashedPassword = await bcrypt.hash("admin123", 10);
      const adminUser = await storage.createUser({
        email: "admin@sistema.com",
        password: hashedPassword
      });

      // Create sample categories
      const categories = [
        { name: "IA", slug: "ia", color: "#3B82F6" },
        { name: "Automação", slug: "automacao", color: "#10B981" },
        { name: "Bot", slug: "bot", color: "#8B5CF6" },
        { name: "Integração", slug: "integracao", color: "#F59E0B" }
      ];

      for (const category of categories) {
        await storage.createCategory(category);
      }

      // Create sample tools
      const allCategories = await storage.getAllCategories();
      const iaCategory = allCategories.find(cat => cat.slug === "ia");
      const automacaoCategory = allCategories.find(cat => cat.slug === "automacao");

      const tools = [
        { name: "OpenAI", slug: "openai", categoryId: iaCategory?.id },
        { name: "n8n", slug: "n8n", categoryId: automacaoCategory?.id },
        { name: "Zapier", slug: "zapier", categoryId: automacaoCategory?.id },
        { name: "Claude", slug: "claude", categoryId: iaCategory?.id }
      ];

      for (const tool of tools) {
        await storage.createTool(tool);
      }

      res.json({ 
        message: "Sistema configurado com sucesso",
        credentials: {
          email: "admin@sistema.com",
          password: "admin123"
        }
      });
    } catch (error) {
      console.error("Erro na configuração:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  // Categories routes
  app.get("/api/categories", async (req, res) => {
    try {
      const categories = await storage.getAllCategories();
      res.json(categories);
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar categorias" });
    }
  });

  app.post("/api/categories", requireAuth, async (req, res) => {
    try {
      const validatedData = insertCategorySchema.parse(req.body);
      const category = await storage.createCategory(validatedData);
      res.status(201).json(category);
    } catch (error) {
      res.status(500).json({ message: "Erro ao criar categoria" });
    }
  });

  // Tools routes
  app.get("/api/tools", async (req, res) => {
    try {
      const tools = await storage.getAllTools();
      res.json(tools);
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar ferramentas" });
    }
  });

  app.get("/api/tools/category/:categoryId", async (req, res) => {
    try {
      const tools = await storage.getToolsByCategory(req.params.categoryId);
      res.json(tools);
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar ferramentas" });
    }
  });

  app.post("/api/tools", requireAuth, async (req, res) => {
    try {
      const validatedData = insertToolSchema.parse(req.body);
      const tool = await storage.createTool(validatedData);
      res.status(201).json(tool);
    } catch (error) {
      res.status(500).json({ message: "Erro ao criar ferramenta" });
    }
  });

  // Projects routes
  app.get("/api/projects", async (req, res) => {
    try {
      const isAdmin = req.session.userId;
      const projects = isAdmin 
        ? await storage.getAllProjects()
        : await storage.getPublishedProjects();
      res.json(projects);
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar projetos" });
    }
  });

  app.get("/api/projects/public", async (req, res) => {
    try {
      const projects = await storage.getPublishedProjects();
      res.json(projects);
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar projetos públicos" });
    }
  });

  app.get("/api/projects/:id", async (req, res) => {
    try {
      const project = await storage.getProject(req.params.id);
      if (!project) {
        return res.status(404).json({ message: "Projeto não encontrado" });
      }
      
      // Check if project is published or user is admin
      if (project.status !== "published" && !req.session.userId) {
        return res.status(403).json({ message: "Acesso negado" });
      }
      
      res.json(project);
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar projeto" });
    }
  });

  app.get("/api/projects/slug/:slug", async (req, res) => {
    try {
      const project = await storage.getProjectBySlug(req.params.slug);
      if (!project) {
        return res.status(404).json({ message: "Projeto não encontrado" });
      }
      
      // Check if project is published or user is admin
      if (project.status !== "published" && !req.session.userId) {
        return res.status(403).json({ message: "Acesso negado" });
      }
      
      res.json(project);
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar projeto" });
    }
  });

  app.post("/api/projects", requireAuth, async (req, res) => {
    try {
      const validatedData = insertProjectSchema.parse(req.body);
      
      // Generate slug from title
      const slug = validatedData.title
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .trim();

      const project = await storage.createProject({
        ...validatedData,
        slug
      });
      res.status(201).json(project);
    } catch (error) {
      res.status(500).json({ message: "Erro ao criar projeto" });
    }
  });

  app.put("/api/projects/:id", requireAuth, async (req, res) => {
    try {
      const validatedData = insertProjectSchema.partial().parse(req.body);
      
      // Regenerate slug if title changed
      if (validatedData.title) {
        validatedData.slug = validatedData.title
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/[^a-z0-9\s-]/g, "")
          .replace(/\s+/g, "-")
          .replace(/-+/g, "-")
          .trim();
      }

      const project = await storage.updateProject(req.params.id, validatedData);
      if (!project) {
        return res.status(404).json({ message: "Projeto não encontrado" });
      }
      res.json(project);
    } catch (error) {
      res.status(500).json({ message: "Erro ao atualizar projeto" });
    }
  });

  app.delete("/api/projects/:id", requireAuth, async (req, res) => {
    try {
      const success = await storage.deleteProject(req.params.id);
      if (!success) {
        return res.status(404).json({ message: "Projeto não encontrado" });
      }
      res.json({ message: "Projeto deletado com sucesso" });
    } catch (error) {
      res.status(500).json({ message: "Erro ao deletar projeto" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
