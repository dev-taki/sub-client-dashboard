// Square OAuth Token Exchange
// This function exchanges the authorization code for access and refresh tokens

interface SquareTokenResponse {
  access_token: string;
  token_type: string;
  expires_at: string;
  merchant_id: string;
  refresh_token?: string;
  short_lived_access_token?: string;
}

interface SquareTokenRequest {
  client_id: string;
  client_secret: string;
  code: string;
  grant_type: 'authorization_code';
}

export async function exchangeCodeForTokens(
  authorizationCode: string,
  clientId: string,
  clientSecret: string
): Promise<SquareTokenResponse> {
  const tokenUrl = 'https://connect.squareup.com/oauth2/token';
  
  const requestBody: SquareTokenRequest = {
    client_id: clientId,
    client_secret: clientSecret,
    code: authorizationCode,
    grant_type: 'authorization_code'
  };

  try {
    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Square-Version': '2023-10-18' // Use latest Square API version
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Token exchange failed: ${response.status} ${response.statusText} - ${JSON.stringify(errorData)}`);
    }

    const tokenData: SquareTokenResponse = await response.json();
    return tokenData;
  } catch (error) {
    console.error('Error exchanging code for tokens:', error);
    throw error;
  }
}

// Example usage:
// const tokens = await exchangeCodeForTokens(
//   'sq0cgp-G4xq2LIafory8Kx7hFnYOQ',
//   'sq0idp-kMtm2Q79PLnqxFMcwlTmcg',
//   'YOUR_CLIENT_SECRET'
// );
