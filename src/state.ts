import { Knowledge, KnowledgeBase, PracticeHistory, Session, Exercise, KnowledgeType } from './types/domain';
import { v4 as uuidv4 } from 'uuid';

class ApplicationState {
    private knowledgeBase: KnowledgeBase = [];
    private practiceHistory: PracticeHistory = [];
    private currentSession: Session | null = null;
    private usedKnowledgeIdsInSession: Set<string> = new Set();

    // --- Getters e Setters ---
    public setKnowledgeBase(base: KnowledgeBase) {
        this.knowledgeBase = base;
    }

    public setPracticeHistory(history: PracticeHistory) {
        this.practiceHistory = history;
    }

    public getPracticeHistory(): PracticeHistory {
        return this.practiceHistory;
    }
    
    public getCurrentSession(): Session | null {
        return this.currentSession;
    }

    // --- Gerenciamento da Sessão ---
    public startNewSession() {
        // Encerra a sessão anterior se ela contiver exercícios
        if (this.currentSession && this.currentSession.exercicios.length > 0) {
            this.endCurrentSession();
        }

        this.currentSession = {
            sessao_id: uuidv4(),
            data_inicio: new Date().toISOString(),
            data_fim: '', // Será definida no final
            exercicios: [],
        };
        this.usedKnowledgeIdsInSession.clear();
    }

    public endCurrentSession() {
        if (this.currentSession && this.currentSession.exercicios.length > 0) {
            this.currentSession.data_fim = new Date().toISOString();
            this.addSessionToHistory(this.currentSession);
        }
        this.currentSession = null;
    }
    
    private addSessionToHistory(session: Session) {
        this.practiceHistory.push(session);
    }

    public addExerciseToSession(exercise: Exercise) {
        if (this.currentSession) {
            this.currentSession.exercicios.push(exercise);
        }
    }

    // --- Lógica de Seleção de Conhecimento ---
    public getNextKnowledgeItem(type: KnowledgeType | 'both' = 'both'): Knowledge | null {
        let filteredKnowledge = this.knowledgeBase;

        if (type !== 'both') {
            filteredKnowledge = this.knowledgeBase.filter(item => item.tipo_conhecimento === type);
        }

        const availableKnowledge = filteredKnowledge.filter(
            item => !this.usedKnowledgeIdsInSession.has(item.conhecimento_id)
        );

        if (availableKnowledge.length === 0) {
            return null;
        }
        
        const randomIndex = Math.floor(Math.random() * availableKnowledge.length);
        const selectedItem = availableKnowledge[randomIndex];

        this.usedKnowledgeIdsInSession.add(selectedItem.conhecimento_id);

        return selectedItem;
    }
}

// Exporta uma instância única (Singleton) do estado usando um EXPORT NOMEADO.
export const AppState = new ApplicationState();