import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ADMIN_SECTIONS } from '@/lib/admin-nav'

export default function AdminHomePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Админ-панель</h1>
        <p className="mt-2 text-stone-600">
          Редактируйте разделы сайта — AI-чат использует эти данные как контекст.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {ADMIN_SECTIONS.map((section) => (
          <Link key={section.href} href={section.href}>
            <Card className="h-full transition hover:border-stone-400">
              <CardHeader>
                <CardTitle>{section.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{section.desc}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
