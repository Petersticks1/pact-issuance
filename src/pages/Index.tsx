import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Award, Users, Trophy, Lock, Zap } from "lucide-react";
import { useAuth } from "@/components/AuthGuard";
import shieldMascot from "@/assets/shield-mascot.png";
import tokenMascot from "@/assets/token-mascot.png";

const Index = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && user) {
      navigate("/dashboard");
    }
  }, [user, loading, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-6 inline-flex">
            <img src={shieldMascot} alt="Shield Mascot" className="h-24 w-24 animate-bounce" />
          </div>
          <h1 className="mb-4 text-5xl font-bold tracking-tight sm:text-6xl">
            Soulbound Tokens
            <span className="block bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              on Hedera
            </span>
          </h1>
          <p className="mb-8 text-xl text-muted-foreground">
            Issue non-transferable tokens for credentials, memberships, and achievements.
            Built on the fast, secure Hedera Hashgraph network.
          </p>
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Button size="lg" onClick={() => navigate("/auth")} className="text-lg">
              Get Started
              <Shield className="ml-2 h-5 w-5" />
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate("/auth")}>
              Learn More
            </Button>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-4 py-16">
        <h2 className="mb-12 text-center text-3xl font-bold">What are Soulbound Tokens?</h2>
        <div className="grid gap-6 md:grid-cols-3">
          <Card className="group border-primary/20 bg-gradient-to-br from-card to-primary/5 transition-all hover:scale-105 hover:shadow-lg">
            <CardHeader>
              <div className="mb-2 flex items-center justify-center">
                <img src={tokenMascot} alt="Credentials" className="h-16 w-16 transition-transform group-hover:rotate-12" />
              </div>
              <CardTitle>Credentials</CardTitle>
              <CardDescription>
                Issue verifiable professional certifications and educational achievements
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="group border-secondary/20 bg-gradient-to-br from-card to-secondary/5 transition-all hover:scale-105 hover:shadow-lg">
            <CardHeader>
              <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-secondary text-secondary-foreground mx-auto">
                <Users className="h-6 w-6" />
              </div>
              <CardTitle>Memberships</CardTitle>
              <CardDescription>
                Create proof of membership for organizations and exclusive communities
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="group border-accent/20 bg-gradient-to-br from-card to-accent/5 transition-all hover:scale-105 hover:shadow-lg">
            <CardHeader>
              <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-accent text-accent-foreground mx-auto">
                <Trophy className="h-6 w-6" />
              </div>
              <CardTitle>Achievements</CardTitle>
              <CardDescription>
                Recognize accomplishments with permanent, verifiable digital badges
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="container mx-auto px-4 py-16">
        <h2 className="mb-12 text-center text-3xl font-bold">Why Hedera?</h2>
        <div className="mx-auto grid max-w-4xl gap-8 md:grid-cols-2">
          <div className="flex gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Lock className="h-6 w-6" />
            </div>
            <div>
              <h3 className="mb-2 text-xl font-semibold">Non-Transferable</h3>
              <p className="text-muted-foreground">
                Tokens are permanently bound to recipients using TokenUpdateTransaction to revoke KYC
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-secondary/10 text-secondary">
              <Zap className="h-6 w-6" />
            </div>
            <div>
              <h3 className="mb-2 text-xl font-semibold">Fast & Efficient</h3>
              <p className="text-muted-foreground">
                Built on Hedera's high-performance, energy-efficient network
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-accent/10 text-accent">
              <Shield className="h-6 w-6" />
            </div>
            <div>
              <h3 className="mb-2 text-xl font-semibold">Secure</h3>
              <p className="text-muted-foreground">
                Enterprise-grade security with Hedera's proof-of-stake consensus
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Award className="h-6 w-6" />
            </div>
            <div>
              <h3 className="mb-2 text-xl font-semibold">Verifiable</h3>
              <p className="text-muted-foreground">
                Publicly verifiable credentials that can't be forged or transferred
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="container mx-auto px-4 py-16">
        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-secondary/5">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl">Ready to Issue Your First Token?</CardTitle>
            <CardDescription className="text-lg">
              Join the future of verifiable credentials on Hedera
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Button size="lg" onClick={() => navigate("/auth")}>
              Create Account
              <Shield className="ml-2 h-5 w-5" />
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Index;
