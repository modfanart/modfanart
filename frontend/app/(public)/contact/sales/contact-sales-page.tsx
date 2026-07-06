'use client';

import { useState } from 'react';
import Link from 'next/link';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import {
  Building,
  CalendarDays,
  CheckCircle,
  Clock,
  FileText,
  Globe,
  Home,
  Mail,
  MessageSquare,
  Phone,
  Users,
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
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/components/ui/use-toast';
import { useSubmitBrandVerificationRequestMutation } from '@/services/api/brands';
import {
  brandRequestSchema,
  brandRequestDefaultValues,
  type BrandRequestValues,
} from './contact-sales-schema';

export function ContactSalesPage() {
  const [activeTab, setActiveTab] = useState('request');
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<BrandRequestValues>({
    resolver: zodResolver(brandRequestSchema),
    defaultValues: brandRequestDefaultValues,
  });

  const [submitBrandRequest] = useSubmitBrandVerificationRequestMutation();

  async function onSubmit(data: BrandRequestValues) {
    setIsSubmitting(true);

    try {
      await submitBrandRequest({
        company_name: data.companyName,
        website: data.website || null,
        contact_email: data.contactEmail,
        contact_phone: data.contactPhone || null,
        description: data.description,
        team_size: data.teamSize,
        // For "Other", send the free-text detail; otherwise the selected source.
        how_heard: data.howHeard === 'other' ? data.howHeardOther : data.howHeard,
      }).unwrap();

      toast({
        title: 'Brand request received',
        description:
          'Our team will review your submission and contact you within 1–3 business days.',
      });

      setSubmitted(true);
    } catch (err: any) {
      toast({
        title: 'Something went wrong',
        description: err?.data?.error || 'Please try again or contact support.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  // ────────────────────────────────────────────────
  // BOOK A DEMO – completely unchanged as requested
  // ────────────────────────────────────────────────
  const timeSlots = [
    { date: 'Mon, Mar 9', slots: ['10:00 AM', '1:00 PM', '3:30 PM'] },
    { date: 'Tue, Mar 10', slots: ['9:30 AM', '11:00 AM', '2:00 PM', '4:30 PM'] },
    { date: 'Wed, Mar 11', slots: ['10:00 AM', '12:30 PM', '3:00 PM'] },
    { date: 'Thu, Mar 12', slots: ['9:00 AM', '11:30 AM', '2:30 PM', '4:00 PM'] },
    { date: 'Fri, Mar 13', slots: ['10:30 AM', '1:30 PM', '3:30 PM'] },
  ];

  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [demoSubmitted, setDemoSubmitted] = useState(false);

  const handleBookDemo = () => {
    if (selectedDate && selectedTime) {
      toast({
        title: 'Demo scheduled',
        description: `Your demo is scheduled for ${selectedDate} at ${selectedTime}.`,
      });
      setDemoSubmitted(true);
    } else {
      toast({
        title: 'Please select a date and time',
        description: 'Both date and time are required to schedule a demo.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="container mx-auto px-4 pt-24 pb-12 md:pb-16">
      <div className="flex justify-between items-center mb-8 md:mb-12">
        <Link href="/">
          <Button variant="outline" className="flex items-center gap-2">
            <Home className="h-4 w-4" />
            Back to Homepage
          </Button>
        </Link>
      </div>

      <div className="mb-10 md:mb-12 text-center">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-gray-900">
          Request a Brand Demo
        </h1>

        <p className="mt-4 text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
          Submit your brand details below. Our team will review your request, schedule an onboarding call, 
          and set up a dedicated brand manager account for you or your team.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12 max-w-7xl mx-auto">
        {/* Main form area */}
        <div className="lg:col-span-2">
          {!submitted ? (
            <Card className="border-none shadow-lg">
              <CardHeader className="pb-6">
                <CardTitle className="text-2xl">
                  Brand Demo & Onboarding Request
                </CardTitle>

                <CardDescription className="text-base">
                  Share a few details about your brand so we can prepare for a
                  personalized walkthrough of the MOD Platform.
                </CardDescription>
              </CardHeader>

              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">

                    {/* Company Info */}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="companyName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Brand / Company Name *</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Example Studios, Fashion Brand XYZ"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="website"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              Official Website / Online Presence
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder="https://yourbrand.com"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="contactEmail"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Primary Contact Email *</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="licensing@yourbrand.com"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="contactPhone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              Contact Phone (WhatsApp / Mobile preferred)
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder="+1 (555) 123-4567"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="teamSize"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Approximate Team Size</FormLabel>

                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select team size" />
                              </SelectTrigger>
                            </FormControl>

                            <SelectContent>
                              <SelectItem value="1-10">1–10 people</SelectItem>
                              <SelectItem value="11-50">11–50 people</SelectItem>
                              <SelectItem value="51-200">51–200 people</SelectItem>
                              <SelectItem value="201-500">201–500 people</SelectItem>
                              <SelectItem value="501+">501+ people</SelectItem>
                              <SelectItem value="agency">
                                Creative Agency / Studio
                              </SelectItem>
                            </SelectContent>
                          </Select>

                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>About Your Brand & Goals *</FormLabel>

                          <FormControl>
                            <Textarea
                              className="min-h-[140px]"
                              placeholder="What does your brand create? What categories do you operate in? What are you hoping to accomplish with MOD?"
                              {...field}
                            />
                          </FormControl>

                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Demo Interest */}

                    <div className="rounded-xl border bg-slate-50 p-6">
                      <h3 className="font-semibold text-lg mb-4">
                        What are you most interested in?
                      </h3>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                        <label className="flex items-center gap-2">
                          <input type="checkbox" />
                          Licensing & Brand Protection
                        </label>

                        <label className="flex items-center gap-2">
                          <input type="checkbox" />
                          AI Content Screening
                        </label>

                        <label className="flex items-center gap-2">
                          <input type="checkbox" />
                          Revenue Opportunities
                        </label>

                        <label className="flex items-center gap-2">
                          <input type="checkbox" />
                          Fan Merchandise Programs
                        </label>

                        <label className="flex items-center gap-2">
                          <input type="checkbox" />
                          Creator Management
                        </label>

                        <label className="flex items-center gap-2">
                          <input type="checkbox" />
                          Enterprise Integrations
                        </label>
                      </div>
                    </div>

                    {/* How Heard */}

                    <FormField
                      control={form.control}
                      name="howHeard"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>How did you hear about us?</FormLabel>

                          <FormControl>
                            <RadioGroup
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                              className="grid grid-cols-2 sm:grid-cols-3 gap-4"
                            >
                              <FormItem className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                  <RadioGroupItem value="search" />
                                </FormControl>
                                <FormLabel className="font-normal">
                                  Search Engine
                                </FormLabel>
                              </FormItem>

                              <FormItem className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                  <RadioGroupItem value="social" />
                                </FormControl>
                                <FormLabel className="font-normal">
                                  Social Media
                                </FormLabel>
                              </FormItem>

                              <FormItem className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                  <RadioGroupItem value="discord" />
                                </FormControl>
                                <FormLabel className="font-normal">
                                  Discord
                                </FormLabel>
                              </FormItem>

                              <FormItem className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                  <RadioGroupItem value="referral" />
                                </FormControl>
                                <FormLabel className="font-normal">
                                  Referral
                                </FormLabel>
                              </FormItem>

                              <FormItem className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                  <RadioGroupItem value="event" />
                                </FormControl>
                                <FormLabel className="font-normal">
                                  Event / Conference
                                </FormLabel>
                              </FormItem>

                              <FormItem className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                  <RadioGroupItem value="article" />
                                </FormControl>
                                <FormLabel className="font-normal">
                                  Article / Press
                                </FormLabel>
                              </FormItem>

                              <FormItem className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                  <RadioGroupItem value="other" />
                                </FormControl>
                                <FormLabel className="font-normal">
                                  Other
                                </FormLabel>
                              </FormItem>
                            </RadioGroup>
                          </FormControl>

                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Other detail - shown only when "Other" is selected */}
                    {form.watch('howHeard') === 'other' && (
                      <FormField
                        control={form.control}
                        name="howHeardOther"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Please specify</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="How did you hear about us?"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}

                    {/* What Happens Next */}

                    <div className="rounded-xl border p-6 bg-white">
                      <h3 className="font-semibold text-lg mb-5">
                        What Happens Next?
                      </h3>

                      <div className="space-y-5">
                        <div className="flex gap-4">
                          <FileText className="h-5 w-5 text-violet-600 mt-1" />
                          <div>
                            <h4 className="font-medium">Review</h4>
                            <p className="text-sm text-muted-foreground">
                              Our team reviews your submission and evaluates your
                              onboarding requirements.
                            </p>
                          </div>
                        </div>

                        <div className="flex gap-4">
                          <Mail className="h-5 w-5 text-violet-600 mt-1" />
                          <div>
                            <h4 className="font-medium">Email Outreach</h4>
                            <p className="text-sm text-muted-foreground">
                              We'll contact you to coordinate a convenient demo time.
                            </p>
                          </div>
                        </div>

                        <div className="flex gap-4">
                          <Users className="h-5 w-5 text-violet-600 mt-1" />
                          <div>
                            <h4 className="font-medium">Personalized Demo</h4>
                            <p className="text-sm text-muted-foreground">
                              A 45-minute walkthrough tailored to your brand.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-xl bg-violet-50 border border-violet-200 p-5">
                      <p className="font-medium mb-2">
                        Average response time: 1–2 business days
                      </p>

                      <p className="text-sm text-muted-foreground">
                        Brand managers, licensing teams, IP owners, creator program
                        managers, and decision makers are encouraged to attend.
                      </p>
                    </div>

                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full h-12 text-lg bg-violet-600 hover:bg-violet-700"
                    >
                      {isSubmitting
                        ? 'Submitting...'
                        : 'Request Demo & Brand Review'}
                    </Button>

                  </form>
                </Form>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-none shadow-lg">
              <CardContent className="py-16 text-center">
                <CheckCircle className="h-20 w-20 text-green-500 mx-auto mb-6" />

                <h2 className="text-3xl font-bold mb-4">
                  Request Submitted
                </h2>

                <p className="text-gray-600 max-w-xl mx-auto mb-8">
                  Thank you for your interest in MOD. Our team will review your
                  information and contact you within 1–2 business days to schedule
                  your personalized demo.
                </p>

                <Button
                  onClick={() => {
                    setSubmitted(false);
                    form.reset();
                  }}
                  variant="outline"
                >
                  Submit Another Request
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Side info panel */}
        <div className="lg:col-span-1">
          <Card className="sticky top-8">
            <CardHeader>
              <CardTitle>Need Help?</CardTitle>
              <CardDescription>Reach out directly or learn more</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <h4 className="font-medium">Email</h4>
                  <p className="text-sm text-muted-foreground break-all">
                    team@modfanofficial.com
                    <br />
                    support@modfanofficial.com
                  </p>
                </div>
              </div>

              {/* <div className="flex items-start gap-3">
                <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <h4 className="font-medium">Phone / WhatsApp</h4>
                  <p className="text-sm text-muted-foreground">+91 11 4123 4567</p>
                </div>
              </div> */}

              <div className="flex items-start gap-3">
                <Building className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <h4 className="font-medium">For Brands & IP Owners</h4>
                  <p className="text-sm text-muted-foreground">
                    Use the form on the left to start the onboarding process.
                  </p>
                </div>
              </div>
            </CardContent>

            <CardFooter className="flex flex-col items-start gap-4 pt-6 border-t">
              {/* <div className="w-full p-4 bg-muted/40 rounded-lg">
                <h4 className="font-medium mb-2">What brands are saying</h4>
                <blockquote className="text-sm italic text-muted-foreground">
                  "The team was extremely helpful during onboarding. We now have full control over
                  fan creations while generating real revenue."
                </blockquote>
                <p className="text-xs text-muted-foreground mt-2 font-medium">
                  — Head of Licensing, Global Media Brand
                </p>
              </div> */}

              <Link href="/" className="w-full">
                <Button variant="outline" className="w-full flex items-center justify-center gap-2">
                  <Home className="h-4 w-4" />
                  Return to Homepage
                </Button>
              </Link>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
