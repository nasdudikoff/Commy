import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { configRoutes } from "./routes/config.js";
import { processRoutes } from "./routes/process.js";
import { reportRoutes } from "./routes/report.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

// Routes
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

// API Routes
app.use("/api", configRoutes);
app.use("/api", processRoutes);
app.use("/api", reportRoutes);

// Gestion des erreurs 404
app.use((req, res) => {
    res.status(404).json({ error: "Route non trouvée" });
});

// Gestion des erreurs globales
app.use((err, req, res, next) => {
    console.error('Erreur serveur:', err.stack);
    res.status(500).json({ error: "Erreur interne du serveur" });
});

app.listen(port, () => {
    console.log(`🚀 Interface web de Commy disponible sur http://localhost:${port}`);
    console.log(`📁 Fichiers statiques servis depuis: ${path.join(__dirname, "public")}`);
});

// Gestion des signaux pour arrêt propre
process.on('SIGINT', () => {
    console.log('\n👋 Arrêt du serveur web demandé');
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('\n👋 Arrêt du serveur web');
    process.exit(0);
});