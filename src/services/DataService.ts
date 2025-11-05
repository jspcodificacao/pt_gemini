import { KnowledgeBase, PracticeHistory } from '../types/domain';

export class DataService {
    public static async loadKnowledgeBase(): Promise<KnowledgeBase> {
        try {
            const response = await fetch('/data/[BASE] Conhecimento de idiomas.json');
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return await response.json();
        } catch (error) {
            console.error('Failed to load knowledge base:', error);
            throw new Error('Não foi possível carregar a base de conhecimento.');
        }
    }

    public static async loadPracticeHistory(): Promise<PracticeHistory> {
        try {
            const response = await fetch('/data/historico_de_pratica_de_traducao.json');
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return await response.json();
        } catch (error) {
            console.error('Failed to load practice history:', error);
            throw new Error('Não foi possível carregar o histórico de prática.');
        }
    }
}