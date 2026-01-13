"use client"

import { Button } from "@/components/ui/button"
import { Banana, Globe } from "lucide-react"
import { useLanguage } from "@/components/language-provider"

export function Header() {
  const { language, setLanguage, t } = useLanguage()

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <Banana className="h-8 w-8 text-yellow-500" />
          <span className="text-xl font-bold">Nano Banana</span>
        </div>

        <nav className="hidden md:flex items-center gap-6">
          <a href="#generator" className="text-sm font-medium hover:text-primary transition-colors">
            {t.header.editor}
          </a>
          <a href="#showcase" className="text-sm font-medium hover:text-primary transition-colors">
            {t.header.examples}
          </a>
          <a href="#features" className="text-sm font-medium hover:text-primary transition-colors">
            {t.header.features}
          </a>
          <a href="#reviews" className="text-sm font-medium hover:text-primary transition-colors">
            {t.header.reviews}
          </a>
        </nav>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setLanguage(language === 'en' ? 'zh' : 'en')}
            className="font-medium"
          >
            <Globe className="h-4 w-4 mr-2" />
            {language === 'en' ? '中文' : 'EN'}
          </Button>
          <Button
            className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold"
            onClick={() => document.getElementById('generator')?.scrollIntoView({ behavior: 'smooth' })}
          >
            {t.header.tryNow}
          </Button>
        </div>
      </div>
    </header>
  )
}
