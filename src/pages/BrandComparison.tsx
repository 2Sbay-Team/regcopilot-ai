import { useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Shield, Brain, Zap, Heart, Sparkles, TrendingUp, Users, Target } from "lucide-react";

type BrandVariant = 'refined' | 'nina' | 'ninja';

export default function BrandComparison() {
  const [activeVariant, setActiveVariant] = useState<BrandVariant>('refined');

  const variants = {
    refined: {
      name: "Regulix (Refined)",
      tagline: "Precision Regulatory Intelligence",
      colors: {
        primary: "hsl(214 100% 58%)",
        secondary: "hsl(190 100% 50%)",
        accent: "hsl(180 100% 45%)",
        background: "hsl(220 40% 12%)",
      },
      icon: Brain,
      personality: ["Precise", "Authoritative", "Futuristic", "Technical"],
      targetAudience: "Enterprise CTOs & Technical Teams",
      strengths: ["Most advanced tech positioning", "Appeals to technical decision-makers", "Premium solution perception"],
      bestFor: ["Enterprise sales", "Technical product demos", "API-first positioning"],
    },
    nina: {
      name: "NinaRegulix",
      tagline: "Your Compliance Companion",
      colors: {
        primary: "hsl(210 75% 55%)",
        secondary: "hsl(150 35% 55%)",
        accent: "hsl(260 50% 65%)",
        background: "hsl(40 30% 95%)",
      },
      icon: Heart,
      personality: ["Friendly", "Approachable", "Helpful", "Patient"],
      targetAudience: "Growing SMBs & First-time Users",
      strengths: ["Dramatically different in compliance space", "Lower intimidation factor", "Creates emotional connection"],
      bestFor: ["SMB market expansion", "Self-service onboarding", "Community building"],
    },
    ninja: {
      name: "Regulix Ninja",
      tagline: "Fast. Precise. Undetectable.",
      colors: {
        primary: "hsl(0 85% 55%)",
        secondary: "hsl(200 100% 50%)",
        accent: "hsl(130 100% 50%)",
        background: "hsl(220 25% 10%)",
      },
      icon: Zap,
      personality: ["Fast", "Confident", "Expert", "Action-oriented"],
      targetAudience: "Fast-growth Startups & Power Users",
      strengths: ["Most memorable and distinctive", "Emphasizes speed advantage", "Strong for performance marketing"],
      bestFor: ["Fast-growth startups", "Time-sensitive compliance", "Competitive differentiation"],
    },
  };

  const current = variants[activeVariant];
  const Icon = current.icon;

  return (
    <AppLayout>
      <div className="container mx-auto py-8 px-4 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <Badge variant="outline" className="mb-4">Brand Exploration</Badge>
          <h1 className="text-4xl font-bold mb-2">Regulix Rebranding Options</h1>
          <p className="text-muted-foreground text-lg">
            Compare three strategic brand directions for Regulix
          </p>
        </div>

        {/* Variant Selector */}
        <Tabs value={activeVariant} onValueChange={(v) => setActiveVariant(v as BrandVariant)} className="mb-8">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="refined" className="flex items-center gap-2">
              <Brain className="h-4 w-4" />
              Refined
            </TabsTrigger>
            <TabsTrigger value="nina" className="flex items-center gap-2">
              <Heart className="h-4 w-4" />
              Nina
            </TabsTrigger>
            <TabsTrigger value="ninja" className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Ninja
            </TabsTrigger>
          </TabsList>

          {/* Refined View */}
          <TabsContent value="refined" className="space-y-6">
            <Card style={{ background: variants.refined.colors.background, color: '#f8fafc' }}>
              <CardHeader>
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-4 rounded-lg" style={{ background: variants.refined.colors.primary }}>
                    <Brain className="h-12 w-12 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-3xl mb-2" style={{ color: '#f8fafc' }}>
                      {variants.refined.name}
                    </CardTitle>
                    <CardDescription className="text-xl" style={{ color: variants.refined.colors.secondary }}>
                      {variants.refined.tagline}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Sparkles className="h-4 w-4" style={{ color: variants.refined.colors.accent }} />
                    Color Palette
                  </h3>
                  <div className="grid grid-cols-4 gap-3">
                    {Object.entries(variants.refined.colors).map(([name, color]) => (
                      <div key={name} className="space-y-2">
                        <div className="h-20 rounded-lg border-2 border-white/20" style={{ background: color }} />
                        <p className="text-xs capitalize" style={{ color: '#94a3b8' }}>{name}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Target className="h-4 w-4" style={{ color: variants.refined.colors.accent }} />
                    Personality Traits
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {variants.refined.personality.map(trait => (
                      <Badge key={trait} variant="outline" style={{ 
                        borderColor: variants.refined.colors.accent,
                        color: variants.refined.colors.secondary 
                      }}>
                        {trait}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Users className="h-4 w-4" style={{ color: variants.refined.colors.accent }} />
                    Target Audience
                  </h3>
                  <p style={{ color: '#cbd5e1' }}>{variants.refined.targetAudience}</p>
                </div>

                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" style={{ color: variants.refined.colors.accent }} />
                    Key Strengths
                  </h3>
                  <ul className="space-y-2">
                    {variants.refined.strengths.map(strength => (
                      <li key={strength} className="flex items-start gap-2" style={{ color: '#cbd5e1' }}>
                        <span style={{ color: variants.refined.colors.accent }}>▸</span>
                        {strength}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold mb-3">Best For</h3>
                  <div className="flex flex-wrap gap-2">
                    {variants.refined.bestFor.map(item => (
                      <Badge key={item} style={{ 
                        background: variants.refined.colors.primary,
                        color: 'white'
                      }}>
                        {item}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Nina View */}
          <TabsContent value="nina" className="space-y-6">
            <Card style={{ background: variants.nina.colors.background, color: '#334155' }}>
              <CardHeader>
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-4 rounded-2xl" style={{ background: variants.nina.colors.primary }}>
                    <Heart className="h-12 w-12 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-3xl mb-2" style={{ color: '#334155' }}>
                      {variants.nina.name}
                    </CardTitle>
                    <CardDescription className="text-xl" style={{ color: variants.nina.colors.secondary }}>
                      {variants.nina.tagline}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Sparkles className="h-4 w-4" style={{ color: variants.nina.colors.accent }} />
                    Color Palette
                  </h3>
                  <div className="grid grid-cols-4 gap-3">
                    {Object.entries(variants.nina.colors).map(([name, color]) => (
                      <div key={name} className="space-y-2">
                        <div className="h-20 rounded-2xl border-2" style={{ 
                          background: color,
                          borderColor: name === 'background' ? '#cbd5e1' : color
                        }} />
                        <p className="text-xs capitalize" style={{ color: '#64748b' }}>{name}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Target className="h-4 w-4" style={{ color: variants.nina.colors.accent }} />
                    Personality Traits
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {variants.nina.personality.map(trait => (
                      <Badge key={trait} variant="outline" style={{ 
                        borderColor: variants.nina.colors.accent,
                        color: variants.nina.colors.primary,
                        borderRadius: '1rem'
                      }}>
                        {trait}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Users className="h-4 w-4" style={{ color: variants.nina.colors.accent }} />
                    Target Audience
                  </h3>
                  <p style={{ color: '#475569' }}>{variants.nina.targetAudience}</p>
                </div>

                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" style={{ color: variants.nina.colors.accent }} />
                    Key Strengths
                  </h3>
                  <ul className="space-y-2">
                    {variants.nina.strengths.map(strength => (
                      <li key={strength} className="flex items-start gap-2" style={{ color: '#475569' }}>
                        <span style={{ color: variants.nina.colors.accent }}>♥</span>
                        {strength}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold mb-3">Best For</h3>
                  <div className="flex flex-wrap gap-2">
                    {variants.nina.bestFor.map(item => (
                      <Badge key={item} style={{ 
                        background: variants.nina.colors.primary,
                        color: 'white',
                        borderRadius: '1rem'
                      }}>
                        {item}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Ninja View */}
          <TabsContent value="ninja" className="space-y-6">
            <Card style={{ background: variants.ninja.colors.background, color: '#f1f5f9' }}>
              <CardHeader>
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-4 rounded-md" style={{ 
                    background: variants.ninja.colors.primary,
                    transform: 'skewX(-5deg)'
                  }}>
                    <Zap className="h-12 w-12 text-white" style={{ transform: 'skewX(5deg)' }} />
                  </div>
                  <div>
                    <CardTitle className="text-3xl mb-2 uppercase tracking-tight" style={{ color: '#f1f5f9' }}>
                      {variants.ninja.name}
                    </CardTitle>
                    <CardDescription className="text-xl uppercase tracking-wide" style={{ color: variants.ninja.colors.secondary }}>
                      {variants.ninja.tagline}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2 uppercase">
                    <Sparkles className="h-4 w-4" style={{ color: variants.ninja.colors.accent }} />
                    Color Palette
                  </h3>
                  <div className="grid grid-cols-4 gap-3">
                    {Object.entries(variants.ninja.colors).map(([name, color]) => (
                      <div key={name} className="space-y-2">
                        <div className="h-20 rounded-md border-2 border-white/10" style={{ 
                          background: color,
                          transform: 'skewX(-3deg)'
                        }} />
                        <p className="text-xs capitalize uppercase tracking-wider" style={{ color: '#94a3b8' }}>{name}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2 uppercase">
                    <Target className="h-4 w-4" style={{ color: variants.ninja.colors.accent }} />
                    Personality Traits
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {variants.ninja.personality.map(trait => (
                      <Badge key={trait} variant="outline" style={{ 
                        borderColor: variants.ninja.colors.accent,
                        color: variants.ninja.colors.secondary,
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em'
                      }}>
                        {trait}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2 uppercase">
                    <Users className="h-4 w-4" style={{ color: variants.ninja.colors.accent }} />
                    Target Audience
                  </h3>
                  <p style={{ color: '#cbd5e1' }}>{variants.ninja.targetAudience}</p>
                </div>

                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2 uppercase">
                    <TrendingUp className="h-4 w-4" style={{ color: variants.ninja.colors.accent }} />
                    Key Strengths
                  </h3>
                  <ul className="space-y-2">
                    {variants.ninja.strengths.map(strength => (
                      <li key={strength} className="flex items-start gap-2" style={{ color: '#cbd5e1' }}>
                        <span style={{ color: variants.ninja.colors.accent }}>⚡</span>
                        {strength}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold mb-3 uppercase">Best For</h3>
                  <div className="flex flex-wrap gap-2">
                    {variants.ninja.bestFor.map(item => (
                      <Badge key={item} style={{ 
                        background: variants.ninja.colors.primary,
                        color: 'white',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em'
                      }}>
                        {item}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Comparison Matrix */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Comparison Matrix</CardTitle>
            <CardDescription>Evaluate each variant across key dimensions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">Dimension</th>
                    <th className="text-center py-3 px-4">Regulix (Refined)</th>
                    <th className="text-center py-3 px-4">NinaRegulix</th>
                    <th className="text-center py-3 px-4">Regulix Ninja</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="py-3 px-4 font-medium">Primary Emotion</td>
                    <td className="text-center py-3 px-4">Precision & Trust</td>
                    <td className="text-center py-3 px-4">Warmth & Guidance</td>
                    <td className="text-center py-3 px-4">Speed & Power</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-3 px-4 font-medium">Market Position</td>
                    <td className="text-center py-3 px-4">Premium Tech Leader</td>
                    <td className="text-center py-3 px-4">Accessible Helper</td>
                    <td className="text-center py-3 px-4">Fast Expert</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-3 px-4 font-medium">Complexity Level</td>
                    <td className="text-center py-3 px-4">High</td>
                    <td className="text-center py-3 px-4">Low</td>
                    <td className="text-center py-3 px-4">Medium</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-3 px-4 font-medium">Brand Risk</td>
                    <td className="text-center py-3 px-4">Conservative</td>
                    <td className="text-center py-3 px-4">Moderate</td>
                    <td className="text-center py-3 px-4">Bold</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-medium">Memorability</td>
                    <td className="text-center py-3 px-4">High</td>
                    <td className="text-center py-3 px-4">Very High</td>
                    <td className="text-center py-3 px-4">Extremely High</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Documentation Links */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Full Documentation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm text-muted-foreground mb-4">
              For complete brand guidelines, implementation details, and design systems:
            </p>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" asChild>
                <a href="/BRANDING_ARCHIVE.md" target="_blank">Original Branding Archive</a>
              </Button>
              <Button variant="outline" asChild>
                <a href="/REBRANDING_OPTIONS.md" target="_blank">Full Rebranding Analysis</a>
              </Button>
              <Button variant="outline" asChild>
                <a href="/design-systems/" target="_blank">CSS Design Systems</a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
