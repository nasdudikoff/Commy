import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import { GitCommitsProcessor } from "./index.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

// Store for current processing status
let processingStatus = {
  isProcessing: false,
  currentStep: "",
  progress: 0,
  error: null,
  result: null
};

// Routes
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.get("/api/status", (req, res) => {
  res.json(processingStatus);
});

app.post("/api/process", async (req, res) => {
  if (processingStatus.isProcessing) {
    return res.status(400).json({ error: "Un traitement est déjà en cours" });
  }

  const { mistralApiKey, folder, lastDay, author } = req.body;

  if (!mistralApiKey || !folder) {
    return res.status(400).json({ 
      error: "La clé API Mistral et le dossier du projet sont requis" 
    });
  }

  // Reset status
  processingStatus = {
    isProcessing: true,
    currentStep: "Initialisation...",
    progress: 0,
    error: null,
    result: null
  };

  res.json({ message: "Traitement démarré" });

  try {
    // Set environment variables temporarily
    process.env.MISTRAL_API_KEY = mistralApiKey;
    
    const processor = new GitCommitsProcessor(folder);
    
    if (author) {
      processor.setAuthorFilter(author);
    }

    const days = parseInt(lastDay) || 7;
    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - days);

    processingStatus.currentStep = "Récupération des commits...";
    processingStatus.progress = 20;

    const commits = await processor.getCommitsSinceDate(daysAgo);
    
    if (commits.length === 0) {
      processingStatus.isProcessing = false;
      processingStatus.error = "Aucun commit trouvé pour la période spécifiée";
      return;
    }

    processingStatus.currentStep = "Regroupement par auteur...";
    processingStatus.progress = 40;

    const authorCommits = processor.groupCommitsByAuthor(commits);

    processingStatus.currentStep = "Reformulation avec Mistral AI...";
    processingStatus.progress = 60;

    const authorTasks = await processor.reformulateCommitsByAuthor(authorCommits);

    processingStatus.currentStep = "Génération du rapport...";
    processingStatus.progress = 80;

    const fullReport = await processor.generateReport(authorTasks);

    // Save the report
    const outputPath = path.join(process.cwd(), "tasks.md");
    fs.writeFileSync(outputPath, fullReport);

    processingStatus.currentStep = "Terminé";
    processingStatus.progress = 100;
    processingStatus.result = {
      report: fullReport,
      commitsCount: commits.length,
      authorsCount: Object.keys(authorCommits).length,
      outputPath
    };
    processingStatus.isProcessing = false;

  } catch (error) {
    console.error("Erreur lors du traitement:", error);
    processingStatus.isProcessing = false;
    processingStatus.error = error.message;
  }
});

app.get("/api/report", (req, res) => {
  try {
    const reportPath = path.join(process.cwd(), "tasks.md");
    if (fs.existsSync(reportPath)) {
      const content = fs.readFileSync(reportPath, "utf8");
      res.json({ content });
    } else {
      res.status(404).json({ error: "Aucun rapport trouvé" });
    }
  } catch (error) {
    res.status(500).json({ error: "Erreur lors de la lecture du rapport" });
  }
});

app.listen(port, () => {
  console.log(`🚀 Interface web de Commy disponible sur http://localhost:${port}`);
});