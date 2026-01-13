"use client"

import { Card, CardContent } from "@/components/ui/card"
import { MessageSquare, Users, Layers, Zap, Images, TrendingUp } from "lucide-react"
import { useLanguage } from "@/components/language-provider"

const featureIcons = {
  naturalLanguage: MessageSquare,
  characterConsistency: Users,
  scenePreservation: Layers,
  oneShot: Zap,
  multiImage: Images,
  aiUgc: TrendingUp,
}

export function Features() {
  const { t } = useLanguage()

  const features = [
    {
      icon: featureIcons.naturalLanguage,
      title: t.features.naturalLanguage.title,
      description: t.features.naturalLanguage.description,
      key: 'naturalLanguage' as const,
    },
    {
      icon: featureIcons.characterConsistency,
      title: t.features.characterConsistency.title,
      description: t.features.characterConsistency.description,
      key: 'characterConsistency' as const,
    },
    {
      icon: featureIcons.scenePreservation,
      title: t.features.scenePreservation.title,
      description: t.features.scenePreservation.description,
      key: 'scenePreservation' as const,
    },
    {
      icon: featureIcons.oneShot,
      title: t.features.oneShot.title,
      description: t.features.oneShot.description,
      key: 'oneShot' as const,
    },
    {
      icon: featureIcons.multiImage,
      title: t.features.multiImage.title,
      description: t.features.multiImage.description,
      key: 'multiImage' as const,
    },
    {
      icon: featureIcons.aiUgc,
      title: t.features.aiUgc.title,
      description: t.features.aiUgc.description,
      key: 'aiUgc' as const,
    },
  ]

  return (
    <section id="features" className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">{t.features.title}</h2>
          <p className="text-xl text-muted-foreground mb-2">{t.features.subtitle}</p>
          <p className="text-muted-foreground max-w-3xl mx-auto">
            {t.features.description}
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
          {features.map((feature, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <feature.icon className="h-12 w-12 mb-4 text-yellow-500" />
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
