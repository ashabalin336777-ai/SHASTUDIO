-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT,
    "role" TEXT NOT NULL DEFAULT 'admin',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "profile" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "fullName" TEXT NOT NULL,
    "title" TEXT,
    "bio" TEXT,
    "avatar" TEXT,
    "location" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "website" TEXT,
    "telegram" TEXT,
    "max" TEXT,
    "github" TEXT,
    "linkedin" TEXT,
    "mbtiType" TEXT,
    "personalTraits" JSON NOT NULL DEFAULT '[]',
    "skills" JSON NOT NULL DEFAULT '[]',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "experiences" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "company" TEXT NOT NULL,
    "companyLogo" TEXT,
    "companyWebsite" TEXT,
    "startYear" INTEGER NOT NULL,
    "startMonth" INTEGER NOT NULL,
    "endYear" INTEGER,
    "endMonth" INTEGER,
    "isCurrent" BOOLEAN NOT NULL DEFAULT false,
    "city" TEXT,
    "country" TEXT,
    "remote" BOOLEAN NOT NULL DEFAULT false,
    "position" TEXT NOT NULL,
    "department" TEXT,
    "description" TEXT,
    "responsibilities" JSON NOT NULL DEFAULT '[]',
    "achievements" JSON NOT NULL DEFAULT '[]',
    "technologies" JSON NOT NULL DEFAULT '[]',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "education" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "institution" TEXT NOT NULL,
    "logo" TEXT,
    "website" TEXT,
    "degree" TEXT NOT NULL,
    "field" TEXT,
    "startYear" INTEGER NOT NULL,
    "startMonth" INTEGER,
    "endYear" INTEGER,
    "endMonth" INTEGER,
    "isCurrent" BOOLEAN NOT NULL DEFAULT false,
    "description" TEXT,
    "gpa" TEXT,
    "certificate" TEXT,
    "certificateUrl" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "courses" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "platform" TEXT,
    "startDate" DATETIME,
    "endDate" DATETIME,
    "certificate" TEXT,
    "certificateUrl" TEXT,
    "description" TEXT,
    "skills" JSON NOT NULL DEFAULT '[]',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "projects" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "content" TEXT,
    "image" TEXT,
    "images" JSON NOT NULL DEFAULT '[]',
    "category" TEXT,
    "tags" JSON NOT NULL DEFAULT '[]',
    "link" TEXT,
    "demo" TEXT,
    "github" TEXT,
    "technologies" JSON NOT NULL DEFAULT '[]',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "blog_posts" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "excerpt" TEXT,
    "content" TEXT NOT NULL,
    "coverImage" TEXT,
    "tags" JSON NOT NULL DEFAULT '[]',
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "publishedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "certificates" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "issuer" TEXT NOT NULL,
    "issuerLogo" TEXT,
    "issueDate" DATETIME NOT NULL,
    "expiryDate" DATETIME,
    "credentialId" TEXT,
    "credentialUrl" TEXT,
    "image" TEXT,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "site_context" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "section" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "keywords" JSON NOT NULL DEFAULT '[]',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "section_media" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "section" TEXT NOT NULL,
    "imageUrl" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "experiences_isActive_idx" ON "experiences"("isActive");

-- CreateIndex
CREATE INDEX "experiences_startYear_startMonth_idx" ON "experiences"("startYear", "startMonth");

-- CreateIndex
CREATE INDEX "education_isActive_idx" ON "education"("isActive");

-- CreateIndex
CREATE INDEX "courses_isActive_idx" ON "courses"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "projects_slug_key" ON "projects"("slug");

-- CreateIndex
CREATE INDEX "projects_isActive_idx" ON "projects"("isActive");

-- CreateIndex
CREATE INDEX "projects_featured_idx" ON "projects"("featured");

-- CreateIndex
CREATE UNIQUE INDEX "blog_posts_slug_key" ON "blog_posts"("slug");

-- CreateIndex
CREATE INDEX "blog_posts_isPublished_idx" ON "blog_posts"("isPublished");

-- CreateIndex
CREATE INDEX "blog_posts_publishedAt_idx" ON "blog_posts"("publishedAt");

-- CreateIndex
CREATE INDEX "certificates_isActive_idx" ON "certificates"("isActive");

-- CreateIndex
CREATE INDEX "site_context_section_idx" ON "site_context"("section");

-- CreateIndex
CREATE INDEX "site_context_isActive_idx" ON "site_context"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "section_media_section_key" ON "section_media"("section");
