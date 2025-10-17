import dotenv from 'dotenv'
dotenv.config()

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import {
  type User,
  type InsertUser,
  type Category,
  type InsertCategory,
  type Tool,
  type InsertTool,
  type Project,
  type InsertProject,
  type ProjectWithRelations,
  type ProjectImage,
  type InsertProjectImage,
  users,
  categories,
  tools,
  projects,
  projectImages,
} from "@shared/schema";
import { eq, sql } from "drizzle-orm";
import { randomUUID } from "crypto";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Categories
  getAllCategories(): Promise<Category[]>;
  getCategory(id: string): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;
  updateCategory(
    id: string,
    category: Partial<InsertCategory>,
  ): Promise<Category | undefined>;
  deleteCategory(id: string): Promise<boolean>;

  // Tools
  getAllTools(): Promise<Tool[]>;
  getToolsByCategory(categoryId: string): Promise<Tool[]>;
  getTool(id: string): Promise<Tool | undefined>;
  createTool(tool: InsertTool): Promise<Tool>;
  updateTool(id: string, tool: Partial<InsertTool>): Promise<Tool | undefined>;
  deleteTool(id: string): Promise<boolean>;

  // Projects
  getAllProjects(): Promise<ProjectWithRelations[]>;
  getPublishedProjects(): Promise<ProjectWithRelations[]>;
  getProject(id: string): Promise<ProjectWithRelations | undefined>;
  getProjectBySlug(slug: string): Promise<ProjectWithRelations | undefined>;
  createProject(project: InsertProject): Promise<Project>;
  updateProject(
    id: string,
    project: Partial<InsertProject>,
  ): Promise<Project | undefined>;
  deleteProject(id: string): Promise<boolean>;

  // Project Images
  getProjectImages(projectId: string): Promise<ProjectImage[]>;
  createProjectImage(image: InsertProjectImage): Promise<ProjectImage>;
  deleteProjectImage(id: string): Promise<boolean>;
}

class DatabaseStorage implements IStorage {
  private db;

