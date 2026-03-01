import mongoose, { Schema, Document } from "mongoose";
import bcrypt from "bcrypt";

// User Schema
export interface IUser extends Document {
  username: string;
  password: string;
  email?: string;
  role: string;
  comparePassword(plainPassword: string): Promise<boolean>;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    email: String,
    role: { type: String, default: "admin" },
  },
  { timestamps: true }
);

// Ensure passwords are hashed before saving
UserSchema.pre("save", async function (next) {
  // Only hash if password is new or modified
  if (!this.isModified("password")) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Method to compare passwords
UserSchema.methods.comparePassword = async function (plainPassword: string) {
  return await bcrypt.compare(plainPassword, this.password);
};

// Article Schema
export interface IArticleTranslation {
  title: string;
  subtitle?: string;
  excerpt?: string;
  body: string;
}

export interface IArticle extends Document {
  slug: string;
  translations: {
    en: IArticleTranslation;
    az: IArticleTranslation;
    ru: IArticleTranslation;
    tr: IArticleTranslation;
  };
  category: string;
  featured?: boolean;
  readingTime: number;
  views: number;
  image?: string;
  date: string;
  defaultLanguage: string;
  createdAt: Date;
  updatedAt: Date;
}

const ArticleSchema = new Schema<IArticle>(
  {
    slug: { type: String, required: true, unique: true },
    translations: {
      en: {
        title: String,
        subtitle: String,
        excerpt: String,
        body: String,
      },
      az: {
        title: String,
        subtitle: String,
        excerpt: String,
        body: String,
      },
      ru: {
        title: String,
        subtitle: String,
        excerpt: String,
        body: String,
      },
      tr: {
        title: String,
        subtitle: String,
        excerpt: String,
        body: String,
      },
    },
    date: { type: String, required: true },
    category: { type: String, default: "Essay" },
    featured: { type: Boolean, default: false },
    readingTime: { type: Number, default: 5 },
    views: { type: Number, default: 0 },
    image: String,
    defaultLanguage: { type: String, default: "az" },
  },
  { timestamps: true }
);

// Category Schema
export interface ICategory extends Document {
  name: string;
  slug: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

const CategorySchema = new Schema<ICategory>(
  {
    name: { type: String, required: true, unique: true },
    slug: { type: String, required: true, unique: true },
    description: String,
  },
  { timestamps: true }
);

// View Record Schema
export interface IViewRecord extends Document {
  slug: string;
  count: number;
  lastViewed: Date;
}

const ViewRecordSchema = new Schema<IViewRecord>(
  {
    slug: { type: String, required: true, unique: true },
    count: { type: Number, default: 0 },
    lastViewed: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Settings Schema
export interface IAboutTranslation {
  title: string;
  content: string;
}

export interface ISocialMedia {
  instagram?: string;
  threads?: string;
  medium?: string;
  facebook?: string;
  linkedin?: string;
}

export interface ISettings extends Document {
  about: {
    en: IAboutTranslation;
    az: IAboutTranslation;
    ru: IAboutTranslation;
    tr: IAboutTranslation;
  };
  aboutImage?: string;
  socialMedia?: ISocialMedia;
  createdAt: Date;
  updatedAt: Date;
}

const SettingsSchema = new Schema<ISettings>(
  {
    about: {
      en: {
        title: String,
        content: String,
      },
      az: {
        title: String,
        content: String,
      },
      ru: {
        title: String,
        content: String,
      },
      tr: {
        title: String,
        content: String,
      },
    },
    aboutImage: String,
    socialMedia: {
      instagram: String,
      threads: String,
      medium: String,
      facebook: String,
      linkedin: String,
    },
  },
  { timestamps: true }
);

export const Article = mongoose.model<IArticle>("Article", ArticleSchema);
export const Category = mongoose.model<ICategory>("Category", CategorySchema);
export const ViewRecord = mongoose.model<IViewRecord>("ViewRecord", ViewRecordSchema);
export const User = mongoose.model<IUser>("User", UserSchema);
export const Settings = mongoose.model<ISettings>("Settings", SettingsSchema);
