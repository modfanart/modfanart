import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, AlertTriangle, Info, Download, ExternalLink } from 'lucide-react';

export const metadata = {
  title: 'Brand Guidelines | MOD Platform',
  description: 'Guidelines for submitting fan art that complies with IP holder requirements',
};

export default function BrandGuidelinesPage() {
  return (
    <div className="container py-12 md:py-16 lg:py-24">
      {/* Hero section */}
      <div className="mx-auto max-w-4xl text-center mb-16">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl mb-4">Brand Guidelines</h1>
        <p className="text-xl text-muted-foreground">
          Essential guidelines for creating fan art that respects intellectual property rights
        </p>
      </div>

      {/* Main content */}
      <div className="grid gap-12 lg:gap-16">
        {/* Introduction */}
        <section>
          <div className="grid gap-6 lg:grid-cols-2 lg:gap-12">
            <div>
              <h2 className="text-3xl font-bold mb-4">Creating Compliant Fan Art</h2>
              <p className="text-lg mb-4">
                Fan art is a wonderful way to express your appreciation for your favorite
                characters, stories, and worlds. However, it's important to respect the intellectual
                property rights of the original creators.
              </p>
              <p className="mb-4">
                These guidelines will help you create fan art that celebrates the original IP while
                staying within legal and ethical boundaries. Following these guidelines increases
                your chances of having your submissions approved and licensed through the MOD
                Platform.
              </p>
              <Alert className="mt-6">
                <Info className="h-4 w-4" />
                <AlertTitle>Important Note</AlertTitle>
                <AlertDescription>
                  Each IP holder may have specific guidelines beyond what's covered here. Always
                  check the specific requirements for the IP you're creating fan art for.
                </AlertDescription>
              </Alert>
            </div>
            <div className="flex items-center justify-center">
              <div className="relative h-[300px] w-full max-w-md rounded-lg overflow-hidden">
                <Image
                  src="/placeholder.svg?height=600&width=800&text=Brand+Guidelines"
                  alt="Brand Guidelines Illustration"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Quick Reference */}
        <section>
          <h2 className="text-2xl font-bold mb-6">Quick Reference Guide</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card className="bg-green-50 border-green-200">
              <CardHeader className="pb-2">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <CardTitle className="text-green-800">Generally Allowed</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-green-800">
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-1 mr-2 shrink-0" />
                    <span>Original interpretations of characters</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-1 mr-2 shrink-0" />
                    <span>Fan art in your own unique style</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-1 mr-2 shrink-0" />
                    <span>Non-commercial personal projects</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-1 mr-2 shrink-0" />
                    <span>Transformative or parody works</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-1 mr-2 shrink-0" />
                    <span>Clearly labeled fan art</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-red-50 border-red-200">
              <CardHeader className="pb-2">
                <div className="flex items-center space-x-2">
                  <XCircle className="h-5 w-5 text-red-600" />
                  <CardTitle className="text-red-800">Generally Prohibited</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-red-800">
                  <li className="flex items-start">
                    <XCircle className="h-4 w-4 text-red-600 mt-1 mr-2 shrink-0" />
                    <span>Direct copies of official artwork</span>
                  </li>
                  <li className="flex items-start">
                    <XCircle className="h-4 w-4 text-red-600 mt-1 mr-2 shrink-0" />
                    <span>Unauthorized use of logos or trademarks</span>
                  </li>
                  <li className="flex items-start">
                    <XCircle className="h-4 w-4 text-red-600 mt-1 mr-2 shrink-0" />
                    <span>Explicit or adult content of IP characters</span>
                  </li>
                  <li className="flex items-start">
                    <XCircle className="h-4 w-4 text-red-600 mt-1 mr-2 shrink-0" />
                    <span>Defamatory or harmful representations</span>
                  </li>
                  <li className="flex items-start">
                    <XCircle className="h-4 w-4 text-red-600 mt-1 mr-2 shrink-0" />
                    <span>Claiming ownership of the original IP</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-yellow-50 border-yellow-200">
              <CardHeader className="pb-2">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="h-5 w-5 text-yellow-600" />
                  <CardTitle className="text-yellow-800">Case-by-Case Review</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-yellow-800">
                  <li className="flex items-start">
                    <AlertTriangle className="h-4 w-4 text-yellow-600 mt-1 mr-2 shrink-0" />
                    <span>Crossovers between different IPs</span>
                  </li>
                  <li className="flex items-start">
                    <AlertTriangle className="h-4 w-4 text-yellow-600 mt-1 mr-2 shrink-0" />
                    <span>Original characters in established universes</span>
                  </li>
                  <li className="flex items-start">
                    <AlertTriangle className="h-4 w-4 text-yellow-600 mt-1 mr-2 shrink-0" />
                    <span>Significant alterations to character designs</span>
                  </li>
                  <li className="flex items-start">
                    <AlertTriangle className="h-4 w-4 text-yellow-600 mt-1 mr-2 shrink-0" />
                    <span>Use of distinctive phrases or quotes</span>
                  </li>
                  <li className="flex items-start">
                    <AlertTriangle className="h-4 w-4 text-yellow-600 mt-1 mr-2 shrink-0" />
                    <span>Commercial use requests</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Detailed Guidelines */}
        <section>
          <h2 className="text-2xl font-bold mb-6">Detailed Guidelines by Category</h2>
          <Tabs defaultValue="characters">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 mb-8">
              <TabsTrigger value="characters">Characters</TabsTrigger>
              <TabsTrigger value="logos">Logos & Marks</TabsTrigger>
              <TabsTrigger value="worlds">Worlds & Settings</TabsTrigger>
              <TabsTrigger value="stories">Stories & Plots</TabsTrigger>
            </TabsList>

            <TabsContent value="characters" className="space-y-6">
              <div className="grid gap-6 lg:grid-cols-2">
                <div>
                  <h3 className="text-xl font-bold mb-4">Character Guidelines</h3>
                  <p className="mb-4">
                    Characters are often the most recognizable elements of an IP. When creating fan
                    art featuring characters, consider these guidelines:
                  </p>
                  <ul className="space-y-3">
                    <li className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 mr-2 shrink-0" />
                      <span>
                        <strong>Maintain core visual elements</strong> that make the character
                        recognizable, while adding your own artistic interpretation.
                      </span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 mr-2 shrink-0" />
                      <span>
                        <strong>Respect the character's personality</strong> and avoid depicting
                        them in ways that contradict their established traits.
                      </span>
                    </li>
                    <li className="flex items-start">
                      <XCircle className="h-5 w-5 text-red-600 mt-0.5 mr-2 shrink-0" />
                      <span>
                        <strong>Avoid explicit content</strong> featuring characters, especially
                        those from family-friendly IPs.
                      </span>
                    </li>
                    <li className="flex items-start">
                      <XCircle className="h-5 w-5 text-red-600 mt-0.5 mr-2 shrink-0" />
                      <span>
                        <strong>Don't create offensive or harmful depictions</strong> that could
                        damage the character's reputation or brand.
                      </span>
                    </li>
                  </ul>
                </div>
                <div className="flex flex-col space-y-4">
                  <div className="relative h-[200px] rounded-lg overflow-hidden">
                    <Image
                      src="/placeholder.svg?height=400&width=600&text=Character+Example"
                      alt="Character Fan Art Example"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Badge className="bg-green-100 text-green-800">Acceptable</Badge>
                      <ul className="text-sm space-y-1">
                        <li>• Original art style</li>
                        <li>• Recognizable character</li>
                        <li>• Respectful portrayal</li>
                      </ul>
                    </div>
                    <div className="space-y-2">
                      <Badge className="bg-red-100 text-red-800">Unacceptable</Badge>
                      <ul className="text-sm space-y-1">
                        <li>• Copied official art</li>
                        <li>• Offensive portrayal</li>
                        <li>• Explicit content</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="logos" className="space-y-6">
              <div className="grid gap-6 lg:grid-cols-2">
                <div>
                  <h3 className="text-xl font-bold mb-4">Logos & Trademarks Guidelines</h3>
                  <p className="mb-4">
                    Logos, trademarks, and brand marks are heavily protected elements of IP. Special
                    care must be taken when incorporating these elements:
                  </p>
                  <ul className="space-y-3">
                    <li className="flex items-start">
                      <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5 mr-2 shrink-0" />
                      <span>
                        <strong>Avoid direct use of logos</strong> whenever possible. Consider
                        creating art inspired by the IP without including the actual logo.
                      </span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 mr-2 shrink-0" />
                      <span>
                        <strong>Stylized or reimagined versions</strong> of logos may be acceptable
                        if they're clearly transformative and not confused with official branding.
                      </span>
                    </li>
                    <li className="flex items-start">
                      <XCircle className="h-5 w-5 text-red-600 mt-0.5 mr-2 shrink-0" />
                      <span>
                        <strong>Never use logos or trademarks</strong> in ways that suggest official
                        endorsement or affiliation.
                      </span>
                    </li>
                    <li className="flex items-start">
                      <XCircle className="h-5 w-5 text-red-600 mt-0.5 mr-2 shrink-0" />
                      <span>
                        <strong>Avoid modifying logos</strong> in ways that could be seen as
                        disparaging or damaging to the brand.
                      </span>
                    </li>
                  </ul>
                </div>
                <div className="flex flex-col space-y-4">
                  <div className="relative h-[200px] rounded-lg overflow-hidden">
                    <Image
                      src="/placeholder.svg?height=400&width=600&text=Logo+Example"
                      alt="Logo Fan Art Example"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Badge className="bg-green-100 text-green-800">Acceptable</Badge>
                      <ul className="text-sm space-y-1">
                        <li>• Artistic reinterpretation</li>
                        <li>• Clearly labeled as fan art</li>
                        <li>• Transformative use</li>
                      </ul>
                    </div>
                    <div className="space-y-2">
                      <Badge className="bg-red-100 text-red-800">Unacceptable</Badge>
                      <ul className="text-sm space-y-1">
                        <li>• Direct logo copying</li>
                        <li>• Misleading branding</li>
                        <li>• Commercial use without license</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="worlds" className="space-y-6">
              <div className="grid gap-6 lg:grid-cols-2">
                <div>
                  <h3 className="text-xl font-bold mb-4">Worlds & Settings Guidelines</h3>
                  <p className="mb-4">
                    Creating fan art based on fictional worlds and settings often allows for more
                    creative freedom, but still requires attention to IP considerations:
                  </p>
                  <ul className="space-y-3">
                    <li className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 mr-2 shrink-0" />
                      <span>
                        <strong>Recreating iconic locations</strong> from an IP is generally
                        acceptable when done in your own style.
                      </span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 mr-2 shrink-0" />
                      <span>
                        <strong>Adding your own elements</strong> to established worlds can create
                        interesting transformative works.
                      </span>
                    </li>
                    <li className="flex items-start">
                      <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5 mr-2 shrink-0" />
                      <span>
                        <strong>Be careful with distinctive visual elements</strong> that are
                        strongly associated with the IP and may be protected.
                      </span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 mr-2 shrink-0" />
                      <span>
                        <strong>Creating "what if" scenarios</strong> or alternate versions of
                        established settings is often well-received.
                      </span>
                    </li>
                  </ul>
                </div>
                <div className="flex flex-col space-y-4">
                  <div className="relative h-[200px] rounded-lg overflow-hidden">
                    <Image
                      src="/placeholder.svg?height=400&width=600&text=World+Example"
                      alt="World Setting Fan Art Example"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Badge className="bg-green-100 text-green-800">Acceptable</Badge>
                      <ul className="text-sm space-y-1">
                        <li>• Original interpretation</li>
                        <li>• Expanded universe concepts</li>
                        <li>• Alternate timeline versions</li>
                      </ul>
                    </div>
                    <div className="space-y-2">
                      <Badge className="bg-red-100 text-red-800">Unacceptable</Badge>
                      <ul className="text-sm space-y-1">
                        <li>• Direct copying of maps/designs</li>
                        <li>• Claiming ownership of the world</li>
                        <li>• Contradicting core world rules</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="stories" className="space-y-6">
              <div className="grid gap-6 lg:grid-cols-2">
                <div>
                  <h3 className="text-xl font-bold mb-4">Stories & Plots Guidelines</h3>
                  <p className="mb-4">
                    Creating fan art that depicts scenes or tells stories within an established IP
                    requires balancing creativity with respect for the source material:
                  </p>
                  <ul className="space-y-3">
                    <li className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 mr-2 shrink-0" />
                      <span>
                        <strong>Illustrating key moments</strong> from the original story in your
                        own style is generally acceptable.
                      </span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 mr-2 shrink-0" />
                      <span>
                        <strong>Creating "what if" scenarios</strong> or alternate storylines is
                        often well-received by IP holders.
                      </span>
                    </li>
                    <li className="flex items-start">
                      <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5 mr-2 shrink-0" />
                      <span>
                        <strong>Be mindful of unreleased plot points</strong> - creating fan art
                        based on leaks or spoilers may be problematic.
                      </span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 mr-2 shrink-0" />
                      <span>
                        <strong>Sequential art or comics</strong> that tell original stories with
                        established characters can be acceptable with proper licensing.
                      </span>
                    </li>
                  </ul>
                </div>
                <div className="flex flex-col space-y-4">
                  <div className="relative h-[200px] rounded-lg overflow-hidden">
                    <Image
                      src="/placeholder.svg?height=400&width=600&text=Story+Example"
                      alt="Story Fan Art Example"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Badge className="bg-green-100 text-green-800">Acceptable</Badge>
                      <ul className="text-sm space-y-1">
                        <li>• Alternative storylines</li>
                        <li>• Original scenes with characters</li>
                        <li>• "What if" scenarios</li>
                      </ul>
                    </div>
                    <div className="space-y-2">
                      <Badge className="bg-red-100 text-red-800">Unacceptable</Badge>
                      <ul className="text-sm space-y-1">
                        <li>• Copying exact dialogue/scenes</li>
                        <li>• Using unreleased/leaked content</li>
                        <li>• Misrepresenting the original story</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </section>

        {/* Legal Considerations */}
        <section>
          <h2 className="text-2xl font-bold mb-6">Legal Considerations</h2>
          <div className="grid gap-6 lg:grid-cols-2">
            <div>
              <h3 className="text-xl font-bold mb-4">Understanding IP Law</h3>
              <p className="mb-4">
                Fan art exists in a complex legal space. While many IP holders appreciate and even
                encourage fan art, it's important to understand the legal framework:
              </p>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="copyright">
                  <AccordionTrigger>Copyright Basics</AccordionTrigger>
                  <AccordionContent>
                    <p className="mb-2">
                      Copyright protects original creative works including characters, stories,
                      artwork, and more. The copyright holder has exclusive rights to reproduce,
                      distribute, display, and create derivative works.
                    </p>
                    <p>
                      Fan art technically creates "derivative works" which normally require
                      permission. However, some fan art may qualify as "fair use" depending on
                      factors like purpose, nature, amount used, and market impact.
                    </p>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="trademark">
                  <AccordionTrigger>Trademark Considerations</AccordionTrigger>
                  <AccordionContent>
                    <p className="mb-2">
                      Trademarks protect names, logos, and symbols that identify products or
                      services. Using trademarked elements in fan art can be problematic if it
                      suggests official endorsement or creates confusion.
                    </p>
                    <p>
                      Always include clear disclaimers that your work is unofficial fan art and
                      avoid using trademarks in ways that could dilute or damage the brand.
                    </p>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="fair-use">
                  <AccordionTrigger>Fair Use Doctrine</AccordionTrigger>
                  <AccordionContent>
                    <p className="mb-2">
                      Fair use allows limited use of copyrighted material without permission for
                      purposes like criticism, comment, news reporting, teaching, scholarship, or
                      research.
                    </p>
                    <p>
                      Fan art may qualify as fair use if it's transformative (adds new meaning or
                      message), non-commercial, uses only necessary elements of the original, and
                      doesn't harm the market for the original work.
                    </p>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="licensing">
                  <AccordionTrigger>Licensing Through MOD Platform</AccordionTrigger>
                  <AccordionContent>
                    <p className="mb-2">
                      The MOD Platform provides a legal pathway for fan artists to get official
                      approval and licensing for their work, removing legal uncertainty.
                    </p>
                    <p>
                      By submitting through our platform, you can receive official permission to
                      create and potentially monetize fan art within the guidelines set by the IP
                      holder.
                    </p>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Disclaimers & Attribution</CardTitle>
                  <CardDescription>
                    Always include proper disclaimers with your fan art
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 bg-gray-50 rounded-md border">
                      <h4 className="font-medium mb-2">Sample Disclaimer</h4>
                      <p className="text-sm text-muted-foreground italic">
                        "This is fan art based on [IP Name]. All characters, settings, and related
                        elements belong to [IP Owner]. This is an unofficial, non-commercial fan
                        creation and is not affiliated with or endorsed by [IP Owner]."
                      </p>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-medium">Always Include:</h4>
                      <ul className="space-y-1">
                        <li className="flex items-start">
                          <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 mr-2 shrink-0" />
                          <span>Clear statement that it's fan art</span>
                        </li>
                        <li className="flex items-start">
                          <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 mr-2 shrink-0" />
                          <span>Acknowledgment of the original IP owner</span>
                        </li>
                        <li className="flex items-start">
                          <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 mr-2 shrink-0" />
                          <span>Disclaimer of any official affiliation</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Alert className="bg-blue-50 border-blue-200">
                <Info className="h-4 w-4 text-blue-600" />
                <AlertTitle className="text-blue-800">Legal Protection Through MOD</AlertTitle>
                <AlertDescription className="text-blue-700">
                  By submitting your fan art through the MOD Platform and receiving approval, you
                  gain legal protection and clarity about how your work can be used and monetized.
                </AlertDescription>
              </Alert>
            </div>
          </div>
        </section>

        {/* Specific IP Guidelines */}
        {/* <section>
          <h2 className="text-2xl font-bold mb-6">Popular IP-Specific Guidelines</h2>
          <p className="mb-6">
            Many major IP holders have published their own fan art guidelines. Here are links to
            some popular ones:
          </p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Disney & Marvel</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Disney has specific guidelines for fan art featuring their characters and
                  properties, including Marvel, Star Wars, and Disney Animation.
                </p>
                <Button variant="outline" className="w-full" asChild>
                  <a href="#" target="_blank" rel="noopener noreferrer">
                    View Guidelines
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </a>
                </Button>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Nintendo</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Nintendo has guidelines for fan content related to their games and characters,
                  including Mario, Zelda, Pokémon, and other franchises.
                </p>
                <Button variant="outline" className="w-full" asChild>
                  <a href="#" target="_blank" rel="noopener noreferrer">
                    View Guidelines
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </a>
                </Button>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Warner Bros.</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Warner Bros. provides guidelines for fan art related to properties like Harry
                  Potter, DC Comics, and other Warner-owned franchises.
                </p>
                <Button variant="outline" className="w-full" asChild>
                  <a href="#" target="_blank" rel="noopener noreferrer">
                    View Guidelines
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </a>
                </Button>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Blizzard Entertainment</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Blizzard has fan art policies for their games including World of Warcraft,
                  Overwatch, Diablo, and other popular franchises.
                </p>
                <Button variant="outline" className="w-full" asChild>
                  <a href="#" target="_blank" rel="noopener noreferrer">
                    View Guidelines
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </a>
                </Button>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Wizards of the Coast</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Guidelines for fan content related to Magic: The Gathering, Dungeons & Dragons,
                  and other Wizards properties.
                </p>
                <Button variant="outline" className="w-full" asChild>
                  <a href="#" target="_blank" rel="noopener noreferrer">
                    View Guidelines
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </a>
                </Button>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Anime & Manga Publishers</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Various Japanese publishers have different policies regarding fan art for anime
                  and manga properties.
                </p>
                <Button variant="outline" className="w-full" asChild>
                  <a href="#" target="_blank" rel="noopener noreferrer">
                    View Guidelines
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </a>
                </Button>
              </CardContent>
            </Card>
          </div>
          <div className="mt-6">
            <Alert>
              <Info className="h-4 w-4" />
              <AlertTitle>Always Check Current Guidelines</AlertTitle>
              <AlertDescription>
                IP holder guidelines can change over time. Always check the most current official
                guidelines before creating fan art.
              </AlertDescription>
            </Alert>
          </div>
        </section> */}

        {/* Submission Process */}
        <section>
          <h2 className="text-2xl font-bold mb-6">Submission Process on MOD Platform</h2>
          <div className="grid gap-6 lg:grid-cols-2">
            <div>
              <h3 className="text-xl font-bold mb-4">How Our Platform Works</h3>
              <p className="mb-4">
                The MOD Platform streamlines the process of getting your fan art officially
                licensed. Here's how it works:
              </p>
              <ol className="space-y-4">
                <li className="flex">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white mr-3 shrink-0">
                    1
                  </div>
                  <div>
                    <h4 className="font-medium">Submit Your Fan Art</h4>
                    <p className="text-sm text-muted-foreground">
                      Upload your fan art along with details about which IP it's based on and how
                      you'd like to license it.
                    </p>
                  </div>
                </li>
                <li className="flex">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white mr-3 shrink-0">
                    2
                  </div>
                  <div>
                    <h4 className="font-medium">AI Screening</h4>
                    <p className="text-sm text-muted-foreground">
                      Our AI system analyzes your submission for compliance with general guidelines
                      and IP-specific requirements.
                    </p>
                  </div>
                </li>
                <li className="flex">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white mr-3 shrink-0">
                    3
                  </div>
                  <div>
                    <h4 className="font-medium">IP Holder Review</h4>
                    <p className="text-sm text-muted-foreground">
                      If your submission passes AI screening, it's sent to the IP holder for review
                      and approval.
                    </p>
                  </div>
                </li>
                <li className="flex">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white mr-3 shrink-0">
                    4
                  </div>
                  <div>
                    <h4 className="font-medium">Licensing Agreement</h4>
                    <p className="text-sm text-muted-foreground">
                      Upon approval, you'll receive a licensing agreement outlining how you can use
                      and monetize your fan art.
                    </p>
                  </div>
                </li>
                <li className="flex">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white mr-3 shrink-0">
                    5
                  </div>
                  <div>
                    <h4 className="font-medium">Distribution & Monetization</h4>
                    <p className="text-sm text-muted-foreground">
                      With your license in place, you can distribute your fan art and potentially
                      earn royalties through approved channels.
                    </p>
                  </div>
                </li>
              </ol>
            </div>
            <div className="space-y-6">
              <Card className="bg-[#f5edff]">
                <CardHeader>
                  <CardTitle>Submission Checklist</CardTitle>
                  <CardDescription>
                    Before submitting your fan art, make sure you have:
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-[#9747ff] mt-0.5 mr-2 shrink-0" />
                      <span>
                        High-quality images of your fan art (minimum 1200px on longest side)
                      </span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-[#9747ff] mt-0.5 mr-2 shrink-0" />
                      <span>Clear identification of which IP your fan art is based on</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-[#9747ff] mt-0.5 mr-2 shrink-0" />
                      <span>Detailed description of your fan art and its elements</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-[#9747ff] mt-0.5 mr-2 shrink-0" />
                      <span>Selected your preferred licensing options</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-[#9747ff] mt-0.5 mr-2 shrink-0" />
                      <span>Confirmation that this is your original work</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-[#9747ff] mt-0.5 mr-2 shrink-0" />
                      <span>Reviewed the specific guidelines for your chosen IP</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              {/* <div className="flex justify-center">
                <Link href="/submissions/new">
                  <Button size="lg" className="bg-[#9747ff] hover:bg-[#8035e0]">
                    Submit Your Fan Art
                  </Button>
                </Link>
              </div> */}

              <div className="p-4 bg-gray-50 rounded-lg border">
                <h4 className="font-medium mb-2">Need Help?</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  If you have questions about the submission process or guidelines for a specific
                  IP, our support team is here to help.
                </p>
                <Link href="/contact">
                  <Button variant="outline" size="sm" className="w-full">
                    Contact Support
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Resources */}
        {/* <section>
          <h2 className="text-2xl font-bold mb-6">Additional Resources</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Downloadable Guidelines</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Download our comprehensive fan art guidelines PDF for offline reference.
                </p>
                <Button variant="outline" className="w-full">
                  <Download className="mr-2 h-4 w-4" />
                  Download PDF
                </Button>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Video Tutorials</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Watch our video series on creating compliant fan art and navigating the licensing
                  process.
                </p>
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/resources/tutorials">View Tutorials</Link>
                </Button>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Artist Community</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Join our community of fan artists to share tips, get feedback, and learn from each
                  other.
                </p>
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/community">Join Community</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </section> */}

        {/* FAQ */}
        <section>
          <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger>Can I sell my fan art without a license?</AccordionTrigger>
              <AccordionContent>
                <p>
                  Generally, no. Selling fan art without permission from the IP holder is typically
                  a copyright infringement. The MOD Platform provides a way to get official
                  licensing that allows you to legally sell your fan art with appropriate royalty
                  arrangements.
                </p>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger>What happens if my submission is rejected?</AccordionTrigger>
              <AccordionContent>
                <p>
                  If your submission is rejected, you'll receive feedback explaining why. You can
                  then make adjustments and resubmit, or create new fan art that better aligns with
                  the guidelines. Rejection doesn't mean you can't create fan art - it just means
                  that particular piece didn't meet the requirements for licensing.
                </p>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
              <AccordionTrigger>Can I create fan art that combines multiple IPs?</AccordionTrigger>
              <AccordionContent>
                <p>
                  Crossover fan art that combines multiple IPs is more complex from a licensing
                  perspective. Each IP holder would need to approve the use of their characters or
                  elements. The MOD Platform can facilitate this process, but approval rates may be
                  lower for crossover works, especially between IPs from competing companies.
                </p>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-4">
              <AccordionTrigger>How long does the approval process take?</AccordionTrigger>
              <AccordionContent>
                <p>
                  The AI screening process is typically completed within 24-48 hours. If your
                  submission passes AI screening, the IP holder review can take anywhere from a few
                  days to several weeks, depending on the IP holder's review process and volume of
                  submissions. Premium members receive priority review.
                </p>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-5">
              <AccordionTrigger>
                What royalty rates can I expect if my fan art is licensed?
              </AccordionTrigger>
              <AccordionContent>
                <p>
                  Royalty rates vary depending on the IP, the type of license, and how the fan art
                  will be used. Typically, artists receive between 10-25% of net sales for
                  merchandise featuring their licensed fan art. The exact terms will be outlined in
                  your licensing agreement after approval.
                </p>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-6">
              <AccordionTrigger>
                Can I use AI-generated images in my fan art submissions?
              </AccordionTrigger>
              <AccordionContent>
                <p>
                  Most IP holders currently have restrictions on AI-generated fan art. The MOD
                  Platform uses AI detection technology to identify AI-generated submissions. We
                  recommend creating original, hand-crafted fan art for the best chance of approval.
                  If you do incorporate AI elements, they should be minimal and clearly disclosed in
                  your submission.
                </p>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </section>

        {/* CTA */}
        <section className="bg-[#9747ff] text-white rounded-lg p-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Submit Your Fan Art?</h2>
          <p className="text-xl mb-6 max-w-2xl mx-auto">
            Join thousands of artists who are legally licensing their fan art and earning royalties
            through the MOD Platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {/* <Link href="/submissions/new">
              <Button size="lg" className="bg-white text-[#9747ff] hover:bg-gray-100">
                Submit Your Fan Art
              </Button>
            </Link> */}
            <Link href="/signup">
              <Button
                size="lg"
                variant="outline"
                className="bg-white text-[#9747ff] hover:bg-gray-100"
              >
                Create an Account
              </Button>
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
