// api/callback.js
import querystring from "querystring";

/**
 * Este endpoint é chamado pelo Spotify após o usuário autorizar o aplicativo.
 * Ele recebe um 'code', que é trocado por um 'access_token' e um 'refresh_token'.
 * Os tokens são armazenados em cookies seguros (HttpOnly) e o usuário é
 * redirecionado de volta para a página inicial.
 */
export default async function handler(req, res) {
  const { code } = req.query || null;

  if (!code) {
    return res.status(400).json({ error: "Code not found in query" });
  }

  const { SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET, VERCEL_URL } = process.env;

  const REDIRECT_URI = VERCEL_URL
    ? `https://spotilike.vercel.app/api/callback`
    : "http://localhost:3000/api/callback";

  const authOptions = {
    method: "POST",
    headers: {
      Authorization:
        "Basic " +
        Buffer.from(SPOTIFY_CLIENT_ID + ":" + SPOTIFY_CLIENT_SECRET).toString(
          "base64",
        ),
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: querystring.stringify({
      grant_type: "authorization_code",
      code: code,
      redirect_uri: REDIRECT_URI,
    }),
  };

  try {
    const response = await fetch(
      "https://accounts.spotify.com/api/token",
      authOptions,
    );
    const data = await response.json();

    if (response.ok) {
      const { access_token, refresh_token, expires_in } = data;

      // Armazena os tokens em cookies HttpOnly para segurança.
      // O frontend não poderá acessá-los diretamente, mas o navegador
      // os enviará em futuras requisições para nossa API.
      res.setHeader("Set-Cookie", [
        `spotify_access_token=${access_token}; HttpOnly; Path=/; Max-Age=${expires_in}`,
        // O refresh token geralmente tem uma validade longa.
        `spotify_refresh_token=${refresh_token}; HttpOnly; Path=/; Max-Age=31536000`, // 1 ano
      ]);

      // Redireciona o usuário para a página inicial da aplicação.
      res.redirect("/");
    } else {
      console.error("Spotify API Error:", data);
      res
        .status(response.status)
        .json({ error: "Failed to get tokens from Spotify", details: data });
    }
  } catch (error) {
    console.error("Internal Server Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
