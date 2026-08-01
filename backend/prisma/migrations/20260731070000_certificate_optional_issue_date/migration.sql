-- Make Certificate.issueDate optional (SQLite table rebuild).
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_certificates" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "issuer" TEXT NOT NULL,
    "issuerLogo" TEXT,
    "issueDate" DATETIME,
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
INSERT INTO "new_certificates" ("id", "title", "issuer", "issuerLogo", "issueDate", "expiryDate", "credentialId", "credentialUrl", "image", "description", "isActive", "order", "createdAt", "updatedAt")
SELECT "id", "title", "issuer", "issuerLogo", "issueDate", "expiryDate", "credentialId", "credentialUrl", "image", "description", "isActive", "order", "createdAt", "updatedAt" FROM "certificates";
DROP TABLE "certificates";
ALTER TABLE "new_certificates" RENAME TO "certificates";
CREATE INDEX "certificates_isActive_idx" ON "certificates"("isActive");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
