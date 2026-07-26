'use client'

import { SiteShell } from '@/components/site/SiteShell'
import { SectionPage } from '@/components/site/SectionPage'
import { AIChatPanel } from '@/components/chat/AIChatPanel'

export default function AssistantPage() {
  return (
    <SiteShell>
      <SectionPage
        section="assistant"
        pill="AI CHAT"
        title="AI Помощник ShaStudio"
        description="Спрашивайте о профиле, опыте, проектах и навыках — ответы на основе данных сайта."
        shape="circle"
        stamp="ASK ME ANYTHING"
      >
        <AIChatPanel />
      </SectionPage>
    </SiteShell>
  )
}
