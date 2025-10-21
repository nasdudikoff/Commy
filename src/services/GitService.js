import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export class GitService {
    constructor(repositoryPath) {
        this.repositoryPath = repositoryPath;
    }

    async getCommitsSinceDate(sinceDate) {
        try {
            const since = sinceDate.toISOString().split('T')[0];
            const { stdout } = await execAsync(
                `cd "${this.repositoryPath}" && git log --since="${since}" --pretty=format:"%H|%an|%ae|%ad|%s" --date=short`
            );

            if (!stdout.trim()) {
                return [];
            }

            return stdout.trim().split('\n').map(line => {
                const [hash, author, email, date, message] = line.split('|');
                // Convertir la date au format français DD/MM/YYYY
                const formattedDate = new Date(date).toLocaleDateString('fr-FR');
                return { hash, author, email, date: formattedDate, message };
            });
        } catch (error) {
            throw new Error(`Erreur lors de la récupération des commits: ${error.message}`);
        }
    }

    async validateRepository() {
        try {
            const { stdout } = await execAsync(
                `cd "${this.repositoryPath}" && git rev-parse --is-inside-work-tree`
            );
            return stdout.trim() === 'true';
        } catch (error) {
            return false;
        }
    }

    async getRepositoryInfo() {
        try {
            const { stdout: remoteUrl } = await execAsync(
                `cd "${this.repositoryPath}" && git config --get remote.origin.url`
            );

            const { stdout: branch } = await execAsync(
                `cd "${this.repositoryPath}" && git branch --show-current`
            );

            return {
                remoteUrl: remoteUrl.trim(),
                currentBranch: branch.trim()
            };
        } catch (error) {
            return {
                remoteUrl: 'Non disponible',
                currentBranch: 'Non disponible'
            };
        }
    }
}