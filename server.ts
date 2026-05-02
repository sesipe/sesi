import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import * as admin from "firebase-admin";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Initialize Firebase Admin
  const firebaseConfigPath = path.join(process.cwd(), "firebase-applet-config.json");
  const firebaseConfig = JSON.parse(fs.readFileSync(firebaseConfigPath, "utf8"));

  if (!admin.apps.length) {
    admin.initializeApp({
      projectId: firebaseConfig.projectId,
    });
  }
  const db = admin.firestore(firebaseConfig.firestoreDatabaseId);
  const auth = admin.auth();

  // Seed Data
  async function seedSystem() {
    try {
      console.log("Checking seed data...");
      
      const schools = [
        { id: "sesiibura", name: "SESI Ibura", city: "Recife", email: "sesiibura@sistemafiepe.org.br", code: "001", status: "active" },
        { id: "sesimoreno", name: "SESI Moreno", city: "Moreno", email: "sesimoreno@sistemafiepe.org.br", code: "002", status: "active" },
        { id: "sesicabo", name: "SESI Cabo", city: "Cabo de Santo Agostinho", email: "sesicabo@sistemafiepe.org.br", code: "003", status: "active" },
        { id: "sesijaboatao", name: "SESI Jaboatão", city: "Jaboatão dos Guararapes", email: "sesijaboatao@sistemafiepe.org.br", code: "004", status: "active" },
        { id: "sesicamaragibe", name: "SESI Camaragibe", city: "Camaragibe", email: "sesicamaragibe@sistemafiepe.org.br", code: "005", status: "active" },
        { id: "sesipaulista", name: "SESI Paulista", city: "Paulista", email: "sesipaulista@sistemafiepe.org.br", code: "006", status: "active" },
        { id: "sesigoiana", name: "SESI Goiana", city: "Goiana", email: "sesigoiana@sistemafiepe.org.br", code: "007", status: "active" },
        { id: "sesicaruaru", name: "SESI Caruaru", city: "Caruaru", email: "sesicaruaru@sistemafiepe.org.br", code: "008", status: "active" },
        { id: "sesibelojardim", name: "SESI Belo Jardim", city: "Belo Jardim", email: "sesibelojardim@sistemafiepe.org.br", code: "009", status: "active" },
        { id: "sesiararipina", name: "SESI Araripina", city: "Araripina", email: "sesiararipina@sistemafiepe.org.br", code: "010", status: "active" },
        { id: "sesipetrolina", name: "SESI Petrolina", city: "Petrolina", email: "sesipetrolina@sistemafiepe.org.br", code: "011", status: "active" },
        { id: "sesiescada", name: "SESI Escada", city: "Escada", email: "sesiescada@sistemafiepe.org.br", code: "012", status: "active" },
      ];

      for (const school of schools) {
        const schoolRef = db.collection("schools").doc(school.id);
        const doc = await schoolRef.get().catch(() => null);
        if (doc && !doc.exists) {
          await schoolRef.set(school);
          console.log(`School seeded: ${school.name}`);
        }
      }

      // Admin User
      const adminEmail = "admin@sistemafiepe.org.br";
      try {
        let user;
        try {
          user = await auth.getUserByEmail(adminEmail);
        } catch (e) {
          user = await auth.createUser({
            email: adminEmail,
            password: "Abc@1234",
            emailVerified: true,
            displayName: "Admin Geral",
          });
          console.log("Admin user created");
        }
        
        const userProfileRef = db.collection("users").doc(user.uid);
        const profileDoc = await userProfileRef.get().catch(() => null);
        if (profileDoc && !profileDoc.exists) {
          await userProfileRef.set({
            email: adminEmail,
            role: "admin",
            schoolId: null,
          });
        }
      } catch (e) {
        console.error("Error seeding admin:", e);
      }

      // School Admins
      for (const school of schools) {
        const schoolEmail = `${school.id}@sistemafiepe.org.br`;
        const password = `${school.id}@1234`;
        try {
          let user;
          try {
            user = await auth.getUserByEmail(schoolEmail);
          } catch (e) {
            user = await auth.createUser({
              email: schoolEmail,
              password: password,
              emailVerified: true,
              displayName: `Admin ${school.name}`,
            });
            console.log(`School admin created: ${school.name}`);
          }

          const userProfileRef = db.collection("users").doc(user.uid);
          const profileDoc = await userProfileRef.get().catch(() => null);
          if (profileDoc && !profileDoc.exists) {
            await userProfileRef.set({
              email: schoolEmail,
              role: "school_admin",
              schoolId: school.id,
            });
          }
        } catch (e) {
          console.error(`Error seeding school admin for ${school.name}:`, e);
        }
      }
      console.log("Seeding process completed.");
    } catch (error) {
      console.error("Critical error during seeding:", error);
    }
  }

  // Run seeding without blocking
  seedSystem().then(() => console.log("System verification finished."));

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
