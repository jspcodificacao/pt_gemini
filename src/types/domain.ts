// Tipos baseados no schema 'Conhecimento de Idiomas'
export interface Knowledge {
    conhecimento_id: string; // uuid
    data_hora: string; // date-time
    idioma: "Alemão" | "Inglês";
    tipo_conhecimento: "Frase" | "Palavra";
    texto_original: string;
    transcricao_ipa: string;
    traducao: string;
    divisao_silabica: string;
}

export type KnowledgeBase = Knowledge[];
export type KnowledgeType = "Frase" | "Palavra";

// Tipos baseados no schema 'Sessão de Exercícios'
export interface Exercise {
    conhecimento_id: string; // uuid
    campo_fornecido: "texto_original" | "divisao_silabica" | "transcricao_ipa" | "traducao";
    campos_preenchidos: string[];
    valores_preenchidos: string[];
    campos_resultados: boolean[];
}

export interface Session {
    sessao_id: string; // uuid
    data_inicio: string; // date-time
    data_fim: string; // date-time
    exercicios: Exercise[];
}

export type PracticeHistory = Session[];