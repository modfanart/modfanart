import Link from 'next/link';
import type { Metadata } from 'next';
import {
  Mail,
  MessageSquare,
  Phone,
  FileQuestion,
  Clock,
  Users,
  CreditCard,
  PenTool,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export const metadata: Metadata = {
  title: 'Support | MOD Platform',
  description: 'Get help with submissions, licensing, and other platform features',
};

export default function SupportPage() {
  return (
    <div className="container py-12 md:py-16 lg:py-24">
      <div className="mx-auto max-w-4xl text-center mb-16">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl mb-4">Support Center</h1>
        <p className="text-xl text-muted-foreground">
          Get help with submissions, licensing, and other platform features
        </p>
      </div>

      {/* Quick Help Section */}
      <div className="mb-16">
        <h2 className="text-2xl font-bold mb-8 text-center">How can we help you today?</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-lg">
                <FileQuestion className="h-5 w-5 mr-2 text-primary" />
                Submission Help
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Get help with creating and submitting your fan art for licensing
            </CardContent>
            <CardFooter>
              <Button variant="ghost" className="w-full" asChild>
                <Link href="#submission-faqs">View FAQs</Link>
              </Button>
            </CardFooter>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-lg">
                <CreditCard className="h-5 w-5 mr-2 text-primary" />
                Billing & Payments
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Questions about subscriptions, licensing fees, or revenue sharing
            </CardContent>
            <CardFooter>
              <Button variant="ghost" className="w-full" asChild>
                <Link href="#billing-faqs">View FAQs</Link>
              </Button>
            </CardFooter>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-lg">
                <PenTool className="h-5 w-5 mr-2 text-primary" />
                Licensing Questions
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Understand licensing terms, usage rights, and approval process
            </CardContent>
            <CardFooter>
              <Button variant="ghost" className="w-full" asChild>
                <Link href="#licensing-faqs">View FAQs</Link>
              </Button>
            </CardFooter>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-lg">
                <Users className="h-5 w-5 mr-2 text-primary" />
                Account Issues
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Help with account access, profile settings, or permissions
            </CardContent>
            <CardFooter>
              <Button variant="ghost" className="w-full" asChild>
                <Link href="#account-faqs">View FAQs</Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>

      {/* Contact Options */}
      <div className="mb-16">
        <h2 className="text-2xl font-bold mb-8 text-center">Contact Us</h2>
        <div className="grid gap-6 md:grid-cols-3">
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center justify-center">
                <Mail className="h-8 w-8 mb-2 text-primary" />
              </CardTitle>
              <CardTitle className="text-center">Email Support</CardTitle>
              <CardDescription className="text-center">Response within 24 hours</CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <p className="mb-4">
                Send us a detailed message and we'll get back to you as soon as possible.
              </p>
              <Button className="w-full" asChild>
                <Link href="mailto:support@modplatform.com">Email Us</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center justify-center">
                <MessageSquare className="h-8 w-8 mb-2 text-primary" />
              </CardTitle>
              <CardTitle className="text-center">Live Chat</CardTitle>
              <CardDescription className="text-center">Available 9am-5pm EST</CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <p className="mb-4">
                Chat with our support team in real-time for immediate assistance.
              </p>
              <Button className="w-full">Start Chat</Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center justify-center">
                <Phone className="h-8 w-8 mb-2 text-primary" />
              </CardTitle>
              <CardTitle className="text-center">Phone Support</CardTitle>
              <CardDescription className="text-center">Premium & Enterprise Plans</CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <p className="mb-4">Speak directly with a support specialist for complex issues.</p>
              <Button className="w-full" variant="outline">
                1-800-MOD-HELP
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Support Hours */}
      <div className="mb-16 bg-muted p-8 rounded-lg">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="flex items-center mb-4 md:mb-0">
            <Clock className="h-10 w-10 mr-4 text-primary" />
            <div>
              <h3 className="text-xl font-bold">Support Hours</h3>
              <p className="text-muted-foreground">When you can reach our team</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
            <div>
              <p className="font-medium">Monday - Friday:</p>
              <p className="text-muted-foreground">9:00 AM - 8:00 PM EST</p>
            </div>
            <div>
              <p className="font-medium">Saturday:</p>
              <p className="text-muted-foreground">10:00 AM - 4:00 PM EST</p>
            </div>
            <div>
              <p className="font-medium">Sunday:</p>
              <p className="text-muted-foreground">Closed (Email Only)</p>
            </div>
            <div>
              <p className="font-medium">Holidays:</p>
              <p className="text-muted-foreground">Limited Support</p>
            </div>
          </div>
        </div>
      </div>

      {/* FAQs Section */}
      <div className="mb-16">
        <h2 className="text-2xl font-bold mb-8 text-center">Frequently Asked Questions</h2>

        <Tabs defaultValue="submission" className="w-full">
          <TabsList className="grid grid-cols-2 md:grid-cols-4 mb-8">
            <TabsTrigger value="submission" id="submission-faqs">
              Submission
            </TabsTrigger>
            <TabsTrigger value="licensing" id="licensing-faqs">
              Licensing
            </TabsTrigger>
            <TabsTrigger value="billing" id="billing-faqs">
              Billing
            </TabsTrigger>
            <TabsTrigger value="account" id="account-faqs">
              Account
            </TabsTrigger>
          </TabsList>

          <TabsContent value="submission">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger>How do I submit my fan art for licensing?</AccordionTrigger>
                <AccordionContent>
                  Log in to your MOD Platform account, navigate to the Dashboard, and click on "New
                  Submission." Fill out the submission form with details about your artwork, upload
                  high-quality images, and specify which IP your fan art is based on. Our AI system
                  will pre-screen your submission, and you'll receive updates on its status via
                  email and in your dashboard.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-2">
                <AccordionTrigger>What file formats are accepted for submissions?</AccordionTrigger>
                <AccordionContent>
                  We accept JPG, PNG, and TIFF files for 2D artwork with a minimum resolution of 300
                  DPI. For 3D models, we accept OBJ, STL, and GLB formats. Maximum file size is 50MB
                  per file. For best results, ensure your images are well-lit, clearly show the
                  artwork, and include multiple angles if relevant.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-3">
                <AccordionTrigger>How long does the review process take?</AccordionTrigger>
                <AccordionContent>
                  Initial AI screening happens immediately upon submission. For submissions that
                  pass AI screening, human review typically takes 3-5 business days for Basic
                  accounts and 1-2 business days for Premium accounts. Enterprise and Professional
                  accounts receive priority review within 24 hours. Complex submissions or those
                  requiring IP holder input may take longer.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-4">
                <AccordionTrigger>Why was my submission rejected?</AccordionTrigger>
                <AccordionContent>
                  Submissions may be rejected for several reasons, including: not meeting IP holder
                  guidelines, poor image quality, suspected AI-generated content without disclosure,
                  copyright concerns, or inappropriate content. You'll receive specific feedback on
                  why your submission was rejected and, in many cases, guidance on how to revise and
                  resubmit your work.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </TabsContent>

          <TabsContent value="licensing">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger>What types of licenses are available?</AccordionTrigger>
                <AccordionContent>
                  We offer several license types: Digital (for online use), Print (for physical
                  products), Commercial (for merchandise), and Extended (for large-scale commercial
                  use). Each license type has different terms, pricing, and revenue sharing
                  arrangements. You can view detailed license terms on each artwork's licensing
                  page.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-2">
                <AccordionTrigger>
                  How are licensing fees and royalties calculated?
                </AccordionTrigger>
                <AccordionContent>
                  Licensing fees are based on the license type, usage scope, and the IP's
                  popularity. Revenue sharing is typically 70/30 (artist/platform) for Basic
                  accounts, 80/20 for Premium accounts, and 85/15 for Professional accounts. IP
                  holders receive a portion of the platform's share. Detailed breakdowns are
                  provided before you finalize any licensing agreement.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-3">
                <AccordionTrigger>Can I set my own pricing for licenses?</AccordionTrigger>
                <AccordionContent>
                  Premium and Professional account holders can set suggested pricing for their
                  artwork, which will be considered during the final pricing determination. Basic
                  accounts use standard platform pricing. All final prices must comply with IP
                  holder requirements and platform guidelines.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-4">
                <AccordionTrigger>What happens after someone licenses my artwork?</AccordionTrigger>
                <AccordionContent>
                  You'll receive an immediate notification when your artwork is licensed. Payment
                  processing takes 3-5 business days, after which your share will be available in
                  your account balance. You can track all licenses, usage, and earnings in your
                  dashboard. Monthly reports provide detailed analytics on your licensed works.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </TabsContent>

          <TabsContent value="billing">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger>How do I upgrade or downgrade my subscription?</AccordionTrigger>
                <AccordionContent>
                  Log in to your account, go to Settings {'->'} Subscription, and select "Change
                  Plan." You can upgrade immediately, with prorated charges for the remainder of
                  your billing cycle. Downgrades take effect at the end of your current billing
                  period. There are no penalties for changing plans, but some features may be
                  limited if you downgrade.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-2">
                <AccordionTrigger>
                  When and how do I get paid for licensed artwork?
                </AccordionTrigger>
                <AccordionContent>
                  Payments are processed monthly for all earnings over $25. You can choose to
                  receive payments via direct deposit, PayPal, or Stripe. Processing typically takes
                  3-5 business days after the monthly payment cycle closes. You can view pending and
                  processed payments in your dashboard under Earnings.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-3">
                <AccordionTrigger>Are there any hidden fees?</AccordionTrigger>
                <AccordionContent>
                  There are no hidden fees on the MOD Platform. Subscription costs are clearly
                  displayed on our pricing page. Revenue sharing percentages are transparent and
                  consistent. Payment processing fees (typically 2.9% + $0.30) may be deducted from
                  earnings by payment processors, but we do not add additional fees beyond the
                  stated revenue share.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-4">
                <AccordionTrigger>What payment methods do you accept?</AccordionTrigger>
                <AccordionContent>
                  We accept all major credit cards (Visa, Mastercard, American Express, Discover),
                  PayPal, and Apple Pay. For Enterprise accounts, we also offer invoice payment
                  options with net-30 terms. All payments are processed securely through Stripe, our
                  payment processor.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </TabsContent>

          <TabsContent value="account">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger>How do I reset my password?</AccordionTrigger>
                <AccordionContent>
                  Click on "Forgot Password" on the login page, enter your email address, and follow
                  the instructions sent to your email. Password reset links expire after 24 hours
                  for security. If you don't receive the email, check your spam folder or contact
                  support for assistance.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-2">
                <AccordionTrigger>
                  Can I have multiple user accounts under one subscription?
                </AccordionTrigger>
                <AccordionContent>
                  Premium accounts include 1 additional user account, Professional accounts include
                  up to 3 additional users, and Enterprise accounts have customizable user limits.
                  Additional users can be added in your account settings under Team Members. Each
                  user has their own login credentials but shares the subscription features and
                  billing.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-3">
                <AccordionTrigger>How do I update my profile and portfolio?</AccordionTrigger>
                <AccordionContent>
                  Go to Settings {'->'} Profile to update your personal information, bio, and social
                  media links. Your portfolio is automatically populated with your approved
                  submissions, but you can customize which works are featured and in what order by
                  going to Portfolio {'->'} Manage in your dashboard.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-4">
                <AccordionTrigger>How do I delete my account?</AccordionTrigger>
                <AccordionContent>
                  Account deletion can be initiated in Settings {'->'} Account {'->'} Delete
                  Account. This process requires verification and has a 30-day cooling-off period
                  during which you can reactivate your account. After 30 days, your personal data
                  will be deleted, but records of licensed artwork and transactions will be
                  maintained for legal and accounting purposes.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </TabsContent>
        </Tabs>
      </div>

      {/* Support Resources */}
      <div>
        <h2 className="text-2xl font-bold mb-8 text-center">Additional Resources</h2>
        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Video Tutorials</CardTitle>
              <CardDescription>Step-by-step guides for using the platform</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Watch our comprehensive video tutorials covering everything from account setup to
                advanced licensing strategies.
              </p>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/resources/tutorials">Watch Tutorials</Link>
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Knowledge Base</CardTitle>
              <CardDescription>Detailed articles and guides</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Browse our extensive knowledge base with searchable articles, guides, and
                troubleshooting tips.
              </p>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/resources/knowledge-base">Browse Articles</Link>
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Community Forum</CardTitle>
              <CardDescription>Connect with other users</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Join discussions, share experiences, and get advice from other artists, brands, and
                creators.
              </p>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/community">Visit Forum</Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
