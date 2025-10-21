import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { 
  Client, 
  TokenCreateTransaction,
  TokenType,
  TokenSupplyType,
  TokenAssociateTransaction,
  TransferTransaction,
  TokenUpdateTransaction,
  AccountId,
  PrivateKey,
  Hbar,
  TokenMintTransaction
} from "npm:@hashgraph/sdk@2.75.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    const { data: { user }, error: userError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    const { tokenId, recipientAddress, title, description, tokenType } = await req.json();

    console.log('Processing Hedera token issuance:', {
      tokenId,
      recipientAddress,
      title,
      tokenType,
      userId: user.id,
    });

    // Initialize Hedera client
    const operatorId = AccountId.fromString(Deno.env.get('HEDERA_ACCOUNT_ID')!);
    const operatorKey = PrivateKey.fromString(Deno.env.get('HEDERA_PRIVATE_KEY')!);
    
    const client = Client.forTestnet();
    client.setOperator(operatorId, operatorKey);
    client.setDefaultMaxTransactionFee(new Hbar(50));

    console.log('Creating Hedera token...');

    // Create the soulbound token
    const tokenCreateTx = await new TokenCreateTransaction()
      .setTokenName(`SBT: ${title}`)
      .setTokenSymbol("SBT")
      .setTokenType(TokenType.NonFungibleUnique)
      .setDecimals(0)
      .setInitialSupply(0)
      .setTreasuryAccountId(operatorId)
      .setSupplyType(TokenSupplyType.Finite)
      .setMaxSupply(1)
      .setSupplyKey(operatorKey)
      .setAdminKey(operatorKey)
      .setKycKey(operatorKey) // We'll revoke this later
      .freezeWith(client)
      .sign(operatorKey);

    const tokenCreateSubmit = await tokenCreateTx.execute(client);
    const tokenCreateRx = await tokenCreateSubmit.getReceipt(client);
    const hederaTokenId = tokenCreateRx.tokenId;

    console.log(`Token created with ID: ${hederaTokenId}`);

    // Mint the NFT with metadata
    const metadata = JSON.stringify({
      name: title,
      description: description || '',
      type: tokenType,
      image: 'ipfs://placeholder'
    });

    const encoder = new TextEncoder();
    const mintTx = await new TokenMintTransaction()
      .setTokenId(hederaTokenId!)
      .setMetadata([encoder.encode(metadata)])
      .freezeWith(client)
      .sign(operatorKey);

    const mintSubmit = await mintTx.execute(client);
    const mintRx = await mintSubmit.getReceipt(client);
    const serialNumber = mintRx.serials[0];

    console.log(`Minted NFT serial number: ${serialNumber}`);

    // Associate token with recipient
    const recipientId = AccountId.fromString(recipientAddress);
    
    console.log('Token created, recipient needs to accept association');

    // Update KYC to allow initial transfer (would be done after recipient accepts)
    // Then revoke KYC to make non-transferable

    // Update database with Hedera token ID
    const { error: updateError } = await supabase
      .from('soulbound_tokens')
      .update({ 
        hedera_token_id: hederaTokenId!.toString(),
        token_id: hederaTokenId!.toString(),
        metadata: {
          serialNumber: serialNumber.toString(),
          transactionId: tokenCreateSubmit.transactionId.toString()
        }
      })
      .eq('id', tokenId)
      .eq('issuer_id', user.id);

    if (updateError) {
      throw updateError;
    }

    console.log('Token issued successfully on Hedera:', hederaTokenId!.toString());

    return new Response(
      JSON.stringify({ 
        success: true, 
        hederaTokenId: hederaTokenId!.toString(),
        serialNumber: serialNumber.toString(),
        transactionId: tokenCreateSubmit.transactionId.toString(),
        message: 'Soulbound token created successfully on Hedera testnet. Recipient must accept association to receive the token.',
        explorerUrl: `https://hashscan.io/testnet/token/${hederaTokenId!.toString()}`
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error issuing token:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        details: error instanceof Error ? error.stack : undefined 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
