import { AppState } from '../state';

export class HistoryService {
    /**
     * Finaliza a sessão atual (se necessário), gera o JSON do histórico e inicia o download.
     */
    public static downloadHistory(): void {
        // Garante que a sessão atual, se tiver exercícios, seja finalizada e adicionada ao histórico
        AppState.endCurrentSession();
        
        const history = AppState.getPracticeHistory();
        if (!history || history.length === 0) {
            alert("Nenhum histórico para baixar.");
            return;
        }

        const dataStr = JSON.stringify(history, null, 2);
        const dataBlob = new Blob([dataStr], { type: "application/json" });
        const url = URL.createObjectURL(dataBlob);

        const a = document.createElement('a');
        a.href = url;
        a.download = 'historico_de_pratica_de_traducao.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
}