import { defineCollection, z } from 'astro:content';

const categories = defineCollection({
  type: 'content',
  schema: z.object({
    order: z.number().int().default(1),
    enabled: z.boolean().default(true),
    name_en: z.string(),
    name_es: z.string().optional(),
    name_fr: z.string().optional(),
    name_de: z.string().optional(),
    name_it: z.string().optional(),
  }),
});

const products = defineCollection({
  type: 'content',
  schema: z.object({
    status: z.enum(['active','draft']).default('active'),
    category: z.string(),
    model: z.string().optional(),
    moq: z.string().optional(),
    images: z.array(z.string()).default([]),

    title_en: z.string(),
    title_es: z.string().optional(),
    title_fr: z.string().optional(),
    title_de: z.string().optional(),
    title_it: z.string().optional(),

    features_en: z.array(z.string()).optional(),
    features_es: z.array(z.string()).optional(),
    features_fr: z.array(z.string()).optional(),
    features_de: z.array(z.string()).optional(),
    features_it: z.array(z.string()).optional(),

    body_en: z.string().optional(),
    body_es: z.string().optional(),
    body_fr: z.string().optional(),
    body_de: z.string().optional(),
    body_it: z.string().optional(),

    video_provider: z.enum(['none','cloudflare_stream','youtube']).default('none'),
    video_value: z.string().optional(),

    order: z.number().int().optional(),
  }),
});

const blog = defineCollection({
  type: 'content',
  schema: z.object({
    date: z.date(),
    cover: z.string().optional(),

    title_en: z.string(),
    title_es: z.string().optional(),
    title_fr: z.string().optional(),
    title_de: z.string().optional(),
    title_it: z.string().optional(),

    body_en: z.string(),
    body_es: z.string().optional(),
    body_fr: z.string().optional(),
    body_de: z.string().optional(),
    body_it: z.string().optional(),

    video_provider: z.enum(['none','cloudflare_stream','youtube']).default('none'),
    video_value: z.string().optional(),
  }),
});

const settings = defineCollection({
  type: 'content',
  schema: z.object({
    site_name: z.string().optional(),
    sales_email: z.string().default('sales@yitumuglobal.com'),
    whatsapp_number: z.string().optional(),
    whatsapp_label: z.string().optional(),
    default_locale: z.enum(['en','es','fr','de','it']).default('en'),
    form_action: z.string().optional(),

    // UI labels (editable from /admin)
    nav_blog_en: z.string().optional(),
    nav_blog_es: z.string().optional(),
    nav_blog_fr: z.string().optional(),
    nav_blog_de: z.string().optional(),
    nav_blog_it: z.string().optional(),

    nav_about_en: z.string().optional(),
    nav_about_es: z.string().optional(),
    nav_about_fr: z.string().optional(),
    nav_about_de: z.string().optional(),
    nav_about_it: z.string().optional(),

    nav_contact_en: z.string().optional(),
    nav_contact_es: z.string().optional(),
    nav_contact_fr: z.string().optional(),
    nav_contact_de: z.string().optional(),
    nav_contact_it: z.string().optional(),

    lang_label_en: z.string().optional(),
    lang_label_es: z.string().optional(),
    lang_label_fr: z.string().optional(),
    lang_label_de: z.string().optional(),
    lang_label_it: z.string().optional(),
  }),
});

const pages = defineCollection({
  type: 'content',
  schema: z.object({
    title_en: z.string(),
    title_es: z.string().optional(),
    title_fr: z.string().optional(),
    title_de: z.string().optional(),
    title_it: z.string().optional(),

    body_en: z.string().optional(),
    body_es: z.string().optional(),
    body_fr: z.string().optional(),
    body_de: z.string().optional(),
    body_it: z.string().optional(),

    // Optional extra short line under title
    subtitle_en: z.string().optional(),
    subtitle_es: z.string().optional(),
    subtitle_fr: z.string().optional(),
    subtitle_de: z.string().optional(),
    subtitle_it: z.string().optional(),
  }),
});

export const collections = { categories, products, blog, settings, pages };
