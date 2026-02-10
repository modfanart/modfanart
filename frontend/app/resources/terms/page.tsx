import React from 'react';
import type { Metadata } from 'next';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Mail, Scale, FileText, Users, Shield, Info } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Submission Terms and Conditions | MOD Platform',
  description:
    'Read the official terms governing fan-art contests, submissions, eligibility, prizes, and licensing on the MOD platform.',
};

export default function SubmissionTermsPage() {
  return (
    <div className="container max-w-4xl py-10 md:py-12 lg:py-16">
      {/* Header */}
      <div className="mb-10 space-y-4 text-center">
        <div className="inline-flex items-center gap-3 rounded-full border bg-muted/40 px-4 py-1.5 text-sm font-medium">
          <Scale className="h-4 w-4 text-primary" />
          Official Legal Terms
        </div>
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          Submission Terms and Conditions
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          These terms govern your participation in all fan-art contests, challenges, and calls for
          submissions operated by Merch On Demand Inc. (MOD).
        </p>
        <p className="text-sm text-muted-foreground">Last updated: February 8, 2026</p>
      </div>

      <Card className="border-border shadow-sm">
        <CardHeader className="pb-6 border-b">
          <CardTitle className="text-2xl sm:text-3xl">General Submission Terms</CardTitle>
          <CardDescription className="mt-2 text-base">
            Please read these terms carefully before submitting any artwork.
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-8">
          <Accordion type="single" collapsible defaultValue="section-1" className="w-full">
            {/* 1. Introduction */}
            <AccordionItem value="section-1" className="border-b last:border-none">
              <AccordionTrigger className="py-5 text-lg font-semibold hover:no-underline">
                <div className="flex items-center gap-4">
                  <Badge
                    variant="outline"
                    className="h-8 w-8 rounded-full p-0 text-base font-bold flex-shrink-0"
                  >
                    1
                  </Badge>
                  <span>Introduction</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pb-6 pt-2 space-y-5 text-base leading-relaxed">
                <p>
                  These submission terms and conditions (the <strong>“Terms”</strong>) govern your
                  participation in all fan-art contests, challenges and calls-for-submissions
                  (collectively, <strong>“Contests”</strong>) operated by Merch On Demand Inc.,
                  doing business as MOD INC., and its affiliates (
                  <strong>“MOD,” “we,” “our”</strong> or <strong>“us”</strong>).
                </p>
                <p>
                  By submitting artwork or otherwise participating in any Contest, you agree to be
                  bound by these Terms and any supplemental rules or announcements for the specific
                  Contest (<strong>“Contest Rules”</strong>). If you do not agree to these Terms or
                  the Contest Rules, do not participate.
                </p>
                <p>
                  These Terms may be updated or modified from time to time without prior notice. The
                  version posted at the time of your submission will govern that submission.
                </p>
              </AccordionContent>
            </AccordionItem>

            {/* 2. Eligibility */}
            <AccordionItem value="section-2">
              <AccordionTrigger className="py-5 text-lg font-semibold hover:no-underline">
                <div className="flex items-center gap-4">
                  <Badge
                    variant="outline"
                    className="h-8 w-8 rounded-full p-0 text-base font-bold flex-shrink-0"
                  >
                    2
                  </Badge>
                  <span>Eligibility</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pb-6 pt-2 space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium flex items-center gap-2">
                    <Users className="h-5 w-5 text-muted-foreground" />
                    2.1 Age and Capacity
                  </h3>
                  <p>
                    Unless otherwise stated in the Contest Rules, participation is open only to
                    individuals who are at least 18 years of age (or the age of majority in their
                    jurisdiction, if higher) and who have the legal capacity to enter into binding
                    agreements. Participants under the age of majority must obtain consent from
                    their parent or legal guardian before participating.
                  </p>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-medium flex items-center gap-2">
                    <Users className="h-5 w-5 text-muted-foreground" />
                    2.2 Residency
                  </h3>
                  <p>
                    Contests are generally open to residents of Canada (excluding Quebec), the
                    United States (excluding Puerto Rico), and other jurisdictions worldwide where
                    contests of this nature are not prohibited by law. Residents of Quebec are
                    excluded because of language and registration requirements. Residents of Puerto
                    Rico are excluded because of local registration requirements. Participation is
                    void where prohibited and subject to all applicable federal, provincial, state
                    and local laws and regulations.
                  </p>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-medium flex items-center gap-2">
                    <Shield className="h-5 w-5 text-muted-foreground" />
                    2.3 High-Value Prize Restrictions
                  </h3>
                  <p>
                    Some jurisdictions impose registration or bonding requirements when prize values
                    reach certain amounts. See Section 5 for details.
                  </p>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">2.4 No Purchase Necessary</h3>
                  <p>
                    No purchase or payment is required to submit artwork or to participate. Making a
                    purchase will not improve your chances of winning.
                  </p>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">2.5 Limitations on Entries</h3>
                  <p>
                    Unless specified in the Contest Rules, there is a limit of one submission per
                    person, per Contest. Mass entries generated by a script, macro or other
                    automated means are void.
                  </p>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* 3. Submission Guidelines */}
            <AccordionItem value="section-3">
              <AccordionTrigger className="py-5 text-lg font-semibold hover:no-underline">
                <div className="flex items-center gap-4">
                  <Badge
                    variant="outline"
                    className="h-8 w-8 rounded-full p-0 text-base font-bold flex-shrink-0"
                  >
                    3
                  </Badge>
                  <span>Submission Guidelines</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pb-6 pt-2 space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">3.1 Original Work</h3>
                  <p>
                    You represent and warrant that each artwork you submit is your original creation
                    and does not infringe or violate the rights of any third party, including any
                    copyright, trademark, privacy, publicity or other proprietary right. You must
                    have obtained the consent of any individuals identifiable in your submission.
                  </p>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">3.2 Permitted Fan Works</h3>
                  <p>
                    Unless otherwise stated, you may incorporate characters or elements from the
                    applicable intellectual property (“IP”) for which the Contest is run, solely for
                    purposes of the Contest. Use of any other third-party content requires written
                    permission from the rights holder.
                  </p>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">3.3 Prohibited Content</h3>
                  <p>
                    Submissions that are illegal, obscene, pornographic, violent, defamatory,
                    harassing, discriminatory, offensive or otherwise inconsistent with our brand
                    values (as determined in our sole discretion) will be disqualified.
                  </p>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">3.4 Grant of Rights for Submissions</h3>
                  <p>
                    By submitting artwork, you grant MOD and its designees a worldwide,
                    royalty-free, non-exclusive license to host, store, reproduce, display, adapt
                    and communicate your submission (in whole or in part) solely for purposes of
                    administering the Contest, promoting the Contest and its related events, and
                    showcasing your work. You retain ownership subject to this license. If selected
                    as a winner, you will sign a separate Artist–Client Agreement.
                  </p>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">3.5 Right to Remove</h3>
                  <p>
                    We reserve the right to remove submissions for any reason, including at the
                    request of the IP owner or due to complaints.
                  </p>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* 4. Contest Mechanics */}
            <AccordionItem value="section-4">
              <AccordionTrigger className="py-5 text-lg font-semibold hover:no-underline">
                <div className="flex items-center gap-4">
                  <Badge
                    variant="outline"
                    className="h-8 w-8 rounded-full p-0 text-base font-bold flex-shrink-0"
                  >
                    4
                  </Badge>
                  <span>Contest Mechanics</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pb-6 pt-2 space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">4.1 Skill-Based Judging</h3>
                  <p>
                    Winners are selected based on artistic merit, originality, adherence to theme,
                    relevance to IP, and other criteria described in the Contest Rules. There is no
                    element of chance.
                  </p>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">4.2 Judging Panel</h3>
                  <p>
                    The panel’s decisions are final. We may disqualify any submission that does not
                    meet the rules.
                  </p>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">4.3 Skill Testing Question (Canada)</h3>
                  <p>
                    Canadian winners may be required to correctly answer a mathematical
                    skill-testing question.
                  </p>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">4.4 Announcement of Winners</h3>
                  <p>
                    Winners will be notified via provided contact information. Failure to respond or
                    sign agreements may result in forfeiture.
                  </p>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">4.5 Prizes and Royalty Compensation</h3>
                  <p>
                    Prizes may include cash, merchandise, experiences, and/or royalties. Taxes are
                    your responsibility.
                  </p>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">4.6 Licensing Agreement for Winners</h3>
                  <p>Winners must enter a separate Artist–Client Agreement or forfeit the prize.</p>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* 5. High-Value Prize Contests & Jurisdictional Restrictions */}
            <AccordionItem value="section-5">
              <AccordionTrigger className="py-5 text-lg font-semibold hover:no-underline">
                <div className="flex items-center gap-4">
                  <Badge
                    variant="outline"
                    className="h-8 w-8 rounded-full p-0 text-base font-bold flex-shrink-0"
                  >
                    5
                  </Badge>
                  <span>High-Value Prize Contests & Jurisdictional Restrictions</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pb-6 pt-2 space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">
                    5.1 Jurisdictional Exclusions Based on Prize Value
                  </h3>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>
                      <strong>Prizes &lt; US$500 total:</strong> All eligible jurisdictions
                    </li>
                    <li>
                      <strong>US$500 – US$4,999 total:</strong> Rhode Island excluded
                    </li>
                    <li>
                      <strong>≥ US$5,000 total:</strong> Florida, New York, and Rhode Island
                      excluded
                    </li>
                  </ul>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">5.2 Quebec & Other Countries</h3>
                  <p>
                    Quebec, Puerto Rico and certain jurisdictions are excluded unless otherwise
                    stated.
                  </p>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* 6–9 remaining sections – keeping concise for brevity */}
            <AccordionItem value="section-6">
              <AccordionTrigger className="py-5 text-lg font-semibold hover:no-underline">
                <div className="flex items-center gap-4">
                  <Badge
                    variant="outline"
                    className="h-8 w-8 rounded-full p-0 text-base font-bold flex-shrink-0"
                  >
                    6
                  </Badge>
                  <span>Representations and Warranties</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pb-6 pt-2">
                <p className="text-base leading-relaxed">
                  You represent and warrant that you are the sole creator, the work does not
                  infringe third-party rights, you can grant the required licenses, and your
                  submission complies with all laws.
                </p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="section-7">
              <AccordionTrigger className="py-5 text-lg font-semibold hover:no-underline">
                <div className="flex items-center gap-4">
                  <Badge
                    variant="outline"
                    className="h-8 w-8 rounded-full p-0 text-base font-bold flex-shrink-0"
                  >
                    7
                  </Badge>
                  <span>Personal Information & Privacy</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pb-6 pt-2">
                <p className="text-base leading-relaxed">
                  We collect and use your personal information only to administer Contests, verify
                  eligibility, issue prizes, and promote events. Data may be stored/transferred to
                  Canada and the United States.
                </p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="section-8">
              <AccordionTrigger className="py-5 text-lg font-semibold hover:no-underline">
                <div className="flex items-center gap-4">
                  <Badge
                    variant="outline"
                    className="h-8 w-8 rounded-full p-0 text-base font-bold flex-shrink-0"
                  >
                    8
                  </Badge>
                  <span>General Conditions</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pb-6 pt-2 space-y-6">
                <p className="text-base leading-relaxed">
                  We may disqualify participants, cancel/modify Contests, and limit liability to the
                  extent permitted by law. These Terms are governed by the laws of Ontario, Canada.
                </p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="section-9">
              <AccordionTrigger className="py-5 text-lg font-semibold hover:no-underline">
                <div className="flex items-center gap-4">
                  <Badge
                    variant="outline"
                    className="h-8 w-8 rounded-full p-0 text-base font-bold flex-shrink-0"
                  >
                    9
                  </Badge>
                  <span>Contest-Specific Rules</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pb-6 pt-2">
                <p className="text-base leading-relaxed">
                  Each Contest has its own rules posted on the contest page. In case of conflict,
                  Contest Rules prevail over these general Terms.
                </p>
              </AccordionContent>
            </AccordionItem>

            {/* Contact */}
            <AccordionItem value="contact">
              <AccordionTrigger className="py-5 text-lg font-semibold hover:no-underline">
                <div className="flex items-center gap-4">
                  <Badge
                    variant="outline"
                    className="h-8 w-8 rounded-full p-0 text-base font-bold flex-shrink-0 bg-primary/10 text-primary border-primary/30"
                  >
                    Contact
                  </Badge>
                  <span>Questions or Concerns?</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pb-8 pt-6">
                <div className="rounded-xl bg-muted/50 p-8 text-center border">
                  <Mail className="mx-auto h-12 w-12 text-primary mb-4" />
                  <h3 className="text-xl font-semibold mb-3">Get in Touch</h3>
                  <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                    If you have questions about these Terms, a specific Contest, or need assistance,
                    please reach out.
                  </p>
                  <Button asChild size="lg" className="gap-2">
                    <a href="mailto:hello@modfanart.com">
                      <Mail className="h-5 w-5" />
                      hello@modfanart.com
                    </a>
                  </Button>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          <Separator className="my-12" />

          <div className="text-center space-y-6">
            <p className="text-2xl font-semibold text-primary">
              Thank you for sharing your incredible talent with us.
            </p>
            <p className="text-xl font-medium">Let’s celebrate fan creativity together! ❤️</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
