import { Knowledge } from '../types/domain';
import { VirtualKeyboard } from './VirtualKeyboard';
import { AudioService } from '../services/AudioService';
import { AppState } from '../state';
import { HistoryService } from '../services/HistoryService';

export class ExerciseScreen {
    private keyboard: VirtualKeyboard;
    private selectedKnowledgeType: 'both' | 'Palavra' | 'Frase' = 'both';

    constructor(private onNewExercise: () => void, private onEndSession: () => void) {
        this.keyboard = new VirtualKeyboard();
    }

    public getSelectedKnowledgeType(): 'both' | 'Palavra' | 'Frase' {
        return this.selectedKnowledgeType;
    }

    public render(knowledge: Knowledge, onVerify: (results: any) => void): HTMLElement {
        const container = document.createElement('div');
        container.className = 'w-full max-w-4xl mx-auto';
        container.innerHTML = `
            <h1 class="text-3xl font-bold mb-4 text-center">Prática de Tradução</h1>
            <div class="flex justify-between items-center mb-4 p-4 bg-white rounded-lg shadow">
                <div>
                    <label for="knowledge-type" class="mr-2 font-semibold">Tipo de Conhecimento:</label>
                    <select id="knowledge-type" class="p-2 border rounded-md shadow-sm">
                        <option value="both">Ambos</option>
                        <option value="Palavra">Palavra</option>
                        <option value="Frase">Frase</option>
                    </select>
                </div>
                <button id="download-history" class="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">Baixar Histórico</button>
            </div>
            <div class="p-6 bg-white rounded-lg shadow space-y-4">
                <h3 class="text-xl font-semibold text-gray-700">${knowledge.idioma}</h3>
                <div>
                    <label for="texto_original" class="block text-sm font-medium text-gray-700">Texto Original</label>
                    <div class="flex items-center relative">
                        <input type="text" id="texto_original" class="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" />
                        <button id="play-audio" class="ml-2 p-2 bg-gray-200 rounded-full hover:bg-gray-300 transition-colors absolute right-2 top-1/2 -translate-y-1/2 flex items-center justify-center w-8 h-8">
                            <span id="play-icon">▶️</span>
                        </button>
                    </div>
                </div>
                <div>
                    <label for="divisao_silabica" class="block text-sm font-medium text-gray-700">Divisão Silábica</label>
                    <input type="text" id="divisao_silabica" class="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" />
                </div>
                <div>
                    <p class="text-xs italic text-gray-500">Ao fazer a transcrição, lembre-se de marcar precisamente não apenas os sons individuais, mas também a ênfase, comprimento vocálico, redução vocálica e africadas.</p>
                    <label for="transcricao_ipa" class="block text-sm font-medium text-gray-700">Transcrição IPA</label>
                    <input type="text" id="transcricao_ipa" class="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" />
                </div>
                <div>
                    <label for="traducao" class="block text-sm font-medium text-gray-700">Tradução</label>
                    <input type="text" id="traducao" class="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" />
                </div>
            </div>
            <div id="virtual-keyboard" class="mt-4"></div>
            <div class="mt-6 flex justify-between items-center">
                <button id="verify" class="px-6 py-3 bg-green-500 text-white font-bold rounded-lg shadow hover:bg-green-600 transition-colors disabled:bg-gray-400" disabled>Verificar</button>
                <button id="end-session" class="px-6 py-3 bg-red-500 text-white font-bold rounded-lg shadow hover:bg-red-600 transition-colors">Encerrar Sessão e Salvar</button>
            </div>
        `;

        const providedField = this.getRandomField();
        const providedInput = container.querySelector(`#${providedField}`) as HTMLInputElement;
        providedInput.value = knowledge[providedField] as string;
        providedInput.disabled = true;
        providedInput.classList.add('bg-gray-100');
        
        const playButton = container.querySelector('#play-audio') as HTMLButtonElement;
        if(providedField !== 'texto_original') {
             playButton.style.display = 'none';
        }

        container.querySelector('#virtual-keyboard')?.appendChild(this.keyboard.render());

        const verifyButton = container.querySelector('#verify') as HTMLButtonElement;
        const allInputs = Array.from(container.querySelectorAll('input[type="text"]')) as HTMLInputElement[];

        allInputs.forEach(input => {
            input.addEventListener('input', () => {
                const anyFilled = allInputs.some(i => i.value.trim() !== '' && !i.disabled);
                verifyButton.disabled = !anyFilled;
            });
        });

        verifyButton.addEventListener('click', () => {
            const results = this.verify(knowledge, allInputs);
            AppState.addExerciseToSession({
                conhecimento_id: knowledge.conhecimento_id,
                campo_fornecido: providedField,
                ...results
            });
            onVerify(results);
        });
        
        playButton.addEventListener('click', async () => {
            const text = (container.querySelector('#texto_original') as HTMLInputElement).value;
            const playIcon = container.querySelector('#play-icon') as HTMLSpanElement;
            playIcon.textContent = '⌛';
            playButton.disabled = true;
            await AudioService.playAudio(text);
            playIcon.textContent = '▶️';
            playButton.disabled = false;
        });

        const knowledgeTypeSelector = container.querySelector('#knowledge-type') as HTMLSelectElement;
        knowledgeTypeSelector.value = this.selectedKnowledgeType;
        knowledgeTypeSelector.addEventListener('change', () => {
            this.selectedKnowledgeType = knowledgeTypeSelector.value as 'both' | 'Palavra' | 'Frase';
            this.onNewExercise();
        });

        container.querySelector('#download-history')?.addEventListener('click', () => {
            HistoryService.downloadHistory();
        });
        
        container.querySelector('#end-session')?.addEventListener('click', () => {
            this.onEndSession();
        });

        return container;
    }

    private getRandomField(): "texto_original" | "divisao_silabica" | "transcricao_ipa" | "traducao" {
        const fields: ("texto_original" | "divisao_silabica" | "transcricao_ipa" | "traducao")[] = ["texto_original", "divisao_silabica", "transcricao_ipa", "traducao"];
        return fields[Math.floor(Math.random() * fields.length)];
    }

    private verify(knowledge: Knowledge, inputs: HTMLInputElement[]) {
        const campos_preenchidos: string[] = [];
        const valores_preenchidos: string[] = [];
        const campos_resultados: boolean[] = [];

        inputs.forEach(input => {
            if (!input.disabled && input.value.trim() !== '') {
                const field = input.id;
                campos_preenchidos.push(field);
                valores_preenchidos.push(input.value);
                const isCorrect = this.compareStrings(input.value, knowledge[field as keyof Knowledge] as string);
                campos_resultados.push(isCorrect);
            }
        });
        
        return { campos_preenchidos, valores_preenchidos, campos_resultados };
    }
    
    private compareStrings(userValue: string, correctValue: string): boolean {
        const normalize = (str: string) => str.toLowerCase().trim().replace(/[.!?\[\]{}()"',;:`]/g, '');
        return normalize(userValue) === normalize(correctValue);
    }
}