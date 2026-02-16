"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, Save, Plus, Trash2, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DashboardShell } from "@/components/dashboard-shell"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function BrandGuidelinesPage() {
  const router = useRouter()
  const [guidelines, setGuidelines] = useState({
    brandName: "Marvel Entertainment",
    allowedCharacters: ["Iron Man", "Captain America", "Thor", "Black Widow", "Hulk"],
    prohibitedContent: ["Excessive violence", "Sexual content", "Political statements", "Religious imagery"],
    styleGuidelines:
      "Characters should be portrayed in a heroic manner consistent with their established personalities. Use the official color palette for costumes and branding elements.",
    logoUsage:
      "The Marvel logo may be included but must not be modified or distorted. Maintain clear space around the logo equal to the height of the 'M'.",
    additionalNotes:
      "Fan art should be clearly labeled as unofficial fan creations. Submissions should not imply official endorsement by Marvel Entertainment.",
  })

  const [newCharacter, setNewCharacter] = useState("")
  const [newProhibited, setNewProhibited] = useState("")

  const handleAddCharacter = () => {
    if (newCharacter.trim()) {
      setGuidelines({
        ...guidelines,
        allowedCharacters: [...guidelines.allowedCharacters, newCharacter.trim()],
      })
      setNewCharacter("")
    }
  }

  const handleRemoveCharacter = (index: number) => {
    const updatedCharacters = [...guidelines.allowedCharacters]
    updatedCharacters.splice(index, 1)
    setGuidelines({
      ...guidelines,
      allowedCharacters: updatedCharacters,
    })
  }

  const handleAddProhibited = () => {
    if (newProhibited.trim()) {
      setGuidelines({
        ...guidelines,
        prohibitedContent: [...guidelines.prohibitedContent, newProhibited.trim()],
      })
      setNewProhibited("")
    }
  }

  const handleRemoveProhibited = (index: number) => {
    const updatedProhibited = [...guidelines.prohibitedContent]
    updatedProhibited.splice(index, 1)
    setGuidelines({
      ...guidelines,
      prohibitedContent: updatedProhibited,
    })
  }

  const handleSave = () => {
    // In a real app, this would save to a database
    console.log("Saving guidelines:", guidelines)
    // Show success message and redirect
    router.push("/dashboard/compliance")
  }

  return (
    <DashboardShell>
      <div className="flex items-center gap-4">
        <Link href="/dashboard/compliance">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Brand Guidelines</h1>
          <p className="text-muted-foreground">Define the rules and requirements for fan art submissions</p>
        </div>
      </div>

      <Alert className="mt-6">
        <Info className="h-4 w-4" />
        <AlertTitle>Important</AlertTitle>
        <AlertDescription>
          These guidelines will be used by our AI to automatically screen submissions for compliance. Be specific and
          clear to ensure accurate screening results.
        </AlertDescription>
      </Alert>

      <div className="mt-6">
        <Tabs defaultValue="basic">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="basic">Basic Information</TabsTrigger>
            <TabsTrigger value="content">Content Rules</TabsTrigger>
            <TabsTrigger value="style">Style Guidelines</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="mt-4 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Brand Identity</CardTitle>
                <CardDescription>Define your brand name and core identity elements</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="brandName">Brand Name</Label>
                  <Input
                    id="brandName"
                    value={guidelines.brandName}
                    onChange={(e) => setGuidelines({ ...guidelines, brandName: e.target.value })}
                    placeholder="Enter your brand name"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Allowed Characters/Properties</Label>
                  <div className="flex gap-2">
                    <Input
                      value={newCharacter}
                      onChange={(e) => setNewCharacter(e.target.value)}
                      placeholder="Add a character or property"
                    />
                    <Button type="button" onClick={handleAddCharacter} size="sm">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="mt-2 space-y-2">
                    {guidelines.allowedCharacters.map((character, index) => (
                      <div key={index} className="flex items-center justify-between rounded-md border px-3 py-2">
                        <span>{character}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveCharacter(index)}
                          className="h-8 w-8 p-0 text-muted-foreground"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="logoUsage">Logo Usage Guidelines</Label>
                  <Textarea
                    id="logoUsage"
                    value={guidelines.logoUsage}
                    onChange={(e) => setGuidelines({ ...guidelines, logoUsage: e.target.value })}
                    placeholder="Describe how your logo can be used in fan art"
                    className="min-h-[100px]"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="content" className="mt-4 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Content Rules</CardTitle>
                <CardDescription>Define what content is prohibited in fan art submissions</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Prohibited Content</Label>
                  <div className="flex gap-2">
                    <Input
                      value={newProhibited}
                      onChange={(e) => setNewProhibited(e.target.value)}
                      placeholder="Add prohibited content type"
                    />
                    <Button type="button" onClick={handleAddProhibited} size="sm">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="mt-2 space-y-2">
                    {guidelines.prohibitedContent.map((item, index) => (
                      <div key={index} className="flex items-center justify-between rounded-md border px-3 py-2">
                        <span>{item}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveProhibited(index)}
                          className="h-8 w-8 p-0 text-muted-foreground"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="additionalNotes">Additional Content Notes</Label>
                  <Textarea
                    id="additionalNotes"
                    value={guidelines.additionalNotes}
                    onChange={(e) => setGuidelines({ ...guidelines, additionalNotes: e.target.value })}
                    placeholder="Any additional content guidelines or requirements"
                    className="min-h-[100px]"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="style" className="mt-4 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Style Guidelines</CardTitle>
                <CardDescription>Define the artistic style requirements for fan art</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="styleGuidelines">Style Requirements</Label>
                  <Textarea
                    id="styleGuidelines"
                    value={guidelines.styleGuidelines}
                    onChange={(e) => setGuidelines({ ...guidelines, styleGuidelines: e.target.value })}
                    placeholder="Describe the artistic style requirements"
                    className="min-h-[200px]"
                  />
                </div>

                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="colors">
                    <AccordionTrigger>Color Palette</AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-4">
                        <p className="text-sm text-muted-foreground">
                          Define the official colors that should be used for your brand elements.
                        </p>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Primary Color</Label>
                            <div className="flex gap-2">
                              <Input type="color" className="h-10 w-20" />
                              <Input placeholder="#000000" />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label>Secondary Color</Label>
                            <div className="flex gap-2">
                              <Input type="color" className="h-10 w-20" />
                              <Input placeholder="#000000" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="typography">
                    <AccordionTrigger>Typography</AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-4">
                        <p className="text-sm text-muted-foreground">
                          Define the fonts and typography guidelines for your brand.
                        </p>
                        <div className="space-y-2">
                          <Label>Primary Font</Label>
                          <Input placeholder="e.g., Helvetica Neue" />
                        </div>
                        <div className="space-y-2">
                          <Label>Typography Notes</Label>
                          <Textarea placeholder="Additional typography guidelines" />
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <div className="mt-6 flex justify-end gap-4">
        <Button variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
        <Button onClick={handleSave}>
          <Save className="mr-2 h-4 w-4" />
          Save Guidelines
        </Button>
      </div>
    </DashboardShell>
  )
}

