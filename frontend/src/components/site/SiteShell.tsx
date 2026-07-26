import { SiteHeader } from '@/components/site/SiteHeader'

export function SiteShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-full flex-1 flex-col text-foreground">
      <SiteHeader />
      <div className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 md:px-6 md:py-12">{children}</div>
    </div>
  )
}
