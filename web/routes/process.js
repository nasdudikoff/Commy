import express from "express";
import path from "path";
import fs from "fs";
import { GitCommitsProcessor } from "../../src/GitCommitsProcessor.js";

const router = express.Router();

// Store for current processing status
let processingStatus = {
    isProcessing: false,
    currentStep: "",
    progress: 0,
    error: null,
    result: null
};

router.get("/status", (req, res) => {
    res.json(processingStatus);
});

router.post("/process", async (req, res) => {
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

        processingStatus.currentStep = "Validation du repository...";
        processingStatus.progress = 10;

        // Validation du repository
        const isValidRepo = await processor.validateRepository();
        if (!isValidRepo) {
            throw new Error(`Le dossier "${folder}" n'est pas un repository Git valide`);
        }

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

export { router as processRoutes };