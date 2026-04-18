'use client';

import { useState } from 'react';
import Link from 'next/link';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
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

// ────────────────────────────────────────────────
// Zod schema – matches BrandVerificationRequest backend
// ────────────────────────────────────────────────
const brandRequestSchema = z.object({
  companyName: z
    .string()
    .min(2, { message: 'Brand / company name is required (min 2 characters).' }),
  website: z.string().url({ message: 'Please enter a valid URL' }).optional().or(z.literal('')),
  contactEmail: z.string().email({ message: 'Valid email is required.' }),
  contactPhone: z.string().optional(),
  description: z
    .string()
    .min(30, { message: 'Please tell us more about your brand (min 30 characters).' }),
  teamSize: z.string(),
  howHeard: z.string(),
  // documents: z.array(z.string()).optional(), // ← add later with file upload
});

type BrandRequestValues = z.infer<typeof brandRequestSchema>;

const defaultValues: Partial<BrandRequestValues> = {
  teamSize: '1-10',
  howHeard: 'search',
};

export function ContactSalesPage() {
  const [activeTab, setActiveTab] = useState('request');
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<BrandRequestValues>({
    resolver: zodResolver(brandRequestSchema),
    defaultValues,
  });

  async function onSubmit(data: BrandRequestValues) {
    setIsSubmitting(true);

    try {
      // ────────────────────────────────────────────────
      // In real app → replace with RTK Query mutation
      // const [submitRequest] = useSubmitBrandVerificationRequestMutation()
      // await submitRequest({
      //   company_name: data.companyName,
      //   website: data.website || undefined,
      //   contact_email: data.contactEmail,
      //   contact_phone: data.contactPhone || undefined,
      //   description: data.description,
      //   // documents: uploadedUrls,
      // }).unwrap()

      // Simulate API delay (remove in production)
      await new Promise((resolve) => setTimeout(resolve, 1400));

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
    <div className="container mx-auto px-4 py-12 md:py-16">
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
          Request Your Brand
        </h1>
        <p className="mt-4 text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
          Submit your brand details below. Our team will review your request, schedule an onboarding
          call if needed, and set up a dedicated brand manager account for you or your team.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12 max-w-7xl mx-auto">
        {/* Main form area */}
        <div className="lg:col-span-2">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="request">Request Your Brand</TabsTrigger>
              <TabsTrigger value="demo">Book a Demo</TabsTrigger>
            </TabsList>

            {/* ────────────────────────────────────────────────
                REQUEST YOUR BRAND TAB
            ──────────────────────────────────────────────── */}
            <TabsContent value="request">
              {!submitted ? (
                <Card className="border-none shadow-lg">
                  <CardHeader className="pb-6">
                    <CardTitle className="text-2xl">Brand Onboarding Request</CardTitle>
                    <CardDescription className="text-base">
                      Please provide accurate details about your brand. This helps us prepare for
                      the onboarding process (review → call → brand manager account creation).
                    </CardDescription>
                  </CardHeader>

                  <CardContent>
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                                <FormLabel>Official Website / Online Presence</FormLabel>
                                <FormControl>
                                  <Input placeholder="https://yourbrand.com" {...field} />
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
                                  <Input placeholder="licensing@yourbrand.com" {...field} />
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
                                <FormLabel>Contact Phone (WhatsApp / Mobile preferred)</FormLabel>
                                <FormControl>
                                  <Input placeholder="+91 98765 43210" {...field} />
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
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                                  <SelectItem value="agency">Creative Agency / Studio</SelectItem>
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
                                  placeholder="What is your brand about? Which categories (fashion, entertainment, gaming, etc.)? Are you looking to monetize fan creations, protect IP, build community, or something else?..."
                                  className="min-h-[120px] resize-y"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

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
                                    <FormLabel className="font-normal cursor-pointer">
                                      Search Engine
                                    </FormLabel>
                                  </FormItem>

                                  <FormItem className="flex items-center space-x-3 space-y-0">
                                    <FormControl>
                                      <RadioGroupItem value="social" />
                                    </FormControl>
                                    <FormLabel className="font-normal cursor-pointer">
                                      Social Media
                                    </FormLabel>
                                  </FormItem>

                                  <FormItem className="flex items-center space-x-3 space-y-0">
                                    <FormControl>
                                      <RadioGroupItem value="referral" />
                                    </FormControl>
                                    <FormLabel className="font-normal cursor-pointer">
                                      Referral
                                    </FormLabel>
                                  </FormItem>

                                  <FormItem className="flex items-center space-x-3 space-y-0">
                                    <FormControl>
                                      <RadioGroupItem value="event" />
                                    </FormControl>
                                    <FormLabel className="font-normal cursor-pointer">
                                      Event / Conference
                                    </FormLabel>
                                  </FormItem>

                                  <FormItem className="flex items-center space-x-3 space-y-0">
                                    <FormControl>
                                      <RadioGroupItem value="article" />
                                    </FormControl>
                                    <FormLabel className="font-normal cursor-pointer">
                                      Article / Press
                                    </FormLabel>
                                  </FormItem>

                                  <FormItem className="flex items-center space-x-3 space-y-0">
                                    <FormControl>
                                      <RadioGroupItem value="other" />
                                    </FormControl>
                                    <FormLabel className="font-normal cursor-pointer">
                                      Other
                                    </FormLabel>
                                  </FormItem>
                                </RadioGroup>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="pt-4">
                          <Button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full bg-violet-600 hover:bg-violet-700 text-white h-12 text-lg font-medium"
                          >
                            {isSubmitting ? 'Submitting...' : 'Submit Brand Request'}
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </CardContent>
                </Card>
              ) : (
                <Card className="border-none shadow-lg">
                  <CardHeader className="pb-6">
                    <CardTitle className="text-2xl">Thank You!</CardTitle>
                    <CardDescription className="text-base">
                      Your brand request has been successfully submitted.
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                    <CheckCircle className="h-20 w-20 text-green-500 mb-6" />
                    <h3 className="text-2xl font-semibold mb-4">We’ve received your request</h3>
                    <p className="text-gray-600 text-lg max-w-2xl mb-8 leading-relaxed">
                      Our onboarding team will carefully review your brand details. You’ll hear back
                      from us within 1–3 business days to schedule a quick call and move forward
                      with setting up your brand manager account.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setSubmitted(false);
                          form.reset();
                        }}
                        className="min-w-[180px]"
                      >
                        Submit Another Request
                      </Button>

                      <Button
                        onClick={() => setActiveTab('demo')}
                        className="bg-violet-600 hover:bg-violet-700 min-w-[180px]"
                      >
                        Book a Demo Instead
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* ────────────────────────────────────────────────
                 BOOK A DEMO – untouched as requested
            ──────────────────────────────────────────────── */}
            <TabsContent value="demo">
              {!demoSubmitted ? (
                <Card>
                  <CardHeader>
                    <CardTitle>Schedule a Demo</CardTitle>
                    <CardDescription>
                      Select a date and time that works for you, and our team will walk you through
                      the MOD Platform.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h3 className="text-lg font-medium mb-4">Select a Date</h3>
                        <div className="space-y-2">
                          {timeSlots.map((day) => (
                            <div key={day.date} className="flex items-center">
                              <Button
                                variant={selectedDate === day.date ? 'default' : 'outline'}
                                className={`w-full justify-start ${
                                  selectedDate === day.date ? 'bg-[#9747ff] hover:bg-[#8035e0]' : ''
                                }`}
                                onClick={() => setSelectedDate(day.date)}
                              >
                                <CalendarDays className="mr-2 h-4 w-4" />
                                {day.date}
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h3 className="text-lg font-medium mb-4">Select a Time</h3>
                        {selectedDate ? (
                          <div className="grid grid-cols-2 gap-2">
                            {timeSlots
                              .find((day) => day.date === selectedDate)
                              ?.slots.map((time) => (
                                <Button
                                  key={time}
                                  variant={selectedTime === time ? 'default' : 'outline'}
                                  className={`${selectedTime === time ? 'bg-[#9747ff] hover:bg-[#8035e0]' : ''}`}
                                  onClick={() => setSelectedTime(time)}
                                >
                                  <Clock className="mr-2 h-4 w-4" />
                                  {time}
                                </Button>
                              ))}
                          </div>
                        ) : (
                          <div className="flex items-center justify-center h-32 border rounded-md border-dashed">
                            <p className="text-gray-500">Please select a date first</p>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="mt-8">
                      <h3 className="text-lg font-medium mb-4">Demo Details</h3>
                      <div className="space-y-4">
                        <div className="flex items-start">
                          <Users className="h-5 w-5 mr-3 text-gray-500 mt-0.5" />
                          <div>
                            <h4 className="font-medium">Who should attend</h4>
                            <p className="text-sm text-gray-600">
                              Brand managers, IP owners, licensing teams, and anyone involved in
                              managing fan art or creative content.
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start">
                          <Clock className="h-5 w-5 mr-3 text-gray-500 mt-0.5" />
                          <div>
                            <h4 className="font-medium">Duration</h4>
                            <p className="text-sm text-gray-600">
                              45 minutes with additional time for Q&A
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start">
                          <MessageSquare className="h-5 w-5 mr-3 text-gray-500 mt-0.5" />
                          <div>
                            <h4 className="font-medium">What we'll cover</h4>
                            <p className="text-sm text-gray-600">
                              Platform overview, AI screening capabilities, licensing workflow,
                              revenue models, and customization options.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button
                      onClick={handleBookDemo}
                      className="w-full bg-[#9747ff] hover:bg-[#8035e0]"
                      disabled={!selectedDate || !selectedTime}
                    >
                      Book Demo
                    </Button>
                  </CardFooter>
                </Card>
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle>Demo Scheduled</CardTitle>
                    <CardDescription>Your demo has been successfully scheduled.</CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-col items-center justify-center py-10">
                    <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
                    <h3 className="text-xl font-semibold mb-2">You're all set!</h3>
                    <p className="text-center text-gray-600 mb-2">
                      Your demo is scheduled for{' '}
                      <span className="font-semibold">{selectedDate}</span> at{' '}
                      <span className="font-semibold">{selectedTime}</span>.
                    </p>
                    <p className="text-center text-gray-600 mb-6">
                      We've sent a calendar invitation to your email with all the details and a link
                      to join the call.
                    </p>
                    <div className="flex gap-4">
                      <Button variant="outline" onClick={() => setDemoSubmitted(false)}>
                        Reschedule
                      </Button>
                      <Link href="/">
                        <Button className="bg-[#9747ff] hover:bg-[#8035e0]">
                          Return to Homepage
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
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
                    onboarding@modplatform.com
                    <br />
                    support@modplatform.com
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
