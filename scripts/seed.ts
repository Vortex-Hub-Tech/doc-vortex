
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import bcrypt from "bcrypt";
import { 
  users, categories, tools, projects, projectImages
} from "../shared/schema";
import { eq } from "drizzle-orm";

async function seed() {
  try {
    console.log("🌱 Iniciando seed do banco de dados...");

    // Conectar ao banco Supabase
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL environment variable is required");
    }

    const sql = postgres(process.env.DATABASE_URL);
    const db = drizzle(sql);

    // Criar usuário administrador
    const adminEmail = "admin@sistema.com";
    const adminPassword = "admin123";
    
    // Verificar se o usuário já existe
    const existingUser = await db.select().from(users).where(eq(users.email, adminEmail));
    if (existingUser.length > 0) {
      console.log("✅ Usuário administrador já existe");
    } else {
      const hashedPassword = await bcrypt.hash(adminPassword, 10);
      await db.insert(users).values({
        email: adminEmail,
        password: hashedPassword
      });
      console.log("✅ Usuário administrador criado:", adminEmail, "/ senha:", adminPassword);
    }

    // Criar categorias de exemplo
    const categoryData = [
      { name: "IA", slug: "ia", color: "#3B82F6" },
      { name: "Automação", slug: "automacao", color: "#10B981" },
      { name: "Bot", slug: "bot", color: "#8B5CF6" },
      { name: "Integração", slug: "integracao", color: "#F59E0B" }
    ];

    for (const category of categoryData) {
      try {
        await db.insert(categories).values(category);
        console.log(`✅ Categoria criada: ${category.name}`);
      } catch (error: any) {
        console.log(`⚠️  Categoria ${category.name} já existe ou erro:`, error.message);
      }
    }

    // Criar ferramentas de exemplo
    const allCategories = await db.select().from(categories);
    const iaCategory = allCategories.find(cat => cat.slug === "ia");
    const automacaoCategory = allCategories.find(cat => cat.slug === "automacao");

    const toolsData = [
      { name: "OpenAI", slug: "openai", categoryId: iaCategory?.id },
      { name: "n8n", slug: "n8n", categoryId: automacaoCategory?.id },
      { name: "Zapier", slug: "zapier", categoryId: automacaoCategory?.id },
      { name: "Claude", slug: "claude", categoryId: iaCategory?.id }
    ];

    for (const tool of toolsData) {
      try {
        await db.insert(tools).values(tool);
        console.log(`✅ Ferramenta criada: ${tool.name}`);
      } catch (error: any) {
        console.log(`⚠️  Ferramenta ${tool.name} já existe ou erro:`, error.message);
      }
    }

    console.log("🎉 Seed concluído com sucesso!");
    console.log("📝 Acesse o sistema com:");
    console.log("   Email: admin@sistema.com");
    console.log("   Senha: admin123");

    // Fechar conexão
    await sql.end();

  } catch (error) {
    console.error("❌ Erro no seed:", error);
    throw error;
  }
}

seed().catch(console.error);
