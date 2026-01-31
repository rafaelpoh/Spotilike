// api/refresh_token.js
import querystring from 'querystring';

export default async function handler(req, res) {
  const { SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET } = process.env;

  const cookieHeader = req.headers.cookie;

  if (!cookieHeader) {
    return res.status(401).json({ error: 'No cookies found' });
  }

  // Lê os cookies para encontrar o token
  const cookies = Object.fromEntries(
    cookieHeader.split('; ').map(c => {
      const [key, ...v] = c.split('=');
      return [key, v.join('=')];
    })
  );

  const refreshToken = cookies['spotify_refresh_token'];

  if (!refreshToken) {
    return res.status(401).json({ error: 'Refresh token not found.' });
  }

  const authOptions = {
    method: 'POST',
    headers: {
      'Authorization': 'Basic ' + (Buffer.from(SPOTIFY_CLIENT_ID + ':' + SPOTIFY_CLIENT_SECRET).toString('base64')),
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: querystring.stringify({
      grant_type: 'refresh_token',
      refresh_token: refreshToken
    })
  };

  try {
    const response = await fetch('https://accounts.spotify.com/api/token', authOptions);
    const data = await response.json();

    if (response.ok) {
      const { access_token, expires_in } = data;

      // Define o novo access_token em um cookie HttpOnly
      res.setHeader('Set-Cookie', `spotify_access_token=${access_token}; HttpOnly; Path=/; Max-Age=${expires_in}`);
      
      // Envia o novo token de volta para o cliente que solicitou
      res.status(200).json({ access_token });
    } else {
      console.error('Spotify Refresh Error:', data);
      res.status(response.status).json({ error: 'Failed to refresh token from Spotify', details: data });
    }
  } catch (error) {
    console.error('Internal Server Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
