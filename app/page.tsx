import { Header } from "@/components/header"
import { Hero } from "@/components/hero"
import { Generator } from "@/components/generator"
import { Features } from "@/components/features"
import { Showcase } from "@/components/showcase"
import { Reviews } from "@/components/reviews"
import { FAQ } from "@/components/faq"
import { Footer } from "@/components/footer"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20">
      <Header />
      <Hero />
      <Generator />
      <Features />
      <Showcase />
      <Reviews />
      <FAQ />
      <Footer />
    </div>
  )
}
