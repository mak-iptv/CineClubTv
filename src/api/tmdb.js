const API_KEY = 'dc375cc5d8355f3483fe6fa990736b0e';
const BASE_URL = 'https://api.themoviedb.org/3';

export const fetchTMDB = async (endpoint, lang = 'sr') => {
  const separator = endpoint.includes('?') ? '&' : '?';
  const langCode = lang === 'sr' ? 'sr-RS' : lang === 'sq' ? 'sq-AL' : 'en-US';
  const url = `${BASE_URL}${endpoint}${separator}api_key=${API_KEY}&language=${langCode}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP error ${res.status}`);
  return res.json();
};

export const getImageUrl = (path, size = 'w500') => {
  if (!path) return 'https://via.placeholder.com/200x300/1f2937/6b7280?text=No+Image';
  return `https://image.tmdb.org/t/p/${size}${path}`;
};

export const VIDEO_SOURCES = {
  embedSu: {
    name: { sr: "Embed.su", sq: "Embed.su", en: "Embed.su" },
    movieUrl: "https://vidsrc-embed.ru/embed/movie/{id}",
    tvUrl: "https://vidsrc-embed.ru/embed/tv/{id}/{season}/{episode}"
  },
  twoEmbed: {
    name: { sr: "2Embed", sq: "2Embed", en: "2Embed" },
    movieUrl: "https://www.2embed.cc/embed/{id}",
    tvUrl: "https://www.2embed.cc/embedtv/{id}/{season}/{episode}"
  },
  vidsrcTo: {
    name: { sr: "Server 1", sq: "Serveri 1", en: "Server 1" },
    movieUrl: "https://vidsrc.to/embed/movie/{id}",
    tvUrl: "https://vidsrc.to/embed/tv/{id}"
  },
   vidsrcTo: {
    name: { sr: "Server 4", sq: "Serveri 4", en: "Server 4" },
    movieUrl: "https://vidsrc.in/embed/movie/{id}",
    tvUrl: "https://vidsrc.in/embed/tv/{id}"
  },
  superembed: {
    name: { sr: "Server 3 (SE)", sq: "Serveri 3 (SE)", en: "Server 3 (SE)" },
    movieUrl: "https://radio-malaprespa.duckdns.org/CineClub/se_player.php?video_id={id}&tmdb=1",
    tvUrl: "https://radio-malaprespa.duckdns.org/CineClub/se_player.php?video_id={id}&tmdb=1&season={season}&episode={episode}"
  }
};
