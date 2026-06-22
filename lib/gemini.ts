import { GoogleGenAI } from "@google/genai"

const SYSTEM_PROMPT = `Você é um classificador de campos de formulário. Recebe um texto com perguntas de briefing já escritas e deve classificar cada pergunta no tipo de campo correto, estruturando a saída em blocos temáticos.

## DICIONÁRIO DE TIPOS DE CAMPO

| Tipo | Quando usar |
|---|---|
| short_text | Resposta de uma linha — nome, telefone, hex de cor, WhatsApp |
| long_text | Resposta em parágrafo, várias frases |
| link | Pergunta pede URL (site, Instagram, Flickr) — aceita 1 ou vários links |
| file_upload | Pergunta pede anexo (logo, manual de marca, fotos, PDF) |
| single_select | Escolha única entre opções fixas |
| multi_select | Múltipla escolha entre opções fixas |
| date | Pergunta pede uma data |
| repeatable_group | Pergunta repetível por item (ex: serviços com nome + descrição) |

## REGRAS DE CLASSIFICAÇÃO

- Se a pergunta pede "cole o link/url/site" → "link"
- Se pede upload/arquivo/imagem/PDF/logo → "file_upload", com accepted_formats inferido do contexto
- Se tem opções com marcador de lista e sugere "escolha uma" → "single_select"; se sugere "marque todas" ou plural → "multi_select"
- Se o enunciado tem "repetível por item" ou estrutura de "Nome / Descrição" repetida → "repeatable_group"
- Texto entre *itálico* ou *Ex:* vira helper_text, nunca um novo campo
- Default de required é true, a menos que o texto diga explicitamente "opcional" ou "se houver"

## CONFIGURAÇÕES POR TIPO

- link: { "multiple": true|false }
- file_upload: { "accepted_formats": ["pdf","png","jpg","svg"], "multiple": true|false }
- single_select: { "options": [...], "allow_other": true|false }
- multi_select: { "options": [...], "allow_other": true|false }
- repeatable_group: { "sub_fields": [{ "label": "...", "type": "short_text|long_text" }] }
- Demais tipos: config = {}

## REGRA CRÍTICA — NUNCA OMITA options

Para single_select e multi_select: o array "options" é OBRIGATÓRIO e NUNCA pode ser vazio.
Derive as opções diretamente do texto da pergunta ou do contexto imediato.
Se a pergunta não listar opções explicitamente, infira as mais prováveis (ex: "Sim" / "Não" para perguntas binárias).
Um campo single_select ou multi_select sem options torna o formulário impossível de responder — isso é um erro crítico.`

const RESPONSE_SCHEMA = {
  type: "object",
  properties: {
    blocks: {
      type: "array",
      items: {
        type: "object",
        properties: {
          title: { type: "string" },
          questions: {
            type: "array",
            items: {
              type: "object",
              properties: {
                label: { type: "string" },
                type: {
                  type: "string",
                  enum: [
                    "short_text",
                    "long_text",
                    "link",
                    "file_upload",
                    "single_select",
                    "multi_select",
                    "date",
                    "repeatable_group",
                  ],
                },
                helper_text: { type: "string", nullable: true },
                required: { type: "boolean" },
                config: {
                  type: "object",
                  properties: {
                    options: {
                      type: "array",
                      items: { type: "string" },
                    },
                    allow_other: { type: "boolean" },
                    multiple: { type: "boolean" },
                    accepted_formats: {
                      type: "array",
                      items: { type: "string" },
                    },
                    sub_fields: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          label: { type: "string" },
                          type: { type: "string" },
                        },
                        required: ["label", "type"],
                      },
                    },
                  },
                },
              },
              required: ["label", "type", "helper_text", "required", "config"],
            },
          },
        },
        required: ["title", "questions"],
      },
    },
  },
  required: ["blocks"],
}

export async function generateBriefingSchema(rawText: string) {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: `Texto do briefing:\n\n${rawText}`,
    config: {
      systemInstruction: SYSTEM_PROMPT,
      responseMimeType: "application/json",
      responseSchema: RESPONSE_SCHEMA,
      temperature: 0.2,
    },
  })

  const jsonStr = response.text ?? ""
  return JSON.parse(jsonStr)
}
