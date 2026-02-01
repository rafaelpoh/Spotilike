// api/login.js
import querystring from "querystring";

/**
 * Este endpoint redireciona o usuário para a página de autorização do Spotify.
 * As credenciais (SPOTIFY_CLIENT_ID) são obtidas das variáveis de ambiente,
 * que devem ser configuradas no Vercel.
 */
export default function handler(req, res) {
  const { SPOTIFY_CLIENT_ID } = process.env;

  const host = req.headers.host;
  // On Vercel, `x-forwarded-proto` is 'https'. Locally, it's undefined, so we default to 'http'.
  const protocol = req.headers["x-forwarded-proto"] ? "https" : "http";
  const REDIRECT_URI = `https://spotilike.vercel.app/api/callback`;

  // O 'scope' define as permissões que estamos solicitando ao usuário.
  const scope =
    "streaming user-read-email user-read-private user-read-playback-state user-modify-playback-state";

  const params = querystring.stringify({
    response_type: "code",
    client_id: SPOTIFY_CLIENT_ID,
    scope: scope,
    redirect_uri: REDIRECT_URI,
  });

  res.redirect(`https://accounts.spotify.com/authorize?${params}`);
}
