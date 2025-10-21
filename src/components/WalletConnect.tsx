import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Wallet, CheckCircle2, ExternalLink } from "lucide-react";
import { toast } from "sonner";

export const WalletConnect = () => {
  const [accountId, setAccountId] = useState<string>("");
  const [inputValue, setInputValue] = useState<string>("");

  const handleConnect = () => {
    if (inputValue && inputValue.match(/^0\.0\.\d+$/)) {
      setAccountId(inputValue);
      toast.success(`Account ${inputValue} connected!`);
    } else {
      toast.error("Please enter a valid Hedera account ID (format: 0.0.xxxxx)");
    }
  };

  const handleDisconnect = () => {
    setAccountId("");
    setInputValue("");
    toast.info("Account disconnected");
  };

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-card to-primary/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet className="h-5 w-5" />
          Hedera Account
        </CardTitle>
        <CardDescription>
          Enter your Hedera account ID to issue tokens on the testnet
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!accountId ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="account-id">Hedera Account ID</Label>
              <Input
                id="account-id"
                placeholder="0.0.xxxxx"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="font-mono"
              />
            </div>
            <Button onClick={handleConnect} className="w-full">
              <Wallet className="mr-2 h-4 w-4" />
              Connect Account
            </Button>
            <div className="rounded-lg border border-border/50 bg-muted/50 p-3">
              <p className="mb-2 text-xs font-semibold">Need a testnet account?</p>
              <a
                href="https://portal.hedera.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs text-primary hover:underline"
              >
                Create one on Hedera Portal
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center gap-2 rounded-lg bg-primary/10 p-3">
              <CheckCircle2 className="h-5 w-5 text-primary" />
              <div className="flex-1">
                <p className="text-sm font-medium">Connected</p>
                <p className="text-xs text-muted-foreground font-mono">{accountId}</p>
              </div>
            </div>
            <Button 
              onClick={handleDisconnect}
              variant="outline"
              className="w-full"
            >
              Disconnect Account
            </Button>
          </div>
        )}
        <div className="mt-4 rounded-lg border border-secondary/20 bg-secondary/5 p-3">
          <p className="mb-1 text-xs font-semibold">Using HashPack wallet?</p>
          <a
            href="https://www.hashpack.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-xs text-secondary hover:underline"
          >
            Download HashPack extension
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </CardContent>
    </Card>
  );
};
