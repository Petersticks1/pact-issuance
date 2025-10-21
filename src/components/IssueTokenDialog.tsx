import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { useAuth } from "./AuthGuard";

interface IssueTokenDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const IssueTokenDialog = ({ open, onOpenChange }: IssueTokenDialogProps) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    tokenType: "credential",
    title: "",
    description: "",
    recipientAddress: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      // First, insert the token record
      const { data: tokenData, error: insertError } = await supabase
        .from("soulbound_tokens")
        .insert({
          issuer_id: user.id,
          token_type: formData.tokenType,
          title: formData.title,
          description: formData.description,
          recipient_address: formData.recipientAddress,
        })
        .select()
        .single();

      if (insertError) throw insertError;

      // Call edge function to issue on Hedera
      const { data: hederaData, error: hederaError } = await supabase.functions.invoke(
        'issue-hedera-token',
        {
          body: {
            tokenId: tokenData.id,
            recipientAddress: formData.recipientAddress,
            title: formData.title,
            description: formData.description,
            tokenType: formData.tokenType,
          }
        }
      );

      if (hederaError) throw hederaError;

      toast.success(
        <div className="space-y-1">
          <p className="font-semibold">Token issued on Hedera!</p>
          <p className="text-xs">{hederaData.message}</p>
          {hederaData.explorerUrl && (
            <a 
              href={hederaData.explorerUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-xs underline"
            >
              View on HashScan
            </a>
          )}
        </div>
      );
      
      onOpenChange(false);
      setFormData({
        tokenType: "credential",
        title: "",
        description: "",
        recipientAddress: "",
      });
    } catch (error: any) {
      console.error('Token issuance error:', error);
      toast.error(error.message || "Failed to issue token");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Issue Soulbound Token</DialogTitle>
          <DialogDescription>
            Create a non-transferable token on the Hedera network
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="token-type">Token Type</Label>
            <Select
              value={formData.tokenType}
              onValueChange={(value) => setFormData({ ...formData, tokenType: value })}
            >
              <SelectTrigger id="token-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="credential">Credential</SelectItem>
                <SelectItem value="membership">Membership</SelectItem>
                <SelectItem value="achievement">Achievement</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              placeholder="e.g., Blockchain Developer Certificate"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe the token purpose..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="recipient">Recipient Address</Label>
            <Input
              id="recipient"
              placeholder="0.0.xxxxx (Hedera Account ID)"
              value={formData.recipientAddress}
              onChange={(e) => setFormData({ ...formData, recipientAddress: e.target.value })}
              required
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Issuing..." : "Issue Token"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
