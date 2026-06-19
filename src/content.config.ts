import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

const cursos = defineCollection({
  loader: glob({ base: "./src/content/cursos", pattern: "**/*.md" }),
  schema: z.object({
    title: z.string(),
    category: z.enum(["Curso", "Certificación"]),
    modality: z.enum(["Virtual", "Presencial", "Híbrido"]),
    image: z.string().optional(),
    startDate: z.string(),
    price: z.string(),
    registrationDeadline: z.string().optional(),
    canvaLink: z.preprocess((val) => (val === "" ? undefined : val), z.string().url().optional()),
    description: z.string().optional(),
    instructors: z.array(
      z.object({
        name: z.string(),
        bio: z.string().optional(),
      })
    ).default([]),
    draft: z.boolean().default(false),
  }),
});

const articulos = defineCollection({
  loader: glob({ base: "./src/content/articulos", pattern: "**/*.md" }),
  schema: z.object({
    title: z.string(),
    category: z.enum([
      "Noticias",
      "Análisis",
      "Eventos",
      "Capacitación",
    ]),
    excerpt: z.string(),
    date: z.string(),
    image: z.string().optional(),
    featured: z.boolean().default(false),
    draft: z.boolean().default(false),
  }),
});

const empresas = defineCollection({
  loader: glob({ base: "./src/content/empresas", pattern: "**/*.md" }),
  schema: z.object({
    nombre: z.string(),
    grupo: z.enum(["upstream", "pozo", "superficie", "downstream", "auxiliares", "adherentes"]),
    website: z.preprocess((val) => (val === "" ? undefined : val), z.string().url().optional()),
    email: z.preprocess((val) => (val === "" ? undefined : val), z.string().email().optional()),
    description: z.string().optional(),
    logo: z.string().optional(),
    destacada: z.boolean().default(false),
    orden: z.number().default(0),
    draft: z.boolean().default(false),
  }),
});

const testimonios = defineCollection({
  loader: glob({ base: "./src/content/testimonios", pattern: "**/*.md" }),
  schema: z.object({
    name: z.string(),
    role: z.string(),
    company: z.string(),
    quote: z.string(),
    highlight: z.string(),
    image: z.string().optional(),
    draft: z.boolean().default(false),
  }),
});

export const collections = { cursos, articulos, empresas, testimonios };
