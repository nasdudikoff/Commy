import express from "express";
import fs from "fs";
import path from "path";

const router = express.Router();

router.get("/load-config", (req, res) => {
    try {
        const envPath = path.join(process.cwd(), ".env");

        if (!fs.existsSync(envPath)) {
            return res.json({
                MISTRAL_API_KEY: "",
                FOLDER: "",
                LAST_DAY: "7",
                AUTHOR: ""
            });
        }

        const envContent = fs.readFileSync(envPath, "utf8");
        const config = {};

        envContent.split('\n').forEach(line => {
            const [key, value] = line.split('=');
            if (key && value) {
                config[key.trim()] = value.trim().replace(/^'|'$/g, '');
            }
        });

        res.json({
            MISTRAL_API_KEY: config.MISTRAL_API_KEY || "",
            FOLDER: config.FOLDER || "",
            LAST_DAY: config.LAST_DAY || "7",
            AUTHOR: config.AUTHOR || ""
        });

    } catch (error) {
        console.error("Erreur lors du chargement:", error);
        res.status(500).json({ error: "Erreur lors du chargement de la configuration" });
    }
});

router.post("/save-config", (req, res) => {
    try {
        const { MISTRAL_API_KEY, FOLDER, LAST_DAY, AUTHOR } = req.body;

        if (!MISTRAL_API_KEY || !FOLDER) {
            return res.status(400).json({
                error: "La clé API Mistral et le dossier sont requis"
            });
        }

        let envContent = `MISTRAL_API_KEY=${MISTRAL_API_KEY}\n`;
        envContent += `FOLDER='${FOLDER}'\n`;
        envContent += `LAST_DAY=${LAST_DAY || '7'}\n`;

        if (AUTHOR && AUTHOR.trim() !== '') {
            envContent += `AUTHOR='${AUTHOR}'\n`;
        }

        const envPath = path.join(process.cwd(), ".env");
        fs.writeFileSync(envPath, envContent);

        res.json({
            message: "Configuration sauvegardée avec succès dans le fichier .env",
            saved: { MISTRAL_API_KEY: "***", FOLDER, LAST_DAY, AUTHOR }
        });

    } catch (error) {
        console.error("Erreur lors de la sauvegarde:", error);
        res.status(500).json({ error: "Erreur lors de la sauvegarde de la configuration" });
    }
});

export { router as configRoutes };