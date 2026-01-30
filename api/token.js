export default function handler(req, res) {
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

  const accessToken = cookies['spotify_access_token'];

  if (!accessToken) {
    return res.status(401).json({ error: 'No access token found' });
  }

  // Retorna o token para o frontend usar no player
  res.status(200).json({ access_token: accessToken });
}
