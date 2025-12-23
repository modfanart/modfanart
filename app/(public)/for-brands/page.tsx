import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function ForBrandsPage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Other sections */}

      <section className="w-full py-24 bg-gradient-to-br from-primary to-primary/80">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter text-white sm:text-5xl">
                Ready to Transform Fan Art into Revenue?
              </h2>
              <p className="mx-auto max-w-[900px] text-white/90 md:text-xl">
                Join MOD Platform today and discover how we can help you protect your IP while creating new revenue
                streams.
              </p>
            </div>
            <div className="flex flex-col gap-2 min-[400px]:flex-row">
              <Link href="/signup?type=brand">
                <Button size="lg" variant="default" className="bg-white text-primary hover:bg-white/90">
                  Join as a Brand
                </Button>
              </Link>
              <Link href="/pricing">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                  View Pricing
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

