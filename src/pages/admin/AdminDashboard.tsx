import { useState, useEffect } from 'react';
import { Eye, EyeOff, TrendingUp, Search, Bell, FileText, Send, MousePointerClick, Flame } from 'lucide-react';
import { authFetch } from '../../lib/auth';

const DAYS = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];

export default function AdminDashboard() {
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    authFetch('/api/stats/overview')
      .then(res => res.ok ? res.json() : Promise.reject())
      .then(setData)
      .catch(() => setError('Impossible de charger les statistiques.'));
  }, []);

  if (error) return <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-red-700">{error}</div>;
  if (!data) return <div>Chargement des statistiques...</div>;

  const kpis = [
    { label: 'Visites aujourd\'hui', value: (data.today || 0).toLocaleString('fr-FR'), icon: Eye, color: 'bg-brand-red' },
    { label: 'Visites 7 jours', value: (data.week || 0).toLocaleString('fr-FR'), icon: TrendingUp, color: 'bg-blue-600' },
    { label: 'Visites 30 jours', value: (data.month || 0).toLocaleString('fr-FR'), icon: EyeOff, color: 'bg-brand-green' },
    { label: 'Visites totales', value: (data.total || 0).toLocaleString('fr-FR'), icon: EyeOff, color: 'bg-gray-800' },
    { label: 'Articles publiés', value: `${data.counts?.published || 0} / ${data.counts?.articles || 0}`, icon: FileText, color: 'bg-purple-600' },
    { label: 'Abonnés newsletter', value: data.counts?.subscribers || 0, icon: Send, color: 'bg-brand-yellow !text-gray-900' },
    { label: 'Abonnés notifications', value: data.counts?.pushSubscribers || 0, icon: Bell, color: 'bg-orange-500' },
  ];

  // Graphique : vues par jour (14 derniers jours)
  const byDay: { day: string; count: number }[] = data.byDay || [];
  const maxDay = Math.max(1, ...byDay.map(d => d.count));

  // Heat map : 7 jours × 24 heures
  const heat: { dow: number; hour: number; count: number }[] = data.heat || [];
  const heatMap = new Map<string, number>();
  heat.forEach(h => heatMap.set(`${h.dow}-${h.hour}`, h.count));
  const maxHeat = Math.max(1, ...heat.map(h => h.count));
  const bestSlot = heat.reduce((best: any, h: any) => (!best || h.count > best.count) ? h : best, null);

  const topArticles: any[] = data.topArticles || [];
  const ads: any[] = data.ads || [];
  const topSearches: any[] = data.topSearches || [];

  const maxArticleViews = Math.max(1, ...topArticles.map(a => a.recentViews));

  return (
    <div>
      <h1 className="text-3xl font-serif font-black text-gray-900 mb-8">Tableau de bord — Statistiques</h1>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3 mb-8">
        {kpis.map((kpi, i) => {
          const Icon = kpi.icon;
          return (
            <div key={i} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-white mb-2 ${kpi.color}`}>
                <Icon size={18} />
              </div>
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wide leading-tight mb-0.5">{kpi.label}</p>
              <p className="text-xl font-black text-gray-900">{kpi.value}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Vues par jour */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="font-bold text-gray-900 mb-1 flex items-center gap-2"><TrendingUp size={18} className="text-brand-red" /> Visites — 14 derniers jours</h2>
          <p className="text-xs text-gray-400 mb-4">Chaque barre = nombre de pages vues ce jour-là</p>
          {byDay.length === 0 ? (
            <p className="text-sm text-gray-400 py-8 text-center">Pas encore de données — elles s'accumulent à chaque visite du site.</p>
          ) : (
            <div className="flex items-end gap-1 h-40">
              {byDay.map(d => (
                <div key={d.day} className="flex-1 flex flex-col items-center gap-1 group relative">
                  <span className="absolute -top-5 text-[10px] font-bold text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity">{d.count}</span>
                  <div
                    className="w-full bg-brand-red/80 hover:bg-brand-red rounded-t transition-all min-h-[3px]"
                    style={{ height: `${Math.max(3, (d.count / maxDay) * 100)}%` }}
                    title={`${new Date(d.day).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })} : ${d.count} vues`}
                  />
                  <span className="text-[8px] text-gray-400 font-bold">{new Date(d.day).getDate()}/{new Date(d.day).getMonth() + 1}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Heat map jours × heures */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 overflow-x-auto">
          <h2 className="font-bold text-gray-900 mb-1 flex items-center gap-2"><Flame size={18} className="text-orange-500" /> Heat map — meilleurs jours et heures de lecture</h2>
          <p className="text-xs text-gray-400 mb-4">
            30 derniers jours{bestSlot ? ` — pic : ${DAYS[bestSlot.dow]} autour de ${bestSlot.hour}h (${bestSlot.count} vues)` : ''}
          </p>
          {heat.length === 0 ? (
            <p className="text-sm text-gray-400 py-8 text-center">Pas encore de données horaires.</p>
          ) : (
            <div className="min-w-[480px]">
              <div className="grid grid-rows-7 gap-1">
                {DAYS.map((day, dow) => (
                  <div key={day} className="flex items-center gap-1">
                    <span className="w-8 text-[10px] font-bold text-gray-500 shrink-0">{day}</span>
                    <div className="flex gap-[2px] flex-1">
                      {Array.from({ length: 24 }).map((_, hour) => {
                        const count = heatMap.get(`${dow}-${hour}`) || 0;
                        const intensity = count / maxHeat;
                        return (
                          <div
                            key={hour}
                            title={`${day} ${hour}h : ${count} vues`}
                            className="flex-1 h-5 rounded-sm"
                            style={{ backgroundColor: count === 0 ? '#f3f4f6' : `rgba(227, 6, 19, ${0.12 + intensity * 0.88})` }}
                          />
                        );
                      })}
                    </div>
                  </div>
                ))}
                <div className="flex items-center gap-1 mt-1">
                  <span className="w-8 shrink-0" />
                  <div className="flex gap-[2px] flex-1 text-center">
                    {Array.from({ length: 24 }).map((_, h) => (
                      <span key={h} className="flex-1 text-[7px] text-gray-400 font-bold">{h % 3 === 0 ? `${h}h` : ''}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Articles les plus lus */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2"><FileText size={18} className="text-blue-600" /> Articles les plus consultés (30 jours)</h2>
          {topArticles.length === 0 ? (
            <p className="text-sm text-gray-400 py-6 text-center">Pas encore de consultations enregistrées.</p>
          ) : (
            <div className="space-y-3">
              {topArticles.map((a, i) => (
                <div key={a.id} className="flex items-center gap-3">
                  <span className={`w-6 h-6 shrink-0 rounded flex items-center justify-center text-xs font-black ${i === 0 ? 'bg-brand-red text-white' : 'bg-gray-100 text-gray-600'}`}>{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-900 truncate">{a.title}</p>
                    <div className="h-1.5 bg-gray-100 rounded-full mt-1 overflow-hidden">
                      <div className="h-full bg-blue-600 rounded-full" style={{ width: `${(a.recentViews / maxArticleViews) * 100}%` }} />
                    </div>
                  </div>
                  <span className="text-xs font-black text-gray-500 shrink-0">{a.recentViews} vues<br /><span className="text-[9px] text-gray-400 font-bold">total : {a.views}</span></span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Publicités : impressions / clics / CTR */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 overflow-x-auto">
          <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2"><MousePointerClick size={18} className="text-brand-green" /> Efficacité publicitaire (30 jours)</h2>
          {ads.length === 0 ? (
            <p className="text-sm text-gray-400 py-6 text-center">
              Aucune donnée : les impressions et clics se comptent dès que des publicités sont affichées sur le site.
            </p>
          ) : (
            <table className="w-full text-sm min-w-[420px]">
              <thead>
                <tr className="text-left text-[10px] uppercase tracking-wider text-gray-400 border-b border-gray-100">
                  <th className="pb-2">Publicité</th>
                  <th className="pb-2 text-right">Affichages</th>
                  <th className="pb-2 text-right">Clics</th>
                  <th className="pb-2 text-right">Taux de clic</th>
                </tr>
              </thead>
              <tbody>
                {ads.map(ad => (
                  <tr key={ad.id} className="border-b border-gray-50 last:border-0">
                    <td className="py-2 font-bold text-gray-800">
                      {ad.name}
                      <span className="block text-[10px] text-gray-400 font-medium capitalize">{ad.format}{!ad.isActive ? ' — inactive' : ''}</span>
                    </td>
                    <td className="py-2 text-right font-bold">{ad.impressions}</td>
                    <td className="py-2 text-right font-bold">{ad.clicks}</td>
                    <td className="py-2 text-right">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-black ${ad.ctr >= 1 ? 'bg-green-100 text-green-700' : ad.ctr >= 0.3 ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-600'}`}>
                        {ad.ctr}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Recherches de l'audience */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 xl:col-span-2">
          <h2 className="font-bold text-gray-900 mb-1 flex items-center gap-2"><Search size={18} className="text-purple-600" /> Ce que votre audience recherche (tendances internes)</h2>
          <p className="text-xs text-gray-400 mb-4">Termes tapés dans la barre de recherche du site — utilisez-les comme mots-clés pour vos prochains articles.</p>
          {topSearches.length === 0 ? (
            <p className="text-sm text-gray-400 py-6 text-center">Aucune recherche enregistrée pour le moment.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {topSearches.map(s => (
                <span key={s.term} className="px-3 py-1.5 bg-purple-50 border border-purple-100 text-purple-800 rounded-full text-sm font-bold">
                  {s.term} <span className="text-purple-400 font-black">×{s.count}</span>
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
