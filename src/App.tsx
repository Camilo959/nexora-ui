import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

function App() {
  return (
    <main className="min-h-screen bg-background p-8">
      <div className="mx-auto max-w-5xl space-y-8">

        <header>
          <p className="font-mono text-xs tracking-widest text-muted-foreground">
            NEXORA / UI SYSTEM
          </p>

          <h1 className="mt-2 text-3xl font-semibold">
            Technical Functionalism
          </h1>
        </header>

        <Card className="rounded-sm p-6 shadow-none">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold tracking-widest text-muted-foreground">
                TEMPERATURE
              </p>

              <p className="mt-4 font-mono text-5xl tabular-nums">
                45.2
                <span className="ml-2 text-2xl text-muted-foreground">
                  °C
                </span>
              </p>
            </div>

            <Badge className="rounded-sm">
              LIVE
            </Badge>
          </div>
        </Card>

        <Button>
          START MOTOR
        </Button>

      </div>
    </main>
  )
}

export default App