  constructor() {
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL environment variable is required");
    }
    const sql = postgres(process.env.DATABASE_URL, {
      ssl: "require",
      max: 1,
    });
    this.db = drizzle(sql);
  }

  // Users
  async getUser(id: string): Promise<User | undefined> {
    const result = await this.db.select().from(users).where(eq(users.id, id));
    return result[0];
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const result = await this.db
      .select()
      .from(users)
      .where(eq(users.email, email));
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { 
      ...insertUser, 
      id, 
      createdAt: new Date(),
      role: insertUser.role || "Desenvolvedor"
    };
    await this.db.insert(users).values(user);
    return user;
  }

  // Categories
  async getAllCategories(): Promise<Category[]> {
    return await this.db.select().from(categories).orderBy(categories.name);
  }

  async getCategory(id: string): Promise<Category | undefined> {
    const result = await this.db
      .select()
      .from(categories)
      .where(eq(categories.id, id));
    return result[0];
  }

  async createCategory(insertCategory: InsertCategory): Promise<Category> {
    const id = randomUUID();
    const category: Category = {
      ...insertCategory,
      id,
      createdAt: new Date(),
      color: insertCategory.color || "#3B82F6",
    };
    await this.db.insert(categories).values(category);
    return category;
  }

  async updateCategory(
    id: string,
    updateData: Partial<InsertCategory>,
  ): Promise<Category | undefined> {
    await this.db
      .update(categories)
      .set(updateData)
      .where(eq(categories.id, id));
    return this.getCategory(id);
  }

  async deleteCategory(id: string): Promise<boolean> {
    const result = await this.db
      .delete(categories)
      .where(eq(categories.id, id));
    return result.length > 0;
  }

  // Tools
  async getAllTools(): Promise<Tool[]> {
    return await this.db.select().from(tools).orderBy(tools.name);
  }

  async getToolsByCategory(categoryId: string): Promise<Tool[]> {
    return await this.db
      .select()
      .from(tools)
      .where(eq(tools.categoryId, categoryId));
  }

  async getTool(id: string): Promise<Tool | undefined> {
    const result = await this.db.select().from(tools).where(eq(tools.id, id));
    return result[0];
  }

  async createTool(insertTool: InsertTool): Promise<Tool> {
    const id = randomUUID();
    const tool: Tool = {
      ...insertTool,
      id,
      createdAt: new Date(),
      categoryId: insertTool.categoryId || null,
    };
    await this.db.insert(tools).values(tool);
    return tool;
  }

  async updateTool(
    id: string,
    updateData: Partial<InsertTool>,
  ): Promise<Tool | undefined> {
    await this.db.update(tools).set(updateData).where(eq(tools.id, id));
    return this.getTool(id);
  }

  async deleteTool(id: string): Promise<boolean> {
    const result = await this.db.delete(tools).where(eq(tools.id, id));
    return result.length > 0;
  }

  // Projects
  async getAllProjects(): Promise<ProjectWithRelations[]> {
    const result = await this.db
      .select({
        project: projects,
        category: categories,
        tool: tools,
        author: users,
      })
      .from(projects)
      .leftJoin(categories, eq(projects.categoryId, categories.id))
      .leftJoin(tools, eq(projects.toolId, tools.id))
      .leftJoin(users, eq(projects.authorId, users.id))
      .orderBy(projects.updatedAt);

    const projectsWithImages = await Promise.all(
      result.map(async (row) => {
        const images = await this.getProjectImages(row.project.id);
        const author = row.author ? (() => {
          const { password, ...rest } = row.author;
          return rest;
        })() : undefined;
        return {
          ...row.project,
          category: row.category || undefined,
          tool: row.tool || undefined,
          author,
          images,
        };
      }),
    );

    return projectsWithImages;
  }

  async getPublishedProjects(): Promise<ProjectWithRelations[]> {
    const result = await this.db
      .select({
        project: projects,
        category: categories,
        tool: tools,
        author: users,
      })
      .from(projects)
      .leftJoin(categories, eq(projects.categoryId, categories.id))
      .leftJoin(tools, eq(projects.toolId, tools.id))
      .leftJoin(users, eq(projects.authorId, users.id))
      .where(eq(projects.status, "published"))
      .orderBy(projects.updatedAt);

    const projectsWithImages = await Promise.all(
      result.map(async (row) => {
        const images = await this.getProjectImages(row.project.id);
        const author = row.author ? (() => {
          const { password, ...rest } = row.author;
          return rest;
        })() : undefined;
        return {
          ...row.project,
          category: row.category || undefined,
          tool: row.tool || undefined,
          author,
          images,
        };
      }),
    );

    return projectsWithImages;
  }

  async getProject(id: string): Promise<ProjectWithRelations | undefined> {
    const result = await this.db
      .select({
        project: projects,
        category: categories,
        tool: tools,
        author: users,
      })
      .from(projects)
      .leftJoin(categories, eq(projects.categoryId, categories.id))
      .leftJoin(tools, eq(projects.toolId, tools.id))
      .leftJoin(users, eq(projects.authorId, users.id))
      .where(eq(projects.id, id));

    if (!result[0]) return undefined;

    const images = await this.getProjectImages(id);
    const author = result[0].author ? (() => {
      const { password, ...rest } = result[0].author;
      return rest;
    })() : undefined;

    return {
      ...result[0].project,
      category: result[0].category || undefined,
      tool: result[0].tool || undefined,
      author,
      images,
    };
  }

  async getProjectBySlug(
    slug: string,
  ): Promise<ProjectWithRelations | undefined> {
    const result = await this.db
      .select({
        project: projects,
        category: categories,
        tool: tools,
        author: users,
      })
      .from(projects)
      .leftJoin(categories, eq(projects.categoryId, categories.id))
      .leftJoin(tools, eq(projects.toolId, tools.id))
      .leftJoin(users, eq(projects.authorId, users.id))
      .where(eq(projects.slug, slug));

    if (!result[0]) return undefined;

    const images = await this.getProjectImages(result[0].project.id);
    const author = result[0].author ? (() => {
      const { password, ...rest } = result[0].author;
      return rest;
    })() : undefined;

    return {
      ...result[0].project,
      category: result[0].category || undefined,
      tool: result[0].tool || undefined,
      author,
      images,
    };
  }

  async createProject(insertProject: InsertProject): Promise<Project> {
    const id = randomUUID();
    const now = new Date();
    const slug = insertProject.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
    const project: Project = {
      ...insertProject,
      id,
      slug,
      createdAt: now,
      updatedAt: now,
      status: insertProject.status || "draft",
      categoryId: insertProject.categoryId || null,
      toolId: insertProject.toolId || null,
      thumbnailUrl: insertProject.thumbnailUrl || null,
      links: insertProject.links || [],
    };
    await this.db.insert(projects).values(project);
    return project;
  }

  async updateProject(
    id: string,
    updateData: Partial<InsertProject>,
  ): Promise<Project | undefined> {
    const updatedData = { ...updateData, updatedAt: new Date() };
    await this.db.update(projects).set(updatedData).where(eq(projects.id, id));
    const result = await this.db
      .select()
      .from(projects)
      .where(eq(projects.id, id));
    return result[0];
  }

  async deleteProject(id: string): Promise<boolean> {
    const result = await this.db.delete(projects).where(eq(projects.id, id));
    return result.length > 0;
  }

  // Project Images
  async getProjectImages(projectId: string): Promise<ProjectImage[]> {
    return await this.db
      .select()
      .from(projectImages)
      .where(eq(projectImages.projectId, projectId))
      .orderBy(projectImages.order);
  }

  async createProjectImage(
    insertImage: InsertProjectImage,
  ): Promise<ProjectImage> {
    const id = randomUUID();
    const image: ProjectImage = {
      ...insertImage,
      id,
      createdAt: new Date(),
      alt: insertImage.alt || "",
      order: insertImage.order || "0",
      projectId: insertImage.projectId || null,
    };
    await this.db.insert(projectImages).values(image);
    return image;
  }

  async deleteProjectImage(id: string): Promise<boolean> {
    const result = await this.db
      .delete(projectImages)
      .where(eq(projectImages.id, id));
    return result.length > 0;
  }
}

export const storage = new DatabaseStorage();
