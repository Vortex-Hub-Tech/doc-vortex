import { storage } from "../server/storage";
import bcrypt from "bcrypt";

async function seed() {
  try {
    console.log("🌱 Iniciando seed do banco de dados...");

    // Criar usuário administrador
    const adminEmail = "admin@sistema.com";
    const adminPassword = "admin123";
    
    // Verificar se o usuário já existe
    const existingUser = await storage.getUserByEmail(adminEmail);
    if (existingUser) {
      console.log("✅ Usuário administrador já existe");
    } else {
      const hashedPassword = await bcrypt.hash(adminPassword, 10);
      await storage.createUser({
        email: adminEmail,
        password: hashedPassword
      });
      console.log("✅ Usuário administrador criado:", adminEmail, "/ senha:", adminPassword);
    }

    // Criar categorias de exemplo
    const categories = [
      { name: "IA", slug: "ia", color: "#3B82F6" },
      { name: "Automação", slug: "automacao", color: "#10B981" },
      { name: "Bot", slug: "bot", color: "#8B5CF6" },
      { name: "Integração", slug: "integracao", color: "#F59E0B" }
    ];

    for (const category of categories) {
      try {
        await storage.createCategory(category);
        console.log(`✅ Categoria criada: ${category.name}`);
      } catch (error) {
        console.log(`⚠️  Categoria ${category.name} já existe ou erro:`, error.message);
      }
    }

    // Criar ferramentas de exemplo
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
      try {
        await storage.createTool(tool);
        console.log(`✅ Ferramenta criada: ${tool.name}`);
      } catch (error) {
        console.log(`⚠️  Ferramenta ${tool.name} já existe ou erro:`, error.message);
      }
    }

    console.log("🎉 Seed concluído com sucesso!");
    console.log("📝 Acesse o sistema com:");
    console.log("   Email: admin@sistema.com");
    console.log("   Senha: admin123");

  } catch (error) {
    console.error("❌ Erro no seed:", error);
    throw error;
  }
}

seed().catch(console.error);