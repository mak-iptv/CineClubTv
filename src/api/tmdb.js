// ============================================================
//  tmdb.js  –  Целосен модул за комуникација со TMDb API
// ============================================================

// -----------------------------------------------------------------
// 1. Конфигурација – API клучот се чита од околина (безбедно)
// -----------------------------------------------------------------
const TMDB_CONFIG = {
  // Во Next.js: process.env.NEXT_PUBLIC_TMDB_API_KEY
  // Во Vite: import.meta.env.VITE_TMDB_API_KEY
  // Овде користиме process.env за пример, но можеш да го замениш
  // со кој било начин за читање на env променливи.
  API_KEY: process.env.TMDB_API_KEY || 'dc375cc5d8355f3483fe6fa990736b0e', // само за развој, никогаш во продукција!
  BASE_URL: 'https://api.themoviedb.org/3',
  IMAGE_BASE: 'https://image.tmdb.org/t/p/',
  LANG_MAP: {
    sr: 'sr-RS',
    sq: 'sq-AL',
    en: 'en-US',
    // додај повеќе јазици по потреба
  },
  // Локален placeholder за слики (Data URI) – избегнува надворешен повик
  PLACEHOLDER_IMAGE: 'data:image/svg+xml;charset=UTF-8,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="300" viewBox="0 0 200 300"%3E%3Crect width="200" height="300" fill="%231f2937"/%3E%3Ctext x="50%25" y="50%25" font-family="sans-serif" font-size="16" fill="%236b7280" text-anchor="middle" dy=".3em"%3ENo Image%3C/text%3E%3C/svg%3E',
};

// -----------------------------------------------------------------
// 2. Функција за повик кон TMDb API
// -----------------------------------------------------------------
export const fetchTMDB = async (endpoint, lang = 'sr') => {
  const langCode = TMDB_CONFIG.LANG_MAP[lang] || 'en-US';
  const separator = endpoint.includes('?') ? '&' : '?';
  const url = `${TMDB_CONFIG.BASE_URL}${endpoint}${separator}api_key=${TMDB_CONFIG.API_KEY}&language=${langCode}`;

  try {
    const res = await fetch(url);
    if (!res.ok) {
      // Обиди се да го прочиташ статусот и пораката од TMDb
      let errorMessage = `HTTP error ${res.status}`;
      try {
        const errorData = await res.json();
        if (errorData.status_message) {
          errorMessage = `${errorMessage}: ${errorData.status_message}`;
        }
      } catch (_) {
        // ако одговорот не е JSON, игнорирај
      }
      throw new Error(errorMessage);
    }
    return await res.json();
  } catch (error) {
    // Додади повторен обид или логирање по желба
    console.error('fetchTMDB грешка:', error);
    throw error;
  }
};

// -----------------------------------------------------------------
// 3. Функција за генерирање на URL на слика
// -----------------------------------------------------------------
export const getImageUrl = (path, size = 'w500') => {
  if (!path) return TMDB_CONFIG.PLACEHOLDER_IMAGE;
  return `${TMDB_CONFIG.IMAGE_BASE}${size}${path}`;
};

// -----------------------------------------------------------------
// 4. Конфигурација на извори за видео (со поддршка за сезона/епизода)
// -----------------------------------------------------------------
export const VIDEO_SOURCES = {
  embedSu: {
    name: { sr: 'Embed.su', sq: 'Embed.su', en: 'Embed.su' },
    movieUrl: 'https://vidsrc-embed.ru/embed/movie/{id}',
    tvUrl: 'https://vidsrc-embed.ru/embed/tv/{id}/{season}/{episode}',
    supportsSeason: true,
  },
  twoEmbed: {
    name: { sr: '2Embed', sq: '2Embed', en: '2Embed' },
    movieUrl: 'https://www.2embed.cc/embed/{id}',
    tvUrl: 'https://www.2embed.cc/embedtv/{id}/{season}/{episode}',
    supportsSeason: true,
  },
  vidsrcTo: {
    name: { sr: 'Server 1', sq: 'Serveri 1', en: 'Server 1' },
    movieUrl: 'https://vidsrc.to/embed/movie/{id}',
    tvUrl: 'https://vidsrc.to/embed/tv/{id}',
    supportsSeason: false, // не поддржува сезона/епизода во шаблонот
  },
  vidsrcin: {
    name: { sr: 'Server 4', sq: 'Serveri 4', en: 'Server 4' },
    movieUrl: 'https://vidsrc.in/embed/movie/{id}',
    tvUrl: 'https://vidsrc.in/embed/tv/{id}',
    supportsSeason: false,
  },
  vidfastvc: {
    name: { sr: 'Server 5', sq: 'Serveri 5', en: 'Server 5' },
    movieUrl: 'https://vidfast.vc/movie/{id}',
    tvUrl: 'https://vidfast.vc/tv/{id}',
    supportsSeason: false,
  },
  superembed: {
    name: { sr: 'Server 3 (SE)', sq: 'Serveri 3 (SE)', en: 'Server 3 (SE)' },
    movieUrl: 'https://radio-malaprespa.duckdns.org/CineClub/se_player.php?video_id={id}&tmdb=1',
    tvUrl: 'https://radio-malaprespa.duckdns.org/CineClub/se_player.php?video_id={id}&tmdb=1&season={season}&episode={episode}',
    supportsSeason: true,
  },
};

// -----------------------------------------------------------------
// 5. Помошна функција за генерирање на видео URL
// -----------------------------------------------------------------
export const getVideoUrl = (sourceKey, mediaType, id, season, episode) => {
  const source = VIDEO_SOURCES[sourceKey];
  if (!source) {
    console.warn(`Непознат извор: ${sourceKey}`);
    return null;
  }

  const template = mediaType === 'movie' ? source.movieUrl : source.tvUrl;
  if (!template) {
    console.warn(`Недостасува шаблон за ${mediaType} кај изворот ${sourceKey}`);
    return null;
  }

  // Замени {id} – секогаш се заменува
  let url = template.replace(/{id}/g, id);

  // Ако изворот поддржува сезона/епизода, замени ги, инаку отстрани ги
  if (source.supportsSeason) {
    url = url.replace(/{season}/g, season || 1);
    url = url.replace(/{episode}/g, episode || 1);
  } else {
    // Отстрани ги непотребните placeholders за да не останат во URL
    url = url.replace(/{season}/g, '').replace(/{episode}/g, '');
    // Дополнително: ако имаш случаи каде '&season=' останува, може да се исчисти
    // но ова е доволно за повеќето шаблони.
  }

  return url;
};

// -----------------------------------------------------------------
// 6. (Опционално) Функција за добивање на превод на име на извор
// -----------------------------------------------------------------
export const getSourceName = (sourceKey, lang = 'sr') => {
  const source = VIDEO_SOURCES[sourceKey];
  if (!source) return sourceKey;
  return source.name[lang] || source.name.en || sourceKey;
};

// -----------------------------------------------------------------
// 7. Пример за употреба (може да се избрише)
// -----------------------------------------------------------------
/*
// Пример за филм
const movieData = await fetchTMDB('/movie/550');
console.log(movieData.title);

// Пример за видео URL за ТВ серија
const videoUrl = getVideoUrl('embedSu', 'tv', 1399, 1, 1);
console.log(videoUrl);
// => https://vidsrc-embed.ru/embed/tv/1399/1/1
*/
