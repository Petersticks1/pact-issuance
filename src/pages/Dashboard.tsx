import { useState } from "react";
import { AuthGuard, useAuth } from "@/components/AuthGuard";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { Shield, Plus, LogOut, Award, Users, Trophy } from "lucide-react";
import { IssueTokenDialog } from "@/components/IssueTokenDialog";
import { TokensList } from "@/components/TokensList";
import { WalletConnect } from "@/components/WalletConnect";
import { toast } from "sonner";
import shieldMascot from "@/assets/shield-mascot.png";
import tokenMascot from "@/assets/token-mascot.png";

const DashboardContent = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isIssueDialogOpen, setIsIssueDialogOpen] = useState(false);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast.success("Signed out successfully");
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-secondary">
              <Shield className="h-6 w-6 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-bold">SBT Portal</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">{user?.email}</span>
            <Button variant="outline" size="sm" onClick={handleSignOut}>
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Welcome Section with Mascot */}
        <div className="mb-8 flex items-center gap-4 rounded-xl bg-gradient-to-r from-primary/20 to-secondary/20 p-6">
          <img src={shieldMascot} alt="Shield Mascot" className="h-20 w-20" />
          <div>
            <h2 className="text-2xl font-bold">Welcome to your SBT Portal!</h2>
            <p className="text-muted-foreground">
              Issue and manage non-transferable credentials on Hedera blockchain
            </p>
          </div>
        </div>

        {/* Wallet Connection */}
        <div className="mb-8">
          <WalletConnect />
        </div>

        {/* Stats Cards */}
        <div className="mb-8 grid gap-4 md:grid-cols-3">
          <Card className="border-primary/20 bg-gradient-to-br from-card to-primary/5">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Credentials</CardTitle>
              <Award className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">
                Professional certifications
              </p>
            </CardContent>
          </Card>
          
          <Card className="border-secondary/20 bg-gradient-to-br from-card to-secondary/5">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Memberships</CardTitle>
              <Users className="h-4 w-4 text-secondary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">
                Organizational memberships
              </p>
            </CardContent>
          </Card>
          
          <Card className="border-accent/20 bg-gradient-to-br from-card to-accent/5">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Achievements</CardTitle>
              <Trophy className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">
                Earned accomplishments
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Issue Token Section */}
        <Card className="mb-8 border-primary/20 bg-gradient-to-br from-card to-primary/5">
          <CardHeader>
            <div className="flex items-center gap-3">
              <img src={tokenMascot} alt="Token Mascot" className="h-12 w-12" />
              <div>
                <CardTitle>Issue Soulbound Token</CardTitle>
                <CardDescription>
                  Create non-transferable tokens for credentials, memberships, or achievements
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Button onClick={() => setIsIssueDialogOpen(true)} className="w-full sm:w-auto">
              <Plus className="mr-2 h-4 w-4" />
              Issue New Token
            </Button>
          </CardContent>
        </Card>

        {/* Tokens List */}
        <TokensList />
      </main>

      <IssueTokenDialog 
        open={isIssueDialogOpen} 
        onOpenChange={setIsIssueDialogOpen} 
      />
    </div>
  );
};

const Dashboard = () => {
  return (
    <AuthGuard>
      <DashboardContent />
    </AuthGuard>
  );
};

export default Dashboard;
