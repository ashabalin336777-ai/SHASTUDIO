'use client'

import { useState } from 'react'
import { Send } from 'lucide-react'
import { api } from '@/lib/api'
import { cn } from '@/lib/utils'
import { MeeloButton } from '@/components/site/MeeloUI'

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

type Props = {
  className?: string
}

export function AIChatPanel({ className }: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return

    const currentInput = input
    setMessages((prev) => [...prev, { role: 'user', content: currentInput }])
    setInput('')
    setIsLoading(true)

    try {
      const data = await api.post<{ answer: string }>('/api/chat', {
        message: currentInput,
      })
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: data.answer || 'Извините, не удалось получить ответ.',
        },
      ])
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Извините, произошла ошибка. Попробуйте позже.',
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      void sendMessage()
    }
  }

  return (
    <div
      className={cn(
        'meelo-card flex min-h-[520px] flex-col overflow-hidden rounded-[1.75rem] border-[2.5px] border-foreground bg-background',
        className
      )}
    >
      <div className="flex items-center gap-3 border-b-[2.5px] border-foreground bg-[var(--meelo-lavender)] px-4 py-3 md:px-5">
        <ShaBrainEmoji className="size-11 text-2xl" />
        <div>
          <p className="text-sm font-bold tracking-tight">AI Помощник ShaStudio</p>
          <p className="text-xs text-muted-foreground">Спросите об опыте, проектах и навыках</p>
        </div>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4 md:px-5">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
            <ShaBrainEmoji className="size-16 text-4xl" />
            <p className="max-w-sm text-sm text-muted-foreground">
              Привет! Я помощник ShaStudio. Задайте вопрос обо мне, опыте или проектах.
            </p>
          </div>
        )}
        {messages.map((msg, idx) => (
          <div
            key={`${msg.role}-${idx}`}
            className={cn('flex gap-2', msg.role === 'user' ? 'justify-end' : 'justify-start')}
          >
            {msg.role === 'assistant' && (
              <ShaBrainEmoji className="mt-0.5 size-8 shrink-0 text-base" />
            )}
            <div
              className={cn(
                'max-w-[85%] rounded-2xl border-2 border-foreground px-4 py-2.5 text-sm leading-relaxed',
                msg.role === 'user'
                  ? 'bg-[var(--meelo-sky)]'
                  : 'bg-[var(--meelo-lavender)]'
              )}
            >
              {msg.content}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex items-center gap-2">
            <ShaBrainEmoji className="size-8 text-base" />
            <div className="rounded-2xl border-2 border-foreground bg-muted px-4 py-2 text-sm">
              Печатает...
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-2 border-t-[2.5px] border-foreground p-3 md:p-4">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Задайте вопрос..."
          disabled={isLoading}
          className="h-11 flex-1 rounded-2xl border-[2.5px] border-foreground bg-background px-4 text-sm outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-[var(--meelo-nav-active)]"
        />
        <MeeloButton
          onClick={() => void sendMessage()}
          disabled={isLoading || !input.trim()}
          className="h-11 px-4"
        >
          <Send className="size-4" />
        </MeeloButton>
      </div>
    </div>
  )
}

/** Эмодзи-аватар на основе логотипа ShaStudio (мозг + нейросеть) */
export function ShaBrainEmoji({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center justify-center rounded-full border-2 border-foreground bg-[#e8f0ff] shadow-[2px_2px_0_0_var(--foreground)] dark:bg-[#243044]',
        className
      )}
      role="img"
      aria-label="ShaStudio AI"
      title="ShaStudio AI"
    >
      🧠
    </span>
  )
}
