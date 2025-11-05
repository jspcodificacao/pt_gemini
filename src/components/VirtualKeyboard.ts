type KeyboardLayout = {
    [sectionTitle: string]: string[];
};

const germanKeyboard: KeyboardLayout = {
    "Letras e Marcadores do Idioma": ["ß"],
    "Vogais IPA": ["ə", "ɪ", "ɛ", "ʏ", "ɐ", "ʊ", "ɔ"],
    "Consoantes IPA": ["ŋ", "ʁ", "ʒ", "ʃ", "ɲ"],
    "Sinais Diacríticos": ["̩", "̯"],
    "Traços Suprassegmentais": ["ˈ", "ˌ", "ː"],
    "Outros Símbolos IPA": ["͡"],
};

export class VirtualKeyboard {
    private activeInputElement: HTMLInputElement | null = null;

    constructor() {
        // Ouve cliques no documento para saber qual input está ativo
        document.addEventListener('focusin', (event) => {
            if (event.target instanceof HTMLInputElement && event.target.type === 'text') {
                this.activeInputElement = event.target;
            }
        });
    }

    public render(): HTMLElement {
        const keyboardContainer = document.createElement('div');
        keyboardContainer.className = 'p-4 bg-gray-200 rounded-lg shadow';

        const layout = this.getLayoutForLanguage();

        for (const sectionTitle in layout) {
            const sectionEl = document.createElement('div');
            sectionEl.className = 'mb-4';

            const titleEl = document.createElement('h4');
            titleEl.className = 'text-xs uppercase text-gray-600 font-bold mb-2';
            titleEl.textContent = sectionTitle;
            sectionEl.appendChild(titleEl);

            const keysContainer = document.createElement('div');
            keysContainer.className = 'flex flex-wrap gap-2';
            
            layout[sectionTitle].forEach(key => {
                const keyButton = document.createElement('button');
                keyButton.className = 'w-12 h-12 bg-white rounded-md shadow hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500';
                keyButton.innerHTML = `<span class="text-2xl font-mono">${key}</span>`;
                keyButton.addEventListener('click', () => this.handleKeyPress(key));
                keysContainer.appendChild(keyButton);
            });
            sectionEl.appendChild(keysContainer);
            keyboardContainer.appendChild(sectionEl);
        }

        return keyboardContainer;
    }

    private handleKeyPress(key: string) {
        if (!this.activeInputElement) {
            return;
        }

        const input = this.activeInputElement;
        const start = input.selectionStart ?? 0;
        const end = input.selectionEnd ?? 0;
        const currentValue = input.value;

        // Lógica especial para diacríticos
        if (this.isCombiningDiacritic(key) && start > 0) {
            // Usa Intl.Segmenter para obter o último grafema (caractere visual) antes do cursor.
            // Isso lida corretamente com caracteres que já possuem diacríticos.
            const segmenter = new Intl.Segmenter([], { granularity: 'grapheme' });
            const segments = [...segmenter.segment(currentValue.substring(0, start))];
            const lastSegment = segments.pop();
            const combined = this.combineChars(lastSegment?.segment ?? '', key);
             if (combined) {
                // Substitui o último grafema pelo combinado
                const lastSegmentLength = lastSegment?.segment.length ?? 1;
                input.value = currentValue.substring(0, start - lastSegmentLength) + combined + currentValue.substring(end);
                const newCursorPosition = start - lastSegmentLength + combined.length;
                input.setSelectionRange(newCursorPosition, newCursorPosition);
             } else {
                // Se não for uma combinação válida, apenas insere
                this.insertText(key);
             }
        } else {
            this.insertText(key);
        }
        
        input.focus();
        // Dispara um evento de 'input' para que a lógica de validação (ex: habilitar botão) funcione
        input.dispatchEvent(new Event('input', { bubbles: true, cancelable: true }));
    }

    private insertText(text: string) {
        if (!this.activeInputElement) return;
        this.activeInputElement.setRangeText(text, this.activeInputElement.selectionStart ?? 0, this.activeInputElement.selectionEnd ?? 0, 'end');
    }

    private isCombiningDiacritic(key: string): boolean {
        return ["̩", "̯"].includes(key);
    }
    
    private combineChars(char: string, diacritic: string): string | null {
        // Regras de combinação conforme a especificação
        const rules: { [key: string]: { chars: string, result: string[] } } = {
            '̯': { chars: 'əɪɛʏɐʊɔ', result: ['ə̯', 'ɪ̯', 'ɛ̯', 'ʏ̯', 'ɐ̯', 'ʊ̯', 'ɔ̯'] },
            '̩': { chars: 'mnŋlrɹ', result: ['m̩', 'n̩', 'ŋ̩', 'l̩', 'r̩', 'ɹ̩'] }
        };

        const rule = rules[diacritic];
        if (rule) {
            const charIndex = rule.chars.indexOf(char);
            if (charIndex > -1) {
                return rule.result[charIndex];
            }
        }
        return null;
    }

    private getLayoutForLanguage(): KeyboardLayout {
        // No futuro, pode ter um switch para diferentes idiomas
        return germanKeyboard;
    }
}