import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ModelInfo, MODEL_PROVIDERS } from "@/lib/modelProviders"
import { Building2, DollarSign, Calendar, Cpu, Eye, Zap } from "lucide-react"

interface ModelInfoCardProps {
  model: ModelInfo
}

export function ModelInfoCard({ model }: ModelInfoCardProps) {
  const provider = MODEL_PROVIDERS.find(p => p.id === model.provider)
  
  if (!provider) return null

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-white shadow-md flex items-center justify-center p-2">
              <img src={provider.logo} alt={provider.name} className="w-full h-full object-contain" />
            </div>
            <div>
              <CardTitle className="text-lg">{model.name}</CardTitle>
              <p className="text-sm text-muted-foreground">{model.family}</p>
            </div>
          </div>
          <Badge variant={provider.dataResidency === 'EU Compliant' ? 'default' : 'secondary'}>
            {provider.dataResidency}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Provider Info */}
        <div className="flex items-center gap-2 text-sm">
          <Building2 className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">{provider.name}</span>
          <span className="text-muted-foreground">•</span>
          <span>{provider.flag} {provider.headquarters}</span>
        </div>

        {/* Description */}
        <p className="text-sm text-muted-foreground leading-relaxed">
          {model.description}
        </p>

        {/* Specifications */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Cpu className="h-3 w-3" />
              Context Window
            </div>
            <p className="text-sm font-medium">{model.contextWindow}</p>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Zap className="h-3 w-3" />
              Max Output
            </div>
            <p className="text-sm font-medium">{model.maxOutputTokens}</p>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Calendar className="h-3 w-3" />
              Training Cutoff
            </div>
            <p className="text-sm font-medium">{model.trainingCutoff}</p>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Eye className="h-3 w-3" />
              Released
            </div>
            <p className="text-sm font-medium">{model.releaseDate}</p>
          </div>
        </div>

        {/* Modalities */}
        <div>
          <p className="text-xs text-muted-foreground mb-2">Supported Modalities</p>
          <div className="flex flex-wrap gap-1">
            {model.modalities.map((modality) => (
              <Badge key={modality} variant="outline" className="text-xs">
                {modality}
              </Badge>
            ))}
          </div>
        </div>

        {/* Pricing */}
        <div className="pt-3 border-t">
          <div className="flex items-center gap-2 mb-3">
            <DollarSign className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Pricing (per 1M tokens)</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-background/50 rounded-lg p-3">
              <p className="text-xs text-muted-foreground mb-1">Input</p>
              <p className="text-lg font-bold text-primary">${model.inputPricePerMillion.toFixed(2)}</p>
            </div>
            <div className="bg-background/50 rounded-lg p-3">
              <p className="text-xs text-muted-foreground mb-1">Output</p>
              <p className="text-lg font-bold text-primary">${model.outputPricePerMillion.toFixed(2)}</p>
            </div>
          </div>
          {model.cachedInputPricePerMillion && (
            <div className="mt-2 bg-green-500/10 rounded-lg p-2 border border-green-500/20">
              <p className="text-xs text-green-700 dark:text-green-400">
                💾 Cached Input: ${model.cachedInputPricePerMillion.toFixed(2)}/1M tokens
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
