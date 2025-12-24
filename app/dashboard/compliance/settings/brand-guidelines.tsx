'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ColorPicker } from '@/components/ui/color-picker';
import { FileUpload } from '@/components/ui/file-upload';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Palette, Type, Image, Shield, Bot } from 'lucide-react';

interface BrandGuidelines {
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
  };
  typography: {
    primaryFont: string;
    secondaryFont: string;
    minFontSize: number;
    maxFontSize: number;
  };
  logos: {
    main: string;
    alternate: string;
    minSize: number;
    clearSpace: number;
    restrictedUses: string[];
  };
  aiCriteria: {
    minConfidenceScore: number;
    autoApproveThreshold: number;
    requireHumanReview: boolean;
    contentRestrictions: string[];
  };
}

export default function BrandGuidelinesSettings() {
  const [guidelines, setGuidelines] = useState<BrandGuidelines>({
    colors: {
      primary: '#000000',
      secondary: '#ffffff',
      accent: '#0070f3',
      background: '#f5f5f5',
    },
    typography: {
      primaryFont: 'Inter',
      secondaryFont: 'System UI',
      minFontSize: 12,
      maxFontSize: 48,
    },
    logos: {
      main: '/path/to/main-logo.svg',
      alternate: '/path/to/alternate-logo.svg',
      minSize: 32,
      clearSpace: 16,
      restrictedUses: ['Modification', 'Rotation', 'Distortion'],
    },
    aiCriteria: {
      minConfidenceScore: 0.8,
      autoApproveThreshold: 0.95,
      requireHumanReview: true,
      contentRestrictions: ['Violence', 'Adult Content', 'Political Content'],
    },
  });

  const handleSave = async () => {
    try {
      // TODO: Implement API call to save guidelines
      console.log('Saving guidelines:', guidelines);
    } catch (error) {
      console.error('Error saving guidelines:', error);
    }
  };

  return (
    <Tabs defaultValue="colors" className="w-full">
      <TabsList className="grid w-full grid-cols-4 gap-4">
        <TabsTrigger value="colors" className="flex items-center gap-2">
          <Palette className="h-4 w-4" />
          Colors
        </TabsTrigger>
        <TabsTrigger value="typography" className="flex items-center gap-2">
          <Type className="h-4 w-4" />
          Typography
        </TabsTrigger>
        <TabsTrigger value="logos" className="flex items-center gap-2">
          <Image className="h-4 w-4" />
          Logos
        </TabsTrigger>
        <TabsTrigger value="ai-criteria" className="flex items-center gap-2">
          <Bot className="h-4 w-4" />
          AI Criteria
        </TabsTrigger>
      </TabsList>

      <TabsContent value="colors" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Brand Colors</CardTitle>
            <CardDescription>Define your brand's color palette</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Primary Color</Label>
                <ColorPicker
                  value={guidelines.colors.primary}
                  onChange={(color) =>
                    setGuidelines({
                      ...guidelines,
                      colors: { ...guidelines.colors, primary: color },
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Secondary Color</Label>
                <ColorPicker
                  value={guidelines.colors.secondary}
                  onChange={(color) =>
                    setGuidelines({
                      ...guidelines,
                      colors: { ...guidelines.colors, secondary: color },
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Accent Color</Label>
                <ColorPicker
                  value={guidelines.colors.accent}
                  onChange={(color) =>
                    setGuidelines({
                      ...guidelines,
                      colors: { ...guidelines.colors, accent: color },
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Background Color</Label>
                <ColorPicker
                  value={guidelines.colors.background}
                  onChange={(color) =>
                    setGuidelines({
                      ...guidelines,
                      colors: { ...guidelines.colors, background: color },
                    })
                  }
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="typography" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Typography Settings</CardTitle>
            <CardDescription>Configure font usage and sizes</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label>Primary Font</Label>
                <Input
                  value={guidelines.typography.primaryFont}
                  onChange={(e) =>
                    setGuidelines({
                      ...guidelines,
                      typography: { ...guidelines.typography, primaryFont: e.target.value },
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Secondary Font</Label>
                <Input
                  value={guidelines.typography.secondaryFont}
                  onChange={(e) =>
                    setGuidelines({
                      ...guidelines,
                      typography: { ...guidelines.typography, secondaryFont: e.target.value },
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Font Size Range (px)</Label>
                <div className="flex items-center gap-4">
                  <Input
                    type="number"
                    value={guidelines.typography.minFontSize}
                    onChange={(e) =>
                      setGuidelines({
                        ...guidelines,
                        typography: {
                          ...guidelines.typography,
                          minFontSize: Number(e.target.value),
                        },
                      })
                    }
                    className="w-20"
                  />
                  <span>to</span>
                  <Input
                    type="number"
                    value={guidelines.typography.maxFontSize}
                    onChange={(e) =>
                      setGuidelines({
                        ...guidelines,
                        typography: {
                          ...guidelines.typography,
                          maxFontSize: Number(e.target.value),
                        },
                      })
                    }
                    className="w-20"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="logos" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Logo Guidelines</CardTitle>
            <CardDescription>Set logo usage requirements</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label>Main Logo</Label>
                <FileUpload
                  accept="image/*"
                  onChange={(file) =>
                    setGuidelines({
                      ...guidelines,
                      logos: { ...guidelines.logos, main: URL.createObjectURL(file) },
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Alternate Logo</Label>
                <FileUpload
                  accept="image/*"
                  onChange={(file) =>
                    setGuidelines({
                      ...guidelines,
                      logos: { ...guidelines.logos, alternate: URL.createObjectURL(file) },
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Minimum Size (px)</Label>
                <Slider
                  value={[guidelines.logos.minSize]}
                  min={16}
                  max={128}
                  step={1}
                  onValueChange={([value]) =>
                    setGuidelines({
                      ...guidelines,
                      logos: { ...guidelines.logos, minSize: value! },
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Clear Space (px)</Label>
                <Slider
                  value={[guidelines.logos.clearSpace]}
                  min={8}
                  max={64}
                  step={1}
                  // Logo clearSpace
                  onValueChange={([value]) =>
                    setGuidelines({
                      ...guidelines,
                      logos: { ...guidelines.logos, clearSpace: value! },
                    })
                  }
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="ai-criteria" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>AI Approval Criteria</CardTitle>
            <CardDescription>Configure automated review settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Minimum Confidence Score</Label>
                <div className="flex items-center gap-4">
                  <Slider
                    value={[guidelines.aiCriteria.minConfidenceScore * 100]}
                    min={0}
                    max={100}
                    step={1}
                    onValueChange={([value]) =>
                      setGuidelines({
                        ...guidelines,
                        aiCriteria: { ...guidelines.aiCriteria, minConfidenceScore: value! / 100 },
                      })
                    }
                    className="flex-1"
                  />
                  <span className="w-12 text-right">
                    {Math.round(guidelines.aiCriteria.minConfidenceScore * 100)}%
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Auto-Approve Threshold</Label>
                <div className="flex items-center gap-4">
                  <Slider
                    value={[guidelines.aiCriteria.autoApproveThreshold * 100]}
                    min={0}
                    max={100}
                    step={1}
                    onValueChange={([value]) =>
                      setGuidelines({
                        ...guidelines,
                        aiCriteria: {
                          ...guidelines.aiCriteria,
                          autoApproveThreshold: value! / 100,
                        },
                      })
                    }
                    className="flex-1"
                  />
                  <span className="w-12 text-right">
                    {Math.round(guidelines.aiCriteria.autoApproveThreshold * 100)}%
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Require Human Review</Label>
                  <p className="text-sm text-muted-foreground">
                    Always require human approval regardless of AI confidence
                  </p>
                </div>
                <Switch
                  checked={guidelines.aiCriteria.requireHumanReview}
                  onCheckedChange={(checked) =>
                    setGuidelines({
                      ...guidelines,
                      aiCriteria: { ...guidelines.aiCriteria, requireHumanReview: checked },
                    })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Content Restrictions</Label>
                <div className="space-y-2">
                  {guidelines.aiCriteria.contentRestrictions.map((restriction, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Input
                        value={restriction}
                        onChange={(e) => {
                          const newRestrictions = [...guidelines.aiCriteria.contentRestrictions];
                          newRestrictions[index] = e.target.value;
                          setGuidelines({
                            ...guidelines,
                            aiCriteria: {
                              ...guidelines.aiCriteria,
                              contentRestrictions: newRestrictions,
                            },
                          });
                        }}
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const newRestrictions = guidelines.aiCriteria.contentRestrictions.filter(
                            (_, i) => i !== index
                          );
                          setGuidelines({
                            ...guidelines,
                            aiCriteria: {
                              ...guidelines.aiCriteria,
                              contentRestrictions: newRestrictions,
                            },
                          });
                        }}
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    onClick={() =>
                      setGuidelines({
                        ...guidelines,
                        aiCriteria: {
                          ...guidelines.aiCriteria,
                          contentRestrictions: [...guidelines.aiCriteria.contentRestrictions, ''],
                        },
                      })
                    }
                  >
                    Add Restriction
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <div className="mt-6 flex justify-end">
        <Button onClick={handleSave} className="flex items-center gap-2">
          <Shield className="h-4 w-4" />
          Save Guidelines
        </Button>
      </div>
    </Tabs>
  );
}
