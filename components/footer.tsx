"use client"

import { Banana } from "lucide-react"
import { useLanguage } from "@/components/language-provider"

export function Footer() {
  const { t } = useLanguage()

  return (
    <footer className="py-12 border-t">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <Banana className="h-6 w-6 text-yellow-500" />
            <span className="text-lg font-bold">Nano Banana</span>
          </div>

          <div className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
            <a href="#" className="hover:text-foreground transition-colors">
              {t.footer.privacy}
            </a>
            <a href="#" className="hover:text-foreground transition-colors">
              {t.footer.terms}
            </a>
            <a href="#" className="hover:text-foreground transition-colors">
              {t.footer.contact}
            </a>
          </div>

          <p className="text-sm text-muted-foreground">{t.footer.copyright}</p>
        </div>
      </div>
    </footer>
  )
}
