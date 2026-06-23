import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { LayoutWrapper } from "@/components/layout-wrapper"

export default function ForCreatorsPage() {
  return (
    <LayoutWrapper>
      <div className="flex flex-col items-center">
        {/* Hero section */}
        <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-b from-[#9747ff]/20 to-background">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 xl:grid-cols-2">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                    For Content Creators
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl">
                    Engage your fans and earn royalties from fan art licensing
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Link href="/signup">
                    <Button size="lg" className="bg-[#9747ff] hover:bg-[#8035e0]">
                      Join as a Creator
                    </Button>
                  </Link>
                  <Link href="/contact-sales">
                    <Button size="lg" variant="outline">
                      Schedule a Demo
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="flex items-center justify-center">
                <div className="relative h-[300px] w-[300px] md:h-[400px] md:w-[400px] lg:h-[500px] lg:w-[500px]">
                  <Image
                    src="/placeholder.svg?height=500&width=500"
                    alt="Content Creator Platform"
                    width={500}
                    height={500}
                    className="rounded-lg object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Key benefits section */}
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
                  Why Creators Choose MOD Platform
                </h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Our platform helps you engage with your fans and monetize fan art in a way that respects your IP
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl gap-6 py-12 lg:grid-cols-3">
              <div className="flex flex-col space-y-4 rounded-lg border bg-card p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#9747ff] text-white">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-6 w-6"
                  >
                    <path d="M12 2v20" />
                    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold">New Revenue Streams</h3>
                <p className="text-muted-foreground">
                  Earn royalties from officially licensed fan art merchandise without the hassle of managing it yourself
                </p>
              </div>
              <div className="flex flex-col space-y-4 rounded-lg border bg-card p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#9747ff] text-white">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-6 w-6"
                  >
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold">Fan Engagement</h3>
                <p className="text-muted-foreground">
                  Build stronger connections with your community by supporting their creative expressions
                </p>
              </div>
              <div className="flex flex-col space-y-4 rounded-lg border bg-card p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#9747ff] text-white">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-6 w-6"
                  >
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold">IP Protection</h3>
                <p className="text-muted-foreground">
                  Maintain control of your IP while allowing fans to express their creativity within your guidelines
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* How it works section */}
        <section className="w-full py-12 md:py-24 lg:py-32 bg-[#f5f5f5]">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
                  How MOD Works for Content Creators
                </h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Our streamlined process makes it easy to manage fan art licensing and engagement
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-6xl gap-8 py-12 md:grid-cols-2 lg:grid-cols-4">
              {steps.map((step, index) => (
                <div key={step.title} className="flex flex-col items-center space-y-3 text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#9747ff] text-white text-xl font-bold">
                    {index + 1}
                  </div>
                  <h3 className="text-xl font-bold">{step.title}</h3>
                  <p className="text-muted-foreground">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features section */}
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
                  Powerful Features for Content Creators
                </h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Our platform provides everything you need to manage fan art licensing and engagement
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl gap-6 py-12 md:grid-cols-2">
              {features.map((feature) => (
                <div key={feature.title} className="flex items-start space-x-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#9747ff] text-white">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-5 w-5"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-xl font-bold">{feature.title}</h3>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA section */}
        <section className="w-full py-12 md:py-24 lg:py-32 bg-[#9747ff] text-white">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">Ready to Engage Your Fans?</h2>
                <p className="max-w-[600px] text-white/80 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Join MOD Platform today and discover how we can help you engage with fans and create new revenue
                  streams
                </p>
              </div>
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                <Link href="/signup?role=creator">
                  <Button size="lg" className="bg-white text-[#9747ff] hover:bg-gray-100">
                    Join as a Creator
                  </Button>
                </Link>
                <Link href="/contact-sales">
                  <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                    Schedule a Demo
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </LayoutWrapper>
  )
}

const steps = [
  {
    title: "Register Your Content",
    description: "Create an account and register your content for fan art licensing",
  },
  {
    title: "Set Guidelines",
    description: "Define how your content can be used in fan art and set licensing terms",
  },
  {
    title: "Review Submissions",
    description: "Our AI pre-screens submissions, then you approve or reject with a single click",
  },
  {
    title: "Earn Royalties",
    description: "Receive royalties when fans license their artwork featuring your content",
  },
]

const features = [
  {
    title: "Customizable Guidelines",
    description: "Set detailed guidelines for how your content can be used in fan art",
  },
  {
    title: "AI-Powered Screening",
    description: "Automated screening of submissions to ensure they meet your guidelines",
  },
  {
    title: "Analytics Dashboard",
    description: "Track fan engagement, submission trends, and royalty earnings",
  },
  {
    title: "Community Management",
    description: "Tools to engage with your fan community and foster positive relationships",
  },
  {
    title: "Flexible Licensing Options",
    description: "Create custom licensing terms for different types of fan art and merchandise",
  },
  {
    title: "Automated Royalty Tracking",
    description: "Track all licensed merchandise sales and royalty payments in real-time",
  },
]

