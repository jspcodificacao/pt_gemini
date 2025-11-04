export class ResultScreen {
    public render(results: any, onNext: () => void): HTMLElement {
        const container = document.createElement('div');
        let resultsHtml = '<ul>';
        results.campos_preenchidos.forEach((field: string, index: number) => {
            const userValue = results.valores_preenchidos[index];
            const isCorrect = results.campos_resultados[index];
            const correctValue = results.knowledge[field];
            resultsHtml += `
                <li class="mb-2">
                    <strong>${field}:</strong> ${userValue} 
                    ${isCorrect ? '<span class="text-green-500">✔️</span>' : `<span class="text-red-500">❌ (Correto: ${correctValue})</span>`}
                </li>
            `;
        });
        resultsHtml += '</ul>';

        container.innerHTML = `
            <h2 class="text-xl font-bold mb-4">Resultado</h2>
            ${resultsHtml}
            <button id="next" class="mt-4 p-2 bg-blue-500 text-white rounded">Próximo</button>
        `;

        container.querySelector('#next')?.addEventListener('click', onNext);

        return container;
    }
}