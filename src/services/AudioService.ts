export class AudioService {
    private static audioContext = new AudioContext();

    /**
     * Envia um texto para a API TTS, recebe o áudio, decodifica e toca.
     * @param text O texto a ser convertido em fala.
     */
    public static async playAudio(text: string): Promise<void> {
        if (!text) {
            console.warn("Nenhum texto fornecido para gerar áudio.");
            return;
        }

        try {
            const response = await fetch('http://localhost:8000/api/generate-audio', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    text: text,
                    speed: 1.0, // Velocidade padrão
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            const audioBase64 = data.audio;

            // Decodifica a string Base64 para um ArrayBuffer
            const audioBytes = atob(audioBase64);
            const audioArrayBuffer = new ArrayBuffer(audioBytes.length);
            const uint8Array = new Uint8Array(audioArrayBuffer);
            for (let i = 0; i < audioBytes.length; i++) {
                uint8Array[i] = audioBytes.charCodeAt(i);
            }

            // Decodifica os dados de áudio para tocar
            const audioBuffer = await this.audioContext.decodeAudioData(audioArrayBuffer);
            const source = this.audioContext.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(this.audioContext.destination);
            source.start(0);

        } catch (error) {
            console.error("Falha ao gerar ou tocar áudio:", error);
            alert(`Erro ao contatar o serviço de áudio: ${error}`);
        }
    }
}