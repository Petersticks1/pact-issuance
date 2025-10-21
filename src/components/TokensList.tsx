import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Award, Users, Trophy, Calendar } from "lucide-react";
import { useAuth } from "./AuthGuard";

interface Token {
  id: string;
  token_type: string;
  title: string;
  description: string;
  recipient_address: string;
  created_at: string;
  is_revoked: boolean;
}

const tokenIcons = {
  credential: Award,
  membership: Users,
  achievement: Trophy,
};

const tokenColors = {
  credential: "bg-primary/10 text-primary border-primary/20",
  membership: "bg-secondary/10 text-secondary border-secondary/20",
  achievement: "bg-accent/10 text-accent border-accent/20",
};

export const TokensList = () => {
  const { user } = useAuth();
  const [tokens, setTokens] = useState<Token[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchTokens = async () => {
      const { data, error } = await supabase
        .from("soulbound_tokens")
        .select("*")
        .eq("issuer_id", user.id)
        .order("created_at", { ascending: false });

      if (!error && data) {
        setTokens(data);
      }
      setLoading(false);
    };

    fetchTokens();

    // Subscribe to real-time updates
    const channel = supabase
      .channel("soulbound_tokens_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "soulbound_tokens",
          filter: `issuer_id=eq.${user.id}`,
        },
        () => {
          fetchTokens();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    );
  }

  if (tokens.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <Award className="mb-4 h-12 w-12 text-muted-foreground/50" />
          <h3 className="mb-2 text-lg font-semibold">No tokens issued yet</h3>
          <p className="text-sm text-muted-foreground">
            Start by issuing your first Soulbound Token
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Issued Tokens</h2>
      <div className="grid gap-4 md:grid-cols-2">
        {tokens.map((token) => {
          const Icon = tokenIcons[token.token_type as keyof typeof tokenIcons];
          const colorClass = tokenColors[token.token_type as keyof typeof tokenColors];
          
          return (
            <Card key={token.id} className={`border ${colorClass}`}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`rounded-lg p-2 ${colorClass}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{token.title}</CardTitle>
                      <CardDescription className="capitalize">
                        {token.token_type}
                      </CardDescription>
                    </div>
                  </div>
                  {token.is_revoked && (
                    <Badge variant="destructive">Revoked</Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {token.description && (
                  <p className="text-sm text-muted-foreground">
                    {token.description}
                  </p>
                )}
                <div className="space-y-1 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <span className="font-medium">Recipient:</span>
                    <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
                      {token.recipient_address}
                    </code>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    <span>
                      {new Date(token.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
