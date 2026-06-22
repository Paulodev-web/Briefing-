"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
  ChevronDown, ChevronUp, GripVertical, Plus, Trash2, X,
} from "lucide-react"
import type { BriefingSchema, SchemaBlock, SchemaQuestion, FieldType } from "@/lib/types"

const FIELD_TYPE_LABELS: Record<FieldType, string> = {
  short_text: "Texto curto",
  long_text: "Texto longo",
  link: "Link / URL",
  file_upload: "Upload de arquivo",
  single_select: "Seleção única",
  multi_select: "Seleção múltipla",
  date: "Data",
  repeatable_group: "Grupo repetível",
}

interface FormBuilderProps {
  schema: BriefingSchema
  onChange: (schema: BriefingSchema) => void
  readOnly?: boolean
}

export function FormBuilder({ schema, onChange, readOnly }: FormBuilderProps) {
  const [collapsed, setCollapsed] = useState<Record<number, boolean>>({})

  function updateBlock(bi: number, update: Partial<SchemaBlock>) {
    const blocks = [...schema.blocks]
    blocks[bi] = { ...blocks[bi], ...update }
    onChange({ blocks })
  }

  function addBlock() {
    onChange({
      blocks: [
        ...schema.blocks,
        { title: "Novo bloco", questions: [] },
      ],
    })
  }

  function removeBlock(bi: number) {
    const blocks = schema.blocks.filter((_, i) => i !== bi)
    onChange({ blocks })
  }

  function moveBlock(bi: number, dir: -1 | 1) {
    const blocks = [...schema.blocks]
    const target = bi + dir
    if (target < 0 || target >= blocks.length) return
    ;[blocks[bi], blocks[target]] = [blocks[target], blocks[bi]]
    onChange({ blocks })
  }

  function addQuestion(bi: number) {
    const blocks = [...schema.blocks]
    blocks[bi].questions = [
      ...blocks[bi].questions,
      { label: "Nova pergunta", type: "short_text", helper_text: null, required: true, config: {} },
    ]
    onChange({ blocks })
  }

  function removeQuestion(bi: number, qi: number) {
    const blocks = [...schema.blocks]
    blocks[bi].questions = blocks[bi].questions.filter((_, i) => i !== qi)
    onChange({ blocks })
  }

  function updateQuestion(bi: number, qi: number, update: Partial<SchemaQuestion>) {
    const blocks = [...schema.blocks]
    blocks[bi].questions[qi] = { ...blocks[bi].questions[qi], ...update }
    onChange({ blocks })
  }

  function handleTypeChange(bi: number, qi: number, type: FieldType) {
    const defaultConfigs: Record<FieldType, Record<string, unknown>> = {
      short_text: {},
      long_text: {},
      date: {},
      link: { multiple: false },
      file_upload: { accepted_formats: ["pdf", "png", "jpg"], multiple: false },
      single_select: { options: ["Opção 1", "Opção 2"], allow_other: false },
      multi_select: { options: ["Opção 1", "Opção 2"], allow_other: false },
      repeatable_group: { sub_fields: [{ label: "Nome", type: "short_text" }, { label: "Descrição", type: "long_text" }] },
    }
    updateQuestion(bi, qi, { type, config: defaultConfigs[type] })
  }

  if (!schema.blocks.length) {
    return (
      <div className="border-2 border-dashed rounded-lg p-8 text-center text-muted-foreground">
        <p className="text-sm">Nenhum bloco. Gere via IA ou adicione manualmente.</p>
        {!readOnly && (
          <Button variant="outline" size="sm" className="mt-3" onClick={addBlock}>
            <Plus className="h-3.5 w-3.5 mr-1" /> Adicionar bloco
          </Button>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {schema.blocks.map((block, bi) => (
        <Card key={bi} className="overflow-hidden">
          <CardHeader className="p-3 bg-muted/30 flex-row items-center gap-2">
            <GripVertical className="h-4 w-4 text-muted-foreground shrink-0" />
            <Input
              value={block.title}
              onChange={(e) => updateBlock(bi, { title: e.target.value })}
              className="h-7 text-sm font-medium border-0 bg-transparent p-0 focus-visible:ring-0 focus-visible:ring-offset-0"
              disabled={readOnly}
            />
            <div className="flex items-center gap-1 ml-auto shrink-0">
              <button
                onClick={() => moveBlock(bi, -1)}
                disabled={bi === 0 || readOnly}
                className="p-1 rounded hover:bg-muted disabled:opacity-30"
              >
                <ChevronUp className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => moveBlock(bi, 1)}
                disabled={bi === schema.blocks.length - 1 || readOnly}
                className="p-1 rounded hover:bg-muted disabled:opacity-30"
              >
                <ChevronDown className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => setCollapsed((c) => ({ ...c, [bi]: !c[bi] }))}
                className="p-1 rounded hover:bg-muted"
              >
                {collapsed[bi] ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronUp className="h-3.5 w-3.5" />}
              </button>
              {!readOnly && (
                <button
                  onClick={() => removeBlock(bi)}
                  className="p-1 rounded hover:bg-muted text-destructive"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </CardHeader>

          {!collapsed[bi] && (
            <CardContent className="p-3 space-y-3">
              {block.questions.map((q, qi) => (
                <QuestionEditor
                  key={qi}
                  question={q}
                  onUpdate={(update) => updateQuestion(bi, qi, update)}
                  onTypeChange={(type) => handleTypeChange(bi, qi, type)}
                  onRemove={() => removeQuestion(bi, qi)}
                  readOnly={readOnly}
                />
              ))}

              {!readOnly && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full border-dashed border"
                  onClick={() => addQuestion(bi)}
                >
                  <Plus className="h-3.5 w-3.5 mr-1" /> Adicionar pergunta
                </Button>
              )}
            </CardContent>
          )}
        </Card>
      ))}

      {!readOnly && (
        <Button variant="outline" size="sm" className="w-full" onClick={addBlock}>
          <Plus className="h-3.5 w-3.5 mr-1" /> Adicionar bloco
        </Button>
      )}
    </div>
  )
}

function QuestionEditor({
  question,
  onUpdate,
  onTypeChange,
  onRemove,
  readOnly,
}: {
  question: SchemaQuestion
  onUpdate: (u: Partial<SchemaQuestion>) => void
  onTypeChange: (t: FieldType) => void
  onRemove: () => void
  readOnly?: boolean
}) {
  return (
    <div className="border rounded-md p-3 space-y-2 bg-background">
      <div className="flex items-start gap-2">
        <div className="flex-1 space-y-2">
          <Input
            value={question.label}
            onChange={(e) => onUpdate({ label: e.target.value })}
            placeholder="Label da pergunta"
            className="text-sm h-8"
            disabled={readOnly}
          />
          <div className="flex gap-2">
            <Select
              value={question.type}
              onValueChange={(v) => onTypeChange(v as FieldType)}
              disabled={readOnly}
            >
              <SelectTrigger className="h-8 text-xs flex-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(FIELD_TYPE_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value} className="text-xs">
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <label className="flex items-center gap-1.5 text-xs text-muted-foreground whitespace-nowrap">
              <input
                type="checkbox"
                checked={question.required}
                onChange={(e) => onUpdate({ required: e.target.checked })}
                disabled={readOnly}
                className="rounded"
              />
              Obrigatório
            </label>
          </div>
        </div>
        {!readOnly && (
          <button onClick={onRemove} className="p-1 rounded hover:bg-muted text-destructive mt-0.5 shrink-0">
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      <Input
        value={question.helper_text ?? ""}
        onChange={(e) => onUpdate({ helper_text: e.target.value || null })}
        placeholder="Texto de ajuda (opcional)"
        className="text-xs h-7 text-muted-foreground"
        disabled={readOnly}
      />

      <ConfigEditor question={question} onUpdate={onUpdate} readOnly={readOnly} />
    </div>
  )
}

function ConfigEditor({
  question,
  onUpdate,
  readOnly,
}: {
  question: SchemaQuestion
  onUpdate: (u: Partial<SchemaQuestion>) => void
  readOnly?: boolean
}) {
  const { type, config } = question

  if (type === "single_select" || type === "multi_select") {
    const options = (config.options as string[]) ?? []
    return (
      <div className="space-y-1.5 pt-1">
        <Label className="text-xs">Opções</Label>
        {options.map((opt, i) => (
          <div key={i} className="flex gap-1">
            <Input
              value={opt}
              onChange={(e) => {
                const newOpts = [...options]
                newOpts[i] = e.target.value
                onUpdate({ config: { ...config, options: newOpts } })
              }}
              className="h-7 text-xs"
              disabled={readOnly}
            />
            {!readOnly && (
              <button
                onClick={() => onUpdate({ config: { ...config, options: options.filter((_, j) => j !== i) } })}
                className="p-1 text-muted-foreground hover:text-destructive"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>
        ))}
        {!readOnly && (
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs"
            onClick={() => onUpdate({ config: { ...config, options: [...options, ""] } })}
          >
            <Plus className="h-3 w-3 mr-1" /> Adicionar opção
          </Button>
        )}
        <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <input
            type="checkbox"
            checked={!!config.allow_other}
            onChange={(e) => onUpdate({ config: { ...config, allow_other: e.target.checked } })}
            disabled={readOnly}
          />
          Permitir "Outro"
        </label>
      </div>
    )
  }

  if (type === "file_upload") {
    const formats = (config.accepted_formats as string[]) ?? []
    return (
      <div className="space-y-1.5 pt-1 text-xs">
        <Label className="text-xs">Formatos aceitos (separados por vírgula)</Label>
        <Input
          value={formats.join(", ")}
          onChange={(e) => onUpdate({ config: { ...config, accepted_formats: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) } })}
          placeholder="pdf, png, jpg, svg"
          className="h-7 text-xs"
          disabled={readOnly}
        />
        <label className="flex items-center gap-1.5 text-muted-foreground">
          <input
            type="checkbox"
            checked={!!config.multiple}
            onChange={(e) => onUpdate({ config: { ...config, multiple: e.target.checked } })}
            disabled={readOnly}
          />
          Permitir múltiplos arquivos
        </label>
      </div>
    )
  }

  if (type === "link") {
    return (
      <label className="flex items-center gap-1.5 text-xs text-muted-foreground pt-1">
        <input
          type="checkbox"
          checked={!!config.multiple}
          onChange={(e) => onUpdate({ config: { ...config, multiple: e.target.checked } })}
          disabled={readOnly}
        />
        Permitir múltiplos links
      </label>
    )
  }

  return null
}
