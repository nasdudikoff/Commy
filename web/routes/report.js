import express from "express";
import path from "path";
import fs from "fs";

const router = express.Router();

router.get("/report", (req, res) => {
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

export { router as reportRoutes };