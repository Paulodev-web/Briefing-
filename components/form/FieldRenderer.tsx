"use client"

import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Plus, Trash2 } from "lucide-react"
import type { BriefingAnswer, BriefingQuestion } from "@/lib/types"
import { FileUploadField } from "./fields/FileUploadField"

interface FieldRendererProps {
  question: BriefingQuestion
  answer?: BriefingAnswer
  onChange: (questionId: string, valueText?: string | null, valueJson?: unknown) => void
  briefingId: string
}

export function FieldRenderer({ question, answer, onChange, briefingId }: FieldRendererProps) {
  const { id, label, helper_text, type, required, config } = question

  const baseLabel = (
    <Label className="font-medium">
      {label}
      {required && <span className="text-destructive ml-1">*</span>}
    </Label>
  )
  const helperEl = helper_text ? (
    <p className="text-xs text-muted-foreground mt-0.5">{helper_text}</p>
  ) : null

  if (type === "short_text") {
    return (
      <div className="space-y-1.5">
        {baseLabel}
        {helperEl}
        <Input
          value={answer?.value_text ?? ""}
          onChange={(e) => onChange(id, e.target.value)}
          placeholder="Sua resposta..."
        />
      </div>
    )
  }

  if (type === "long_text") {
    return (
      <div className="space-y-1.5">
        {baseLabel}
        {helperEl}
        <Textarea
          value={answer?.value_text ?? ""}
          onChange={(e) => onChange(id, e.target.value)}
          placeholder="Sua resposta..."
          className="min-h-[100px]"
        />
      </div>
    )
  }

  if (type === "link") {
    const isMultiple = !!config.multiple
    const links: string[] = answer?.value_json
      ? (answer.value_json as string[])
      : isMultiple ? [""] : [answer?.value_text ?? ""]

    if (!isMultiple) {
      return (
        <div className="space-y-1.5">
          {baseLabel}
          {helperEl}
          <Input
            type="url"
            value={answer?.value_text ?? ""}
            onChange={(e) => onChange(id, e.target.value)}
            placeholder="https://..."
          />
        </div>
      )
    }

    return (
      <div className="space-y-1.5">
        {baseLabel}
        {helperEl}
        {links.map((link, i) => (
          <div key={i} className="flex gap-2">
            <Input
              type="url"
              value={link}
              onChange={(e) => {
                const newLinks = [...links]
                newLinks[i] = e.target.value
                onChange(id, null, newLinks)
              }}
              placeholder="https://..."
            />
            {links.length > 1 && (
              <button onClick={() => onChange(id, null, links.filter((_, j) => j !== i))} className="text-muted-foreground hover:text-destructive">
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>
        ))}
        <Button variant="ghost" size="sm" onClick={() => onChange(id, null, [...links, ""])}>
          <Plus className="h-3.5 w-3.5 mr-1" /> Adicionar link
        </Button>
      </div>
    )
  }

  if (type === "date") {
    return (
      <div className="space-y-1.5">
        {baseLabel}
        {helperEl}
        <Input
          type="date"
          value={answer?.value_text ?? ""}
          onChange={(e) => onChange(id, e.target.value)}
        />
      </div>
    )
  }

  if (type === "single_select") {
    const options = (config.options as string[]) ?? []
    const allowOther = !!config.allow_other
    const current = answer?.value_text ?? ""
    const isOther = allowOther && current !== "" && !options.includes(current)

    if (options.length === 0) {
      return (
        <div className="space-y-1.5">
          {baseLabel}
          <p className="text-xs text-destructive border border-destructive/30 rounded px-2 py-1.5 bg-destructive/5">
            As opções deste campo não foram configuradas. Entre em contato com o responsável pelo formulário.
          </p>
        </div>
      )
    }

    return (
      <div className="space-y-2">
        {baseLabel}
        {helperEl}
        <div className="space-y-2">
          {options.map((opt) => (
            <label key={opt} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name={id}
                checked={current === opt}
                onChange={() => onChange(id, opt)}
                className="accent-primary"
              />
              <span className="text-sm">{opt}</span>
            </label>
          ))}
          {allowOther && (
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name={id}
                checked={isOther}
                onChange={() => onChange(id, " ")}
                className="accent-primary"
              />
              <span className="text-sm">Outro:</span>
              {isOther && (
                <Input
                  value={isOther ? current : ""}
                  onChange={(e) => onChange(id, e.target.value)}
                  className="h-7 text-sm"
                  autoFocus
                />
              )}
            </label>
          )}
        </div>
      </div>
    )
  }

  if (type === "multi_select") {
    const options = (config.options as string[]) ?? []
    const allowOther = !!config.allow_other
    const selected: string[] = answer?.value_json ? (answer.value_json as string[]) : []
    const otherVal = selected.find((s) => !options.includes(s))

    if (options.length === 0) {
      return (
        <div className="space-y-1.5">
          {baseLabel}
          <p className="text-xs text-destructive border border-destructive/30 rounded px-2 py-1.5 bg-destructive/5">
            As opções deste campo não foram configuradas. Entre em contato com o responsável pelo formulário.
          </p>
        </div>
      )
    }

    function toggle(opt: string) {
      const next = selected.includes(opt)
        ? selected.filter((s) => s !== opt)
        : [...selected, opt]
      onChange(id, null, next)
    }

    return (
      <div className="space-y-2">
        {baseLabel}
        {helperEl}
        <div className="space-y-2">
          {options.map((opt) => (
            <label key={opt} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={selected.includes(opt)}
                onChange={() => toggle(opt)}
                className="accent-primary rounded"
              />
              <span className="text-sm">{opt}</span>
            </label>
          ))}
          {allowOther && (
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={!!otherVal}
                onChange={(e) => {
                  if (!e.target.checked) {
                    onChange(id, null, selected.filter((s) => options.includes(s)))
                  } else {
                    onChange(id, null, [...selected, " "])
                  }
                }}
                className="accent-primary rounded"
              />
              <span className="text-sm">Outro:</span>
              {!!otherVal && (
                <Input
                  value={otherVal ?? ""}
                  onChange={(e) => {
                    const next = [...selected.filter((s) => options.includes(s)), e.target.value]
                    onChange(id, null, next)
                  }}
                  className="h-7 text-sm"
                />
              )}
            </label>
          )}
        </div>
      </div>
    )
  }

  if (type === "repeatable_group") {
    const subFields = (config.sub_fields as { label: string; type: string }[]) ?? []
    const rows: Record<string, string>[] = answer?.value_json
      ? (answer.value_json as Record<string, string>[])
      : [Object.fromEntries(subFields.map((f) => [f.label, ""]))]

    function updateRow(ri: number, fieldLabel: string, val: string) {
      const next = [...rows]
      next[ri] = { ...next[ri], [fieldLabel]: val }
      onChange(id, null, next)
    }

    return (
      <div className="space-y-3">
        {baseLabel}
        {helperEl}
        {rows.map((row, ri) => (
          <div key={ri} className="border rounded-md p-3 space-y-2 bg-muted/30">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground font-medium">Item {ri + 1}</span>
              {rows.length > 1 && (
                <button
                  onClick={() => onChange(id, null, rows.filter((_, i) => i !== ri))}
                  className="text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
            {subFields.map((sf) => (
              <div key={sf.label} className="space-y-1">
                <Label className="text-xs">{sf.label}</Label>
                {sf.type === "long_text" ? (
                  <Textarea
                    value={row[sf.label] ?? ""}
                    onChange={(e) => updateRow(ri, sf.label, e.target.value)}
                    className="min-h-[60px] text-sm"
                  />
                ) : (
                  <Input
                    value={row[sf.label] ?? ""}
                    onChange={(e) => updateRow(ri, sf.label, e.target.value)}
                    className="text-sm"
                  />
                )}
              </div>
            ))}
          </div>
        ))}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onChange(id, null, [...rows, Object.fromEntries(subFields.map((f) => [f.label, ""]))])}
        >
          <Plus className="h-3.5 w-3.5 mr-1" /> Adicionar item
        </Button>
      </div>
    )
  }

  if (type === "file_upload") {
    return (
      <div className="space-y-1.5">
        {baseLabel}
        {helperEl}
        <FileUploadField
          questionId={id}
          briefingId={briefingId}
          config={config}
          onUploaded={(fileInfo) => {
            onChange(id, fileInfo.file_name, fileInfo)
          }}
        />
      </div>
    )
  }

  return null
}
