"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useLanguage } from "@/components/language-provider"

const showcaseImages = [
  "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80",
  "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=800&q=80",
  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80",
  "https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=800&q=80",
]

export function Showcase() {
  const { t } = useLanguage()

  const showcaseItems = [
    {
      title: t.showcase.mountain.title,
      description: t.showcase.mountain.description,
      image: showcaseImages[0],
    },
    {
      title: t.showcase.garden.title,
      description: t.showcase.garden.description,
      image: showcaseImages[1],
    },
    {
      title: t.showcase.beach.title,
      description: t.showcase.beach.description,
      image: showcaseImages[2],
    },
    {
      title: t.showcase.aurora.title,
      description: t.showcase.aurora.description,
      image: showcaseImages[3],
    },
  ]

  return (
    <section id="showcase" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">{t.showcase.title}</h2>
          <p className="text-xl text-muted-foreground">{t.showcase.subtitle}</p>
          <p className="text-muted-foreground mt-2">{t.showcase.description}</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto mb-12">
          {showcaseItems.map((item, index) => (
            <Card key={index} className="overflow-hidden hover:shadow-xl transition-shadow">
              <div className="aspect-video bg-gradient-to-br from-yellow-500/20 via-orange-500/20 to-pink-500/20 relative">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <CardContent className="p-6">
                <Badge variant="secondary" className="mb-3 bg-yellow-500/10 text-yellow-600 dark:text-yellow-400">
                  Nano Banana Speed
                </Badge>
                <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                <p className="text-muted-foreground">{item.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center">
          <p className="text-lg mb-4">{t.showcase.cta}</p>
          <Button className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold">
            {t.showcase.button}
          </Button>
        </div>
      </div>
    </section>
  )
}
