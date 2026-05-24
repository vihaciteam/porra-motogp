import { createClient } from "@/utils/supabase/server";

interface NewsItem {
  title: string;
  link: string;
  pubDate: string;
  source: string;
}

interface Podcast {
  id: string;
  titulo: string;
  url: string;
}

function getYouTubeId(url: string): string | null {
  const patterns = [
    /youtube\.com\/watch\?v=([^&\n?#]+)/,
    /youtu\.be\/([^&\n?#]+)/,
    /youtube\.com\/embed\/([^&\n?#]+)/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

async function fetchMotoGPNews(): Promise<NewsItem[]> {
  try {
    const res = await fetch(
      "https://news.google.com/rss/search?q=MotoGP&hl=es&gl=ES&ceid=ES:es",
      { next: { revalidate: 1800 } }
    );
    if (!res.ok) return [];
    const xml = await res.text();

    const items: NewsItem[] = [];
    const itemRegex = /<item>([\s\S]*?)<\/item>/g;
    let match;

    while ((match = itemRegex.exec(xml)) !== null && items.length < 12) {
      const item = match[1];
      const title = item.match(/<title>([\s\S]*?)<\/title>/)?.[1]
        ?.replace(/<!\[CDATA\[|\]\]>/g, "").trim() ?? "";
      const link = item.match(/<link>([\s\S]*?)<\/link>/)?.[1]?.trim() ?? "";
      const pubDate = item.match(/<pubDate>([\s\S]*?)<\/pubDate>/)?.[1]?.trim() ?? "";
      const source = item.match(/<source[^>]*>([\s\S]*?)<\/source>/)?.[1]
        ?.replace(/<!\[CDATA\[|\]\]>/g, "").trim() ?? "";

      if (title && link) items.push({ title, link, pubDate, source });
    }

    return items;
  } catch {
    return [];
  }
}

function formatDate(pubDate: string): string {
  try {
    return new Date(pubDate).toLocaleDateString("es-ES", {
      day: "numeric", month: "short", year: "numeric",
    });
  } catch {
    return "";
  }
}

export default async function NoticiasPage() {
  const supabase = await createClient();
  const { data: podcasts } = await supabase
    .from("podcasts")
    .select("*")
    .order("created_at", { ascending: false });

  const news = await fetchMotoGPNews();

  return (
    <div className="flex flex-col flex-1 max-w-3xl mx-auto w-full">

      <div className="bg-black text-white px-4 py-8 sm:px-6">
        <span className="text-red-500 text-xs font-black uppercase tracking-[0.25em]">Actualidad</span>
        <h1 className="text-3xl sm:text-4xl font-black mt-1">Noticias y Podcast</h1>
        <p className="text-zinc-500 text-sm mt-1">Noticias en tiempo real · Podcast de la porra</p>
      </div>

      <div className="px-4 sm:px-6 py-6 flex flex-col gap-8">
      {/* ── Podcasts ── */}
      {podcasts && podcasts.length > 0 && (
        <section className="flex flex-col gap-4">
          <h2 className="text-xl font-black text-black">🎙️ Podcast</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {(podcasts as Podcast[]).map((p) => {
              const videoId = getYouTubeId(p.url);
              if (!videoId) return null;
              return (
                <a
                  key={p.id}
                  href={p.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group rounded-2xl overflow-hidden border-2 border-zinc-100 hover:border-red-400 transition-colors"
                >
                  <div className="relative aspect-video bg-zinc-100">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`}
                      alt={p.titulo}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="bg-red-600 rounded-full w-14 h-14 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                        <span className="text-white text-xl ml-1">▶</span>
                      </div>
                    </div>
                  </div>
                  <div className="px-4 py-3 bg-white">
                    <p className="font-bold text-black text-sm leading-tight line-clamp-2">{p.titulo}</p>
                    <p className="text-xs text-red-600 font-medium mt-1">Ver en YouTube →</p>
                  </div>
                </a>
              );
            })}
          </div>
        </section>
      )}

      {/* ── Noticias ── */}
      <section className="flex flex-col gap-4">
        <h2 className="text-xl font-black text-black">📰 Últimas noticias</h2>
        {news.length === 0 ? (
          <p className="text-zinc-400 text-sm text-center py-8">
            No se pudieron cargar las noticias en este momento.
          </p>
        ) : (
          <div className="flex flex-col divide-y divide-zinc-100">
            {news.map((item, i) => (
              <a
                key={i}
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                className="py-4 flex flex-col gap-1 hover:bg-zinc-50 rounded-xl px-3 transition-colors group"
              >
                <p className="font-semibold text-black text-sm leading-snug group-hover:text-red-600 transition-colors">
                  {item.title}
                </p>
                <div className="flex items-center gap-2 text-xs text-zinc-400">
                  {item.source && <span>{item.source}</span>}
                  {item.source && item.pubDate && <span>·</span>}
                  {item.pubDate && <span>{formatDate(item.pubDate)}</span>}
                </div>
              </a>
            ))}
          </div>
        )}
        <p className="text-xs text-zinc-300 text-center pb-4">
          Noticias actualizadas automáticamente · Google News MotoGP
        </p>
      </section>
      </div>

    </div>
  );
}
