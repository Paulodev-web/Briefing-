"use client"

import { useState, useCallback, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { FieldRenderer } from "./FieldRenderer"
import { Check, ChevronLeft, ChevronRight, Loader2 } from "lucide-react"
import type { BriefingAnswer, BriefingBlock, BriefingQuestion } from "@/lib/types"

interface BriefingFormProps {
  briefingId: string
  blocks: (BriefingBlock & { briefing_questions: BriefingQuestion[] })[]
  initialAnswers: BriefingAnswer[]
}

export function BriefingForm({ briefingId, blocks, initialAnswers }: BriefingFormProps) {
  const router = useRouter()
  const [currentBlock, setCurrentBlock] = useState(0)
  const [answers, setAnswers] = useState<Record<string, BriefingAnswer>>(() =>
    Object.fromEntries(initialAnswers.map((a) => [a.question_id, a]))
  )
  const [saving, setSaving] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const saveTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({})

  const block = blocks[currentBlock]
  const isFirst = currentBlock === 0
  const isLast = currentBlock === blocks.length - 1

  const saveAnswer = useCallback(
    async (questionId: string, valueText?: string | null, valueJson?: unknown) => {
      setSaving(true)
      try {
        await fetch("/api/answers", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ briefing_id: briefingId, question_id: questionId, value_text: valueText, value_json: valueJson }),
        })
      } finally {
        setSaving(false)
      }
    },
    [briefingId]
  )

  const handleChange = useCallback(
    (questionId: string, valueText?: string | null, valueJson?: unknown) => {
      setAnswers((prev) => ({
        ...prev,
        [questionId]: {
          ...prev[questionId],
          question_id: questionId,
          briefing_id: briefingId,
          value_text: valueText ?? null,
          value_json: valueJson ?? null,
        } as BriefingAnswer,
      }))
      setErrors((prev) => ({ ...prev, [questionId]: "" }))

      // Debounce autosave
      if (saveTimers.current[questionId]) clearTimeout(saveTimers.current[questionId])
      saveTimers.current[questionId] = setTimeout(() => {
        saveAnswer(questionId, valueText, valueJson)
      }, 600)
    },
    [briefingId, saveAnswer]
  )

  function validate(): boolean {
    const newErrors: Record<string, string> = {}
    for (const q of block.briefing_questions) {
      if (!q.required) continue
      const answer = answers[q.id]
      const hasText = answer?.value_text?.trim()
      const hasJson = answer?.value_json != null && (
        Array.isArray(answer.value_json) ? (answer.value_json as unknown[]).length > 0 : true
      )
      if (!hasText && !hasJson) {
        newErrors[q.id] = "Este campo é obrigatório"
      }
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  async function handleNext() {
    if (!validate()) return
    // Flush pending saves
    for (const [qId, timer] of Object.entries(saveTimers.current)) {
      clearTimeout(timer)
      delete saveTimers.current[qId]
    }
    setCurrentBlock((c) => c + 1)
    window.scrollTo(0, 0)
  }

  async function handleSubmit() {
    if (!validate()) return
    setSubmitting(true)
    try {
      await fetch("/api/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ briefing_id: briefingId }),
      })
      router.push("obrigado")
    } catch {
      setSubmitting(false)
    }
  }

  return (
    <div>
      {/* Progress */}
      <div className="mb-6">
        <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
          <span>
            Seção {currentBlock + 1} de {blocks.length}
          </span>
          <span>{Math.round(((currentBlock + 1) / blocks.length) * 100)}%</span>
        </div>
        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${((currentBlock + 1) / blocks.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Block title */}
      <h2 className="text-lg font-semibold mb-6">{block.title}</h2>

      {/* Questions */}
      <div className="space-y-6">
        {block.briefing_questions.map((q) => (
          <div key={q.id}>
            <FieldRenderer
              question={q}
              answer={answers[q.id]}
              onChange={handleChange}
              briefingId={briefingId}
            />
            {errors[q.id] && (
              <p className="text-xs text-destructive mt-1">{errors[q.id]}</p>
            )}
          </div>
        ))}
      </div>

      {/* Autosave indicator */}
      {saving && (
        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-4">
          <Loader2 className="h-3 w-3 animate-spin" /> Salvando...
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between mt-8 pt-4 border-t">
        <Button
          variant="outline"
          onClick={() => { setCurrentBlock((c) => c - 1); window.scrollTo(0, 0) }}
          disabled={isFirst}
        >
          <ChevronLeft className="h-4 w-4 mr-1" /> Anterior
        </Button>

        {isLast ? (
          <Button onClick={handleSubmit} disabled={submitting}>
            {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Check className="h-4 w-4 mr-1" />}
            Enviar briefing
          </Button>
        ) : (
          <Button onClick={handleNext}>
            Próximo <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        )}
      </div>
    </div>
  )
}
