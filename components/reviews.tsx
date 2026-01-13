"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useLanguage } from "@/components/language-provider"

const reviewInitials = {
  artist: 'AP',
  creator: 'CC',
  editor: 'PE',
}

export function Reviews() {
  const { t } = useLanguage()

  const reviews = [
    {
      name: t.reviews.artist.name,
      role: t.reviews.artist.role,
      initials: reviewInitials.artist,
      review: t.reviews.artist.review,
    },
    {
      name: t.reviews.creator.name,
      role: t.reviews.creator.role,
      initials: reviewInitials.creator,
      review: t.reviews.creator.review,
    },
    {
      name: t.reviews.editor.name,
      role: t.reviews.editor.role,
      initials: reviewInitials.editor,
      review: t.reviews.editor.review,
    },
  ]

  return (
    <section id="reviews" className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">{t.reviews.title}</h2>
          <p className="text-xl text-muted-foreground">{t.reviews.subtitle}</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {reviews.map((review, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-yellow-500 text-black font-semibold">
                      {review.initials}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold">{review.name}</p>
                    <p className="text-sm text-muted-foreground">{review.role}</p>
                  </div>
                </div>
                <p className="text-muted-foreground leading-relaxed">"{review.review}"</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
