import { Trophy, TrendingUp, Users, BarChart3 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { AuthButton } from '@/components/auth/AuthButton'

export function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="mx-auto max-w-6xl px-4 py-20">
          <div className="text-center space-y-8">
            <div className="flex justify-center">
              <div className="flex items-center gap-3 p-4 rounded-2xl bg-primary/10 border border-primary/20">
                <Trophy className="h-12 w-12 text-primary" />
                <h1 className="font-bold text-4xl md:text-6xl font-sans bg-gradient-to-r from-primary via-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Betting Tracker
                </h1>
              </div>
            </div>
            
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto font-medium">
              Spåra dina bets, analysera prestanda och förbättra din ROI med avancerad statistik och insikter
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
              <AuthButton />
              <p className="text-sm text-muted-foreground">
                Logga in med Google för att komma igång
              </p>
            </div>
          </div>
        </div>

        {/* Background decoration */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-20 left-10 w-20 h-20 bg-primary/10 rounded-full blur-xl" />
          <div className="absolute bottom-20 right-10 w-32 h-32 bg-blue-500/10 rounded-full blur-xl" />
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-primary/5 to-blue-500/5 rounded-full blur-3xl" />
        </div>
      </div>

      {/* Features Section */}
      <div className="mx-auto max-w-6xl px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Funktioner som förbättrar din betting</h2>
          <p className="text-muted-foreground text-lg">
            Allt du behöver för professionell betting-analys
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <Card className="group hover:shadow-lg transition-all duration-300 border-0 bg-gradient-to-br from-card to-card/50">
            <CardContent className="p-6 text-center space-y-4">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-lg">Avancerad Statistik</h3>
              <p className="text-muted-foreground">
                ROI-analys, vinsttrend och detaljerade rapporter för att förbättra din prestanda
              </p>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-lg transition-all duration-300 border-0 bg-gradient-to-br from-card to-card/50">
            <CardContent className="p-6 text-center space-y-4">
              <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                <BarChart3 className="h-6 w-6 text-blue-500" />
              </div>
              <h3 className="font-semibold text-lg">Interaktiva Grafer</h3>
              <p className="text-muted-foreground">
                Visualisera din utveckling med moderna charts och realtidsuppdateringar
              </p>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-lg transition-all duration-300 border-0 bg-gradient-to-br from-card to-card/50">
            <CardContent className="p-6 text-center space-y-4">
              <div className="w-12 h-12 bg-purple-500/10 rounded-lg flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                <Users className="h-6 w-6 text-purple-500" />
              </div>
              <h3 className="font-semibold text-lg">Leaderboard</h3>
              <p className="text-muted-foreground">
                Jämför din prestanda med andra användare och klättra i rankingen
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* CTA Section */}
      <div className="mx-auto max-w-4xl px-4 py-16">
        <Card className="bg-gradient-to-r from-primary/10 via-blue-500/10 to-purple-500/10 border-primary/20">
          <CardContent className="p-8 text-center space-y-6">
            <h2 className="text-2xl md:text-3xl font-bold">
              Redo att förbättra din betting?
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Börja spåra dina bets idag och få insikter som kan förbättra din ROI
            </p>
            <AuthButton />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
