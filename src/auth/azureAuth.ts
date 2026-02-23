import { ConfidentialClientApplication } from "@azure/msal-node";

let msalClient: ConfidentialClientApplication | null = null;
let cachedToken: { token: string; expiresAt: number } | null = null;

function getMsalClient(): ConfidentialClientApplication {
  if (!msalClient) {
    const tenantId = process.env.AZURE_TENANT_ID;
    const clientId = process.env.AZURE_CLIENT_ID;
    const clientSecret = process.env.AZURE_CLIENT_SECRET;

    if (!tenantId || !clientId || !clientSecret) {
      throw new Error(
        "Missing Azure credentials. Set AZURE_TENANT_ID, AZURE_CLIENT_ID, and AZURE_CLIENT_SECRET."
      );
    }

    msalClient = new ConfidentialClientApplication({
      auth: {
        clientId,
        clientSecret,
        authority: `https://login.microsoftonline.com/${tenantId}`,
      },
    });
  }
  return msalClient;
}

/**
 * Acquire a token for the AFKBot API using client credential flow.
 * The scope is the AFKBot Easy Auth client ID with /.default suffix.
 */
export async function getAccessToken(): Promise<string> {
  // Return cached token if still valid (with 5min buffer)
  if (cachedToken && cachedToken.expiresAt > Date.now() + 5 * 60 * 1000) {
    return cachedToken.token;
  }

  const afkbotClientId =
    process.env.AFKBOT_APP_CLIENT_ID || "17963178-bee5-4738-82a3-088e739bb95b";

  const client = getMsalClient();
  const result = await client.acquireTokenByClientCredential({
    scopes: [`api://${afkbotClientId}/.default`],
  });

  if (!result || !result.accessToken) {
    throw new Error("Failed to acquire access token for AFKBot API");
  }

  cachedToken = {
    token: result.accessToken,
    expiresAt: result.expiresOn
      ? result.expiresOn.getTime()
      : Date.now() + 3600 * 1000,
  };

  return cachedToken.token;
}
