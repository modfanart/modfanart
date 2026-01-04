import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function ForArtistsPage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Other sections */}

      <section className="w-full py-24 bg-gradient-to-br from-primary to-primary/80">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter text-white sm:text-5xl">
                Ready to Get Your Fan Art Licensed?
              </h2>
              <p className="mx-auto max-w-[900px] text-white/90 md:text-xl">
                Join MOD Platform today and start submitting your fan art for official licensing and monetization
                opportunities.
              </p>
            </div>
            <div className="flex flex-col gap-2 min-[400px]:flex-row">
              <Link href="/signup?type=artist">
                <Button size="lg" variant="default" className="bg-white text-primary hover:bg-white/90">
                  Join as an Artist
                </Button>
              </Link>
              <Link href="/gallery">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                  Browse Gallery
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

