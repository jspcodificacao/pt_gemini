import { ExerciseScreen } from './components/ExerciseScreen';
import { ResultScreen } from './components/ResultScreen';
import { DataService } from './services/DataService';
import { AppState } from './state';
import { Knowledge, PracticeHistory } from './types/domain';

export class App {
    private exerciseScreen: ExerciseScreen;
    private resultScreen: ResultScreen;

    constructor(private element: HTMLElement) {
        this.exerciseScreen = new ExerciseScreen(
            () => this.showExercise(), 
            () => this.endSessionAndRestart()
        );
        this.resultScreen = new ResultScreen();
        this.init();
    }

    private async init() {
        try {
            const knowledgeBase = await DataService.loadKnowledgeBase();
            AppState.setKnowledgeBase(knowledgeBase);

            let practiceHistory: PracticeHistory;
            try {
                practiceHistory = await DataService.loadPracticeHistory();
            } catch (error) {
                if (confirm('Não foi encontrado o histórico de prática. Deseja criar um novo?')) {
                    practiceHistory = [];
                } else {
                    alert("A aplicação não pode continuar sem um histórico. Por favor, recarregue a página e aceite criar um novo histórico.");
                    this.showError(new Error("Criação de novo histórico cancelada pelo usuário."), true);
                    return;
                }
            }
            AppState.setPracticeHistory(practiceHistory);

            this.startNewSession();
        } catch (error) {
            this.showError(error as Error, true);
        }
    }

    private startNewSession() {
        AppState.startNewSession();
        this.showExercise();
    }

    private showExercise() {
        const nextKnowledge = AppState.getNextKnowledgeItem();
        if (nextKnowledge) {
            this.element.innerHTML = '';
            this.element.appendChild(this.exerciseScreen.render(nextKnowledge, (results) => this.showResult(results, nextKnowledge)));
        } else {
            alert('Todos os itens de conhecimento foram utilizados nesta sessão.');
            this.endSessionAndRestart();
        }
    }

    private showResult(results: any, knowledge: Knowledge) {
        this.element.innerHTML = '';
        this.element.appendChild(this.resultScreen.render({ ...results, knowledge }, () => this.showExercise()));
    }

    private endSessionAndRestart() {
        AppState.endCurrentSession();
        alert("Sessão encerrada. Uma nova sessão será iniciada.");
        this.startNewSession();
    }

    private showError(error: Error, isFatal = false) {
        this.element.innerHTML = `
            <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                <strong class="font-bold">Erro!</strong>
                <p>Mensagem para o usuário: ${error.message}</p>
                <p class="text-sm mt-2">Detalhe técnico: ${error.stack || 'N/A'}</p>
                ${isFatal ? '<p class="mt-2 font-bold">A aplicação foi abortada.</p>' : ''}
            </div>
        `;
    }
}