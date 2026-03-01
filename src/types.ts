export interface ArticleTranslation {
  title: string;
  subtitle?: string;
  excerpt?: string;
  body: string;
}

export interface Article {
  id: string;
  slug: string;
  translations: {
    en: ArticleTranslation;
    az: ArticleTranslation;
    ru: ArticleTranslation;
    tr: ArticleTranslation;
  };
  date: string;
  category: string;
  featured?: boolean;
  readingTime: number;
  views?: number;
  image?: string;
  defaultLanguage: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  color?: string;
}

export interface ViewRecord {
  articleSlug: string;
  views: number;
  updatedAt: string;
}
