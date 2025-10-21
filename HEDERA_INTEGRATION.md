# Hedera Soulbound Token Integration Guide

This application provides a framework for issuing Soulbound Tokens (SBTs) on the Hedera network. SBTs are non-transferable tokens that represent credentials, memberships, or achievements.

## What are Soulbound Tokens?

Soulbound Tokens are a special type of NFT that cannot be transferred once issued. They are permanently bound to the recipient's wallet address, making them ideal for:

- **Credentials**: Educational degrees, professional certifications
- **Memberships**: Organizational affiliations, club memberships
- **Achievements**: Awards, badges, accomplishments

## How It Works

### 1. Token Creation
When a user issues a token through the portal:
1. The token metadata is stored in the database
2. A Hedera token is created using `TokenCreateTransaction`
3. The token is associated with the recipient using `TokenAssociateTransaction`

### 2. Making Tokens Non-Transferable
To make a token truly "soulbound" (non-transferable), the implementation uses:

```javascript
// After token transfer to recipient
await new TokenUpdateTransaction()
  .setTokenId(tokenId)
  .setKycKey(null) // Remove KYC authority
  .execute(client);
```

By revoking the KYC grant permanently, the token becomes non-transferable as per Hedera documentation.

## Integration Steps

### Prerequisites
1. Hedera testnet/mainnet account
2. Account ID and private key
3. Sufficient HBAR for transactions

### Environment Setup
Add the following secrets to your Lovable Cloud backend:

```bash
HEDERA_ACCOUNT_ID=0.0.xxxxx
HEDERA_PRIVATE_KEY=your_private_key_here
HEDERA_NETWORK=testnet  # or mainnet
```

### Code Implementation

The edge function `issue-hedera-token` is already set up. To complete the integration:

1. **Install Hedera SDK** (already added):
   ```bash
   npm install @hashgraph/sdk
   ```

2. **Update the edge function** with actual Hedera logic:

```typescript
import { 
  Client, 
  TokenCreateTransaction,
  TokenType,
  TokenSupplyType,
  TokenAssociateTransaction,
  TransferTransaction,
  TokenUpdateTransaction,
  AccountId,
  PrivateKey
} from "https://esm.sh/@hashgraph/sdk@2";

// Initialize Hedera client
const operatorId = AccountId.fromString(Deno.env.get('HEDERA_ACCOUNT_ID'));
const operatorKey = PrivateKey.fromString(Deno.env.get('HEDERA_PRIVATE_KEY'));
const network = Deno.env.get('HEDERA_NETWORK') || 'testnet';

const client = network === 'mainnet' 
  ? Client.forMainnet() 
  : Client.forTestnet();
  
client.setOperator(operatorId, operatorKey);

// Create token
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
  .setKycKey(operatorKey)
  .execute(client);

const tokenId = (await tokenCreateTx.getReceipt(client)).tokenId;

// Associate token with recipient
const associateTx = await new TokenAssociateTransaction()
  .setAccountId(recipientAccountId)
  .setTokenIds([tokenId])
  .execute(client);

// Transfer token to recipient
const transferTx = await new TransferTransaction()
  .addNftTransfer(tokenId, 1, operatorId, recipientAccountId)
  .execute(client);

// Make token non-transferable by revoking KYC
await new TokenUpdateTransaction()
  .setTokenId(tokenId)
  .setKycKey(null)
  .execute(client);
```

## Database Schema

The application uses the following tables:

### profiles
- `id`: UUID (references auth.users)
- `email`: Text
- `full_name`: Text
- `created_at`: Timestamp
- `updated_at`: Timestamp

### soulbound_tokens
- `id`: UUID (primary key)
- `issuer_id`: UUID (references profiles)
- `recipient_address`: Text (Hedera account ID)
- `token_type`: Enum (credential, membership, achievement)
- `title`: Text
- `description`: Text
- `metadata`: JSONB
- `hedera_token_id`: Text (Hedera token ID)
- `is_revoked`: Boolean
- `created_at`: Timestamp
- `updated_at`: Timestamp

## Security Considerations

1. **Private Keys**: Never expose private keys in client-side code
2. **RLS Policies**: All tables have Row-Level Security enabled
3. **Authentication**: Users can only manage their own tokens
4. **Validation**: Input validation on both client and server

## Testing

1. Create an account on the portal
2. Issue a test token using a testnet account ID
3. Verify the token in Hedera explorer
4. Confirm token is non-transferable

## Resources

- [Hedera Documentation](https://docs.hedera.com)
- [Hedera SDK GitHub](https://github.com/hashgraph/hedera-sdk-js)
- [Soulbound Token Concept](https://vitalik.ca/general/2022/01/26/soulbound.html)

## Support

For issues or questions, please refer to:
- Hedera Discord: https://hedera.com/discord
- Documentation: https://docs.hedera.com
