"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Banana, ArrowRight } from "lucide-react"
import { useLanguage } from "@/components/language-provider"

export function Hero() {
  const { t } = useLanguage()

  return (
    <section className="relative overflow-hidden py-20 md:py-32">
      {/* Decorative bananas */}
      <div className="absolute top-10 left-10 opacity-10 rotate-12">
        <Banana className="h-32 w-32 text-yellow-500" />
      </div>
      <div className="absolute top-20 right-20 opacity-10 -rotate-12">
        <Banana className="h-40 w-40 text-yellow-500" />
      </div>
      <div className="absolute bottom-10 left-1/4 opacity-5 rotate-45">
        <Banana className="h-48 w-48 text-yellow-500" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col items-center text-center space-y-8 max-w-4xl mx-auto">
          {/* Announcement Badge */}
          <Badge
            variant="secondary"
            className="px-4 py-2 text-sm font-semibold bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20"
          >
            <Banana className="h-4 w-4 mr-2" />
            NEW: Nano Banana Pro is now live
          </Badge>

          {/* Main Badge */}
          <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-muted text-sm font-medium">
            {t.hero.badge}
          </div>

          {/* Heading */}
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-balance">{t.hero.title}</h1>

          {/* Description */}
          <p className="text-xl md:text-2xl text-muted-foreground text-balance max-w-3xl leading-relaxed">
            {t.hero.description}
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Button
              size="lg"
              className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold text-lg px-8"
              onClick={() => document.getElementById('generator')?.scrollIntoView({ behavior: 'smooth' })}
            >
              <Banana className="mr-2 h-5 w-5" />
              {t.hero.startEditing}
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="text-lg px-8 bg-transparent"
              onClick={() => document.getElementById('showcase')?.scrollIntoView({ behavior: 'smooth' })}
            >
              {t.hero.viewExamples}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>

          {/* Feature Tags */}
          <div className="flex flex-wrap justify-center gap-4 pt-8 text-sm text-muted-foreground">
            <span className="flex items-center gap-2">{t.hero.features.one}</span>
            <span className="flex items-center gap-2">{t.hero.features.two}</span>
            <span className="flex items-center gap-2">{t.hero.features.three}</span>
          </div>
        </div>
      </div>
    </section>
  )
}
