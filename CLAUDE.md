# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a language learning web application for practicing translation exercises, specifically focused on German ("Alemão"). The app presents randomized translation exercises with fields like original text, IPA transcription, syllable division, and Portuguese translation. It includes audio playback via TTS API and tracks practice history.

## Development Commands

```bash
# Start development server
pnpm dev

# Build for production (runs TypeScript compiler first, then Vite build)
pnpm build

# Preview production build
pnpm preview
```

## Architecture

### State Management
- **Singleton pattern**: The app uses a global singleton `AppState` (in `src/state.ts`) to manage all application state
- State includes: knowledge base, practice history, current session, and used knowledge IDs
- All components access state through `AppState` - never create multiple instances

### Data Flow
1. **App initialization** (`src/App.ts`):
   - Loads knowledge base from `/data/[BASE] Conhecimento de idiomas.json`
   - Loads practice history from `/data/historico_de_pratica_de_traducao.json`
   - Initializes `AppState` with loaded data
   - Starts a new session

2. **Exercise cycle**:
   - `AppState.getNextKnowledgeItem()` returns a random unused knowledge item
   - `ExerciseScreen` renders the exercise with one field pre-filled (randomly selected)
   - User fills in remaining fields using virtual keyboard
   - On verification, results are stored in current session via `AppState.addExerciseToSession()`
   - `ResultScreen` displays results and allows progression to next exercise

3. **Session management**:
   - Sessions track multiple exercises with timestamps
   - Each session has a unique UUID and contains an array of exercises
   - When session ends (manually or automatically), it's added to practice history
   - History can be downloaded as JSON via `HistoryService.downloadHistory()`

### Key Components

**ExerciseScreen** (`src/components/ExerciseScreen.ts`):
- Main exercise interface
- Randomly selects one field to pre-fill (texto_original, divisao_silabica, transcricao_ipa, or traducao)
- Integrates VirtualKeyboard for IPA and special characters
- Handles audio playback button (only visible when texto_original is pre-filled)
- String comparison normalizes input (lowercase, trims whitespace, removes punctuation)

**VirtualKeyboard** (`src/components/VirtualKeyboard.ts`):
- Provides IPA symbols and German special characters (ß)
- Handles combining diacritics (̩, ̯) using `Intl.Segmenter` for proper grapheme handling
- Tracks active input element via focusin event
- Inserts characters at cursor position

**ResultScreen** (`src/components/ResultScreen.ts`):
- Displays verification results with correct/incorrect indicators
- Shows correct answers for failed fields

### Services

**DataService** (`src/services/DataService.ts`):
- Loads knowledge base and practice history from `/data/` directory
- Static methods for fetching JSON files

**AudioService** (`src/services/AudioService.ts`):
- Integrates with external TTS API at `http://localhost:8000/api/generate-audio`
- Receives Base64-encoded audio, decodes, and plays using Web Audio API
- **Important**: Requires external audio service to be running on localhost:8000

**HistoryService** (`src/services/HistoryService.ts`):
- Generates and downloads practice history as JSON
- Automatically ends current session before download

### Type System

All domain types are defined in `src/types/domain.ts`:
- `Knowledge`: Core data structure with conhecimento_id, language, type (Frase/Palavra), text fields, IPA, translation, syllable division
- `Exercise`: Records which field was provided and user's answers with results
- `Session`: Collection of exercises with timestamps
- Note: There's a duplicate import issue - DataService imports from `types/schemas` which doesn't exist, should import from `types/domain`

### Data Format

**Knowledge Base** (`data/[BASE] Conhecimento de idiomas.json`):
```json
{
  "conhecimento_id": "uuid",
  "data_hora": "ISO 8601 datetime",
  "idioma": "alemao",
  "tipo_conhecimento": "frase" | "palavra",
  "texto_original": "string",
  "transcricao_ipa": "IPA string",
  "traducao": "Portuguese translation",
  "divisao_silabica": "syllable-separated text"
}
```

**Practice History** (`data/historico_de_pratica_de_traducao.json`):
```json
{
  "sessao_id": "uuid",
  "data_inicio": "ISO 8601 datetime",
  "data_fim": "ISO 8601 datetime",
  "exercicios": [
    {
      "conhecimento_id": "uuid",
      "campo_fornecido": "field name",
      "campos_preenchidos": ["field names"],
      "valores_preenchidos": ["user values"],
      "campos_resultados": [boolean]
    }
  ]
}
```

## Known Issues

1. **Import path bug**: `DataService.ts:1` imports from `'../types/schemas'` but should import from `'../types/domain'`
2. **External dependency**: Audio functionality requires separate TTS service running on `http://localhost:8000/api/generate-audio`
3. **Language limitation**: Currently hardcoded to German ("Alemão") only

## Tech Stack

- **TypeScript**: Strict mode enabled with comprehensive linting rules
- **Vite**: Build tool and dev server
- **Tailwind CSS**: Utility-first CSS framework (PostCSS configured)
- **Vanilla TypeScript**: No framework - pure DOM manipulation with class-based components
- **UUID**: For generating unique IDs
