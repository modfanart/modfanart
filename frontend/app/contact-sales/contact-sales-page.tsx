"use client"

import { useState } from "react"
import Link from "next/link"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { CalendarDays, CheckCircle, Clock, Home, Mail, MessageSquare, Phone, Users } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "@/components/ui/use-toast"

const contactFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  company: z.string().min(1, { message: "Company name is required." }),
  phone: z.string().optional(),
  teamSize: z.string(),
  message: z.string().min(10, { message: "Message must be at least 10 characters." }),
  howHeard: z.string(),
})

type ContactFormValues = z.infer<typeof contactFormSchema>

const defaultValues: Partial<ContactFormValues> = {
  teamSize: "1-10",
  howHeard: "search",
}

export function ContactSalesPage() {
  const [activeTab, setActiveTab] = useState("contact")
  const [submitted, setSubmitted] = useState(false)

  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues,
  })

  function onSubmit(data: ContactFormValues) {
    console.log(data)
    toast({
      title: "Request submitted",
      description: "We'll be in touch with you shortly.",
    })
    setSubmitted(true)
  }

  const timeSlots = [
    { date: "Mon, Mar 9", slots: ["10:00 AM", "1:00 PM", "3:30 PM"] },
    { date: "Tue, Mar 10", slots: ["9:30 AM", "11:00 AM", "2:00 PM", "4:30 PM"] },
    { date: "Wed, Mar 11", slots: ["10:00 AM", "12:30 PM", "3:00 PM"] },
    { date: "Thu, Mar 12", slots: ["9:00 AM", "11:30 AM", "2:30 PM", "4:00 PM"] },
    { date: "Fri, Mar 13", slots: ["10:30 AM", "1:30 PM", "3:30 PM"] },
  ]

  const [selectedDate, setSelectedDate] = useState("")
  const [selectedTime, setSelectedTime] = useState("")
  const [demoSubmitted, setDemoSubmitted] = useState(false)

  const handleBookDemo = () => {
    if (selectedDate && selectedTime) {
      toast({
        title: "Demo scheduled",
        description: `Your demo is scheduled for ${selectedDate} at ${selectedTime}.`,
      })
      setDemoSubmitted(true)
    } else {
      toast({
        title: "Please select a date and time",
        description: "Both date and time are required to schedule a demo.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex justify-between items-center mb-8">
        <Link href="/">
          <Button variant="outline" className="flex items-center gap-2">
            <Home className="h-4 w-4" />
            Back to Homepage
          </Button>
        </Link>
      </div>

      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">Contact Our Sales Team</h1>
        <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto">
          Learn how MOD Platform can help you manage fan art licensing, protect intellectual property, and create new
          revenue streams.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
        <div className="lg:col-span-2">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="contact">Contact Sales</TabsTrigger>
              <TabsTrigger value="demo">Book a Demo</TabsTrigger>
            </TabsList>
            <TabsContent value="contact">
              {!submitted ? (
                <Card>
                  <CardHeader>
                    <CardTitle>Get in touch with our sales team</CardTitle>
                    <CardDescription>
                      Fill out the form below and one of our representatives will contact you shortly.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Full Name</FormLabel>
                                <FormControl>
                                  <Input placeholder="John Doe" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Email</FormLabel>
                                <FormControl>
                                  <Input placeholder="john@example.com" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <FormField
                            control={form.control}
                            name="company"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Company</FormLabel>
                                <FormControl>
                                  <Input placeholder="Your company" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="phone"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Phone (optional)</FormLabel>
                                <FormControl>
                                  <Input placeholder="+1 (555) 000-0000" {...field} />
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
                              <FormLabel>Team Size</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select team size" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="1-10">1-10 employees</SelectItem>
                                  <SelectItem value="11-50">11-50 employees</SelectItem>
                                  <SelectItem value="51-200">51-200 employees</SelectItem>
                                  <SelectItem value="201-500">201-500 employees</SelectItem>
                                  <SelectItem value="501+">501+ employees</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="message"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>How can we help?</FormLabel>
                              <FormControl>
                                <Textarea
                                  placeholder="Tell us about your needs and how we can help with fan art licensing..."
                                  className="min-h-32"
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
                                  className="grid grid-cols-2 md:grid-cols-3 gap-4"
                                >
                                  <FormItem className="flex items-center space-x-2 space-y-0">
                                    <FormControl>
                                      <RadioGroupItem value="search" />
                                    </FormControl>
                                    <FormLabel className="font-normal">Search Engine</FormLabel>
                                  </FormItem>
                                  <FormItem className="flex items-center space-x-2 space-y-0">
                                    <FormControl>
                                      <RadioGroupItem value="social" />
                                    </FormControl>
                                    <FormLabel className="font-normal">Social Media</FormLabel>
                                  </FormItem>
                                  <FormItem className="flex items-center space-x-2 space-y-0">
                                    <FormControl>
                                      <RadioGroupItem value="referral" />
                                    </FormControl>
                                    <FormLabel className="font-normal">Referral</FormLabel>
                                  </FormItem>
                                  <FormItem className="flex items-center space-x-2 space-y-0">
                                    <FormControl>
                                      <RadioGroupItem value="event" />
                                    </FormControl>
                                    <FormLabel className="font-normal">Event</FormLabel>
                                  </FormItem>
                                  <FormItem className="flex items-center space-x-2 space-y-0">
                                    <FormControl>
                                      <RadioGroupItem value="press" />
                                    </FormControl>
                                    <FormLabel className="font-normal">Press</FormLabel>
                                  </FormItem>
                                  <FormItem className="flex items-center space-x-2 space-y-0">
                                    <FormControl>
                                      <RadioGroupItem value="other" />
                                    </FormControl>
                                    <FormLabel className="font-normal">Other</FormLabel>
                                  </FormItem>
                                </RadioGroup>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <Button type="submit" className="w-full bg-[#9747ff] hover:bg-[#8035e0]">
                          Submit Request
                        </Button>
                      </form>
                    </Form>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle>Request Submitted</CardTitle>
                    <CardDescription>Thank you for contacting our sales team.</CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-col items-center justify-center py-10">
                    <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
                    <h3 className="text-xl font-semibold mb-2">We've received your request</h3>
                    <p className="text-center text-gray-600 mb-6">
                      One of our sales representatives will contact you within 24 hours to discuss how MOD Platform can
                      help your business.
                    </p>
                    <div className="flex gap-4">
                      <Button variant="outline" onClick={() => setSubmitted(false)}>
                        Submit Another Request
                      </Button>
                      <Button onClick={() => setActiveTab("demo")} className="bg-[#9747ff] hover:bg-[#8035e0]">
                        Book a Demo
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
            <TabsContent value="demo">
              {!demoSubmitted ? (
                <Card>
                  <CardHeader>
                    <CardTitle>Schedule a Demo</CardTitle>
                    <CardDescription>
                      Select a date and time that works for you, and our team will walk you through the MOD Platform.
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
                                variant={selectedDate === day.date ? "default" : "outline"}
                                className={`w-full justify-start ${
                                  selectedDate === day.date ? "bg-[#9747ff] hover:bg-[#8035e0]" : ""
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
                                  variant={selectedTime === time ? "default" : "outline"}
                                  className={`${selectedTime === time ? "bg-[#9747ff] hover:bg-[#8035e0]" : ""}`}
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
                              Brand managers, IP owners, licensing teams, and anyone involved in managing fan art or
                              creative content.
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start">
                          <Clock className="h-5 w-5 mr-3 text-gray-500 mt-0.5" />
                          <div>
                            <h4 className="font-medium">Duration</h4>
                            <p className="text-sm text-gray-600">45 minutes with additional time for Q&A</p>
                          </div>
                        </div>
                        <div className="flex items-start">
                          <MessageSquare className="h-5 w-5 mr-3 text-gray-500 mt-0.5" />
                          <div>
                            <h4 className="font-medium">What we'll cover</h4>
                            <p className="text-sm text-gray-600">
                              Platform overview, AI screening capabilities, licensing workflow, revenue models, and
                              customization options.
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
                      Your demo is scheduled for <span className="font-semibold">{selectedDate}</span> at{" "}
                      <span className="font-semibold">{selectedTime}</span>.
                    </p>
                    <p className="text-center text-gray-600 mb-6">
                      We've sent a calendar invitation to your email with all the details and a link to join the call.
                    </p>
                    <div className="flex gap-4">
                      <Button variant="outline" onClick={() => setDemoSubmitted(false)}>
                        Reschedule
                      </Button>
                      <Link href="/">
                        <Button className="bg-[#9747ff] hover:bg-[#8035e0]">Return to Homepage</Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>

        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
              <CardDescription>Reach out to us directly</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-start">
                <Mail className="h-5 w-5 mr-3 text-gray-500 mt-0.5" />
                <div>
                  <h4 className="font-medium">Email</h4>
                  <p className="text-sm text-gray-600">sales@modplatform.com</p>
                  <p className="text-sm text-gray-600">support@modplatform.com</p>
                </div>
              </div>
              <div className="flex items-start">
                <Phone className="h-5 w-5 mr-3 text-gray-500 mt-0.5" />
                <div>
                  <h4 className="font-medium">Phone</h4>
                  <p className="text-sm text-gray-600">+1 (555) 123-4567</p>
                </div>
              </div>
              <div className="flex items-start">
                <Users className="h-5 w-5 mr-3 text-gray-500 mt-0.5" />
                <div>
                  <h4 className="font-medium">Enterprise Solutions</h4>
                  <p className="text-sm text-gray-600">
                    For enterprise inquiries or custom solutions, please contact our enterprise team at
                    enterprise@modplatform.com
                  </p>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col items-start space-y-4">
              <div className="w-full p-4 bg-gray-50 rounded-md">
                <h4 className="font-medium mb-2">What our clients say</h4>
                <blockquote className="text-sm italic text-gray-600">
                  "MOD Platform has transformed how we manage fan art licensing. The AI screening saves us countless
                  hours and the revenue sharing model has created a new income stream for our brand."
                </blockquote>
                <p className="text-sm font-medium mt-2">— Marketing Director, Major Entertainment Studio</p>
              </div>
              <Link href="/" className="w-full mt-4">
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
  )
}

