import simpleGit from "simple-git";
import fs from "fs";
import path from "path";
import { Mistral } from "@mistralai/mistralai";
import { config } from "dotenv";
config();

class GitCommitsProcessor {
  constructor(repoPath) {
    const options = {
      baseDir: repoPath,
      binary: "git",
    };
    this.git = simpleGit(options);

    this.mistral = new Mistral({
      apiKey: process.env.MISTRAL_API_KEY,
    });

    // Default author filter, can be set via setAuthorFilter
    this.authorFilter = null;
  }

  // Add a method to set author filter
  setAuthorFilter(authorName) {
    this.authorFilter = authorName;
    console.log(`Filtering commits for authors including: ${authorName}`);
  }

  async getCommitsSinceDate(date) {
    try {
      const formattedDate = date.toISOString().split("T")[0];
      const commits = await this.git.log({
        "--since": formattedDate,
        format: {
          subject: "%s",
          date: "%ci",
          author: "%an",
        },
      });

      let filteredCommits = commits.all.map((commit) => ({
        subject: commit.subject,
        date: new Date(commit.date).toLocaleDateString("fr-FR"),
        author: commit.author,
      }));

      // Apply author filter if set
      if (this.authorFilter) {
        filteredCommits = filteredCommits.filter((commit) =>
          commit.author.toLowerCase().includes(this.authorFilter.toLowerCase())
        );
        console.log(
          `Filtered to ${filteredCommits.length} commits by author containing "${this.authorFilter}"`
        );
      }

      return filteredCommits;
    } catch (error) {
      console.error("Erreur lors de la récupération des commits:", error);
      return [];
    }
  }

  groupCommitsByAuthor(commits) {
    // Group commits by author
    const authorCommits = {};
    for (const commit of commits) {
      if (!authorCommits[commit.author]) {
        authorCommits[commit.author] = [];
      }
      authorCommits[commit.author].push(commit);
    }
    return authorCommits;
  }

  async reformulateCommitsByAuthor(authorCommits) {
    const authorTasks = {};

    for (const [author, commits] of Object.entries(authorCommits)) {
      try {
        // Prepare commits for this author
        const commitsText = commits
          .map((commit) => `${commit.date}: ${commit.subject}`)
          .join("\n");

        const response = await this.mistral.chat.complete({
          model: "mistral-small-latest",
          messages: [
            {
              role: "user",
              content: `Regroupe et reformule ces commits par date en tâches concises pour un rapport d'activité pour ${author}. Garde la structure originale avec les dates. Évite les répétitions et généralise si possible :\n${commitsText}`,
            },
          ],
        });

        // Parse the AI response
        const tasksText = response.choices[0].message.content || "";
        console.log(`Reformulation pour ${author} terminée.`);
        authorTasks[author] = tasksText;
      } catch (error) {
        console.error(
          `Erreur lors de la transformation des commits pour ${author}:`,
          error
        );
        authorTasks[author] = commits
          .map((commit) => `${commit.date}: ${commit.subject}`)
          .join("\n");
      }
    }

    return authorTasks;
  }

  async generateReport(authorTasks) {
    // Create a report with header including generation date
    const today = new Date().toLocaleDateString("fr-FR");
    let report = `# Rapport d'activité Git\n\nGénéré le: ${today}\n\n`;

    // Add contributor statistics
    const authorStats = await this.getAuthorStats();
    if (authorStats) {
      report += "## Contributeurs\n\n";
      for (const [author, count] of Object.entries(authorStats)) {
        report += `- ${author}: ${count} commits\n`;
      }
      report += "\n";
    }

    // Add tasks organized by author
    report += "## Activités par contributeur\n\n";

    for (const [author, tasks] of Object.entries(authorTasks)) {
      report += `### ${author}\n\n${tasks}\n\n`;
    }

    return report;
  }

  async getAuthorStats() {
    try {
      const result = {};
      const log = await this.git.log();

      log.all.forEach((commit) => {
        const author = commit.author_name;
        result[author] = (result[author] || 0) + 1;
      });

      return result;
    } catch (error) {
      console.error(
        "Erreur lors de la récupération des statistiques par auteur:",
        error
      );
      return null;
    }
  }

  async processCommits(date) {
    console.log(`Récupération des commits depuis ${date.toISOString()}`);

    const commits = await this.getCommitsSinceDate(date);
    console.log(`Commits trouvés: ${commits.length}`);

    if (commits.length === 0) {
      console.log("Aucun commit trouvé.");
      return;
    }

    // Group commits by author
    const authorCommits = this.groupCommitsByAuthor(commits);
    console.log(
      `Commits regroupés par ${Object.keys(authorCommits).length} auteurs.`
    );

    // Reformulate commits by author
    const authorTasks = await this.reformulateCommitsByAuthor(authorCommits);

    // Generate the full report with authors
    const fullReport = await this.generateReport(authorTasks);

    // Save the report to tasks.md
    const outputPath = path.join(process.cwd(), "tasks.md");
    fs.writeFileSync(outputPath, fullReport);
    console.log(`\nRapport sauvegardé dans ${outputPath}`);
  }
}

// Exemple d'utilisation
async function main() {
  if (!process.env.MISTRAL_API_KEY) {
    console.error(
      "La clé API Mistral est manquante. Définissez-la dans un fichier .env"
    );
    process.exit(1);
  }

  if (!process.env.FOLDER) {
    console.error("Le dossier du projet est manquant");
    process.exit(1);
  }

  const repoPath = process.env.FOLDER; // Chemin du répertoire du projet
  const processor = new GitCommitsProcessor(repoPath);

  if (process.env.AUTHOR) {
    // Set author filter from environment variable
    processor.setAuthorFilter(process.env.AUTHOR);
  }

  const LAST_DAY = parseInt(process.env.LAST_DAY) || 7;
  // Récupérer les commits des derniers jours
  const daysAgo = new Date();
  daysAgo.setDate(daysAgo.getDate() - LAST_DAY);

  await processor.processCommits(daysAgo);
}

// Exécuter le script
main().catch(console.error);
