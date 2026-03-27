import { useState, useEffect } from "react";
import {
  Newspaper, ArrowRight, ExternalLink, RefreshCw,
  MapPin, Globe, Microscope, ChevronRight,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  fetchAgriNews, clearNewsCache, parseLocation,
  type NewsItem, type RelevanceLevel, type SourceType,
} from "@/services/newsService";
import { useAuth } from "@/contexts/AuthContext";

// ─── Styling maps ──────────────────────────────────────────────────────────────

const LEVEL_STYLE: Record<RelevanceLevel, { bg: string; text: string; label: string }> = {
  county:   { bg: "bg-amber-50 dark:bg-amber-950",   text: "text-amber-700 dark:text-amber-300",   label: "Local" },
  national: { bg: "bg-emerald-50 dark:bg-emerald-950", text: "text-emerald-700 dark:text-emerald-300", label: "National" },
  regional: { bg: "bg-sky-50 dark:bg-sky-950",       text: "text-sky-700 dark:text-sky-300",       label: "Regional" },
  global:   { bg: "bg-slate-100 dark:bg-slate-800",  text: "text-slate-600 dark:text-slate-300",   label: "Global" },
};

const SOURCE_ICON: Record<SourceType, typeof Globe> = {
  local: MapPin, national: MapPin,
  international: Globe, research: Microscope,
};

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const h = Math.floor(diff / 3_600_000);
  if (h < 1) return "Just now";
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d ago`;
  return new Date(iso).toLocaleDateString("en-KE", { month: "short", day: "numeric" });
}

// ─── Sub-components ───────────────────────────────────────────────────────────

const SkeletonCard = () => (
  <div className="harvest-card p-4 space-y-2 animate-pulse">
    <div className="flex gap-2">
      <div className="h-4 w-14 rounded-full bg-muted" />
      <div className="h-4 w-20 rounded-full bg-muted" />
    </div>
    <div className="h-4 w-full rounded bg-muted" />
    <div className="h-4 w-4/5 rounded bg-muted" />
    <div className="h-3 w-24 rounded bg-muted" />
  </div>
);

interface NewsCardProps { item: NewsItem; index: number }
const NewsCard = ({ item, index }: NewsCardProps) => {
  const level = LEVEL_STYLE[item.relevanceLevel];
  const Icon = SOURCE_ICON[item.sourceType];

  return (
    <motion.a
      key={item.id}
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      className="harvest-card block p-4 cursor-pointer transition-shadow hover:shadow-md group"
    >
      <div className="flex items-start gap-3">
        {item.imageUrl && (
          <img
            src={item.imageUrl}
            alt=""
            className="h-16 w-16 shrink-0 rounded-lg object-cover bg-muted"
            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
          />
        )}
        <div className="flex-1 min-w-0">
          {/* Badges */}
          <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
            {/* Relevance level badge */}
            <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${level.bg} ${level.text}`}>
              {item.relevanceLabel}
            </span>
            {/* Source badge */}
            <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">
              <Icon className="h-2.5 w-2.5" />
              {item.source}
            </span>
          </div>

          <h3 className="text-sm font-semibold text-foreground leading-snug group-hover:text-primary transition-colors line-clamp-2">
            {item.title}
          </h3>
          {item.summary && (
            <p className="mt-1 text-[11px] text-muted-foreground leading-relaxed line-clamp-2">
              {item.summary}
            </p>
          )}
          <div className="mt-1.5 flex items-center gap-1.5">
            <span className="text-[10px] text-muted-foreground">{timeAgo(item.publishedAt)}</span>
            <ExternalLink className="h-2.5 w-2.5 text-muted-foreground" />
          </div>
        </div>
      </div>
    </motion.a>
  );
};

// ─── Legend ───────────────────────────────────────────────────────────────────

const LegendDot = ({ level }: { level: RelevanceLevel }) => {
  const s = LEVEL_STYLE[level];
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${s.bg} ${s.text}`}>
      {s.label}
    </span>
  );
};

// ─── Main component ───────────────────────────────────────────────────────────

const AgriNews = () => {
  const { user } = useAuth();
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const rawLocation = user?.location ?? "";
  const loc = parseLocation(rawLocation);

  const load = async (forceRefresh = false) => {
    setLoading(true);
    setError(false);
    if (forceRefresh) clearNewsCache(rawLocation);
    try {
      setNews(await fetchAgriNews(rawLocation));
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [rawLocation]);

  const visible = expanded ? news : news.slice(0, 5);

  // Build location breadcrumb
  const breadcrumbs: string[] = [];
  if (loc.county)    breadcrumbs.push(loc.county + (loc.province ? `, ${loc.province}` : ""));
  if (loc.country)   breadcrumbs.push(loc.country);
  if (loc.subregion && loc.subregion !== loc.country) breadcrumbs.push(loc.subregion);

  const hasLocalNews = news.some(i => i.relevanceLevel === "county");
  const hasNationalNews = news.some(i => i.relevanceLevel === "national");

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>

      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-harvest-sky/10">
            <Newspaper className="h-4 w-4 text-harvest-sky" />
          </div>
          <h2 className="harvest-section-title">Agri News</h2>
        </div>
        <button
          onClick={() => load(true)}
          disabled={loading}
          title="Refresh news"
          className="rounded-full p-1.5 text-muted-foreground hover:bg-muted disabled:opacity-40"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Location breadcrumb */}
      {breadcrumbs.length > 0 && (
        <div className="mb-3 flex flex-wrap items-center gap-1 text-[11px] text-muted-foreground">
          <MapPin className="h-3 w-3 shrink-0" />
          {breadcrumbs.map((b, i) => (
            <span key={b} className="flex items-center gap-1">
              {i > 0 && <ChevronRight className="h-2.5 w-2.5" />}
              <span className="font-medium text-foreground">{b}</span>
            </span>
          ))}
          {!loading && (
            <span className="ml-1 text-muted-foreground">
              — personalised news
            </span>
          )}
        </div>
      )}

      {/* Relevance legend */}
      {!loading && news.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-1.5">
          {hasLocalNews && <LegendDot level="county" />}
          {hasNationalNews && <LegendDot level="national" />}
          {news.some(i => i.relevanceLevel === "regional") && <LegendDot level="regional" />}
          {news.some(i => i.relevanceLevel === "global") && <LegendDot level="global" />}
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="space-y-3">
          {[0, 1, 2, 3].map(i => <SkeletonCard key={i} />)}
        </div>
      ) : error && news.length === 0 ? (
        <div className="harvest-card p-6 text-center">
          <Newspaper className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground">Could not load news.</p>
          <button onClick={() => load()} className="mt-3 text-xs font-medium text-primary">Try again</button>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            <AnimatePresence>
              {visible.map((item, i) => <NewsCard key={item.id} item={item} index={i} />)}
            </AnimatePresence>
          </div>

          {news.length > 5 && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="mt-3 flex w-full items-center justify-center gap-1 rounded-xl border bg-card py-2.5 text-xs font-medium text-muted-foreground hover:bg-muted transition-colors"
            >
              {expanded ? "Show less" : `Show ${news.length - 5} more articles`}
              <ArrowRight className={`h-3 w-3 transition-transform ${expanded ? "rotate-90" : ""}`} />
            </button>
          )}

          <p className="mt-2 text-center text-[10px] text-muted-foreground">
            Sources: The Guardian · FAO · CIMMYT
            {loc.country && ` · ${loc.country} national sources`}
            {" "}· Refreshes every 30 min
          </p>
        </>
      )}
    </motion.div>
  );
};

export default AgriNews;
