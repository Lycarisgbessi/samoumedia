import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import type { Article } from '../types';
import { motion } from 'motion/react';
import { Key } from 'react';

interface ArticleCardProps {
  article: Article;
  featured?: boolean;
  categoryName?: string;
  compact?: boolean;
  number?: number;
  key?: Key;
}

export default function ArticleCard({ article, featured, categoryName, compact, number }: ArticleCardProps) {
  const dateStr = formatDistanceToNow(new Date(article.date), { addSuffix: true, locale: fr });

  if (compact) {
    return (
      <Link to={`/article/${article.id}`} className="group flex gap-5 py-5 border-b border-gray-100 last:border-0 hover:bg-gray-50/50 transition-colors duration-500 rounded-lg relative overflow-hidden">
        {number && (
          <div className="w-10 h-10 shrink-0 bg-brand-red text-white flex items-center justify-center font-bold rounded-sm relative z-10 shadow-sm group-hover:scale-110 transition-transform duration-500 ease-out font-serif text-lg">
            {number}
          </div>
        )}
        <div className="flex-1 relative z-10">
          <h4 className="font-serif font-bold text-gray-900 group-hover:text-brand-red transition-colors duration-300 leading-tight mb-3 md:text-lg">
            {article.title}
          </h4>
          <div className="flex items-center gap-3 text-[10px] text-gray-400 font-bold uppercase tracking-widest">
            <span className="text-brand-red">{categoryName || article.categoryId}</span>
            <span>•</span>
            <span>{dateStr}</span>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link to={`/article/${article.id}`} className={`group flex flex-col ${featured ? 'md:flex-row gap-8 md:gap-12 items-center bg-gray-50 rounded-2xl overflow-hidden hover:shadow-2xl transition-shadow duration-700 border border-gray-100' : 'gap-5'} relative`}>
      <div className={`relative overflow-hidden ${featured ? 'md:w-3/5 w-full aspect-[4/3] md:aspect-[16/10]' : 'rounded-xl w-full aspect-[4/3]'} shadow-sm bg-gray-100`}>
        <div className="absolute top-4 left-4 z-10 bg-brand-red text-white px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] rounded-sm shadow-xl transform -translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 ease-out">
          {categoryName || article.categoryId}
        </div>
        <motion.div
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="w-full h-full"
        >
          <motion.img 
            src={article.imageUrl} 
            alt={article.title} 
            className="w-full h-full object-cover"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          />
        </motion.div>
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-500" />
        {featured && <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent md:hidden" />}
      </div>
      
      <div className={`flex flex-col justify-center ${featured ? 'md:w-2/5 absolute bottom-0 p-8 md:relative md:p-12 md:bg-transparent text-white md:text-gray-900 z-10' : 'flex-1'}`}>
        {!featured && (
          <div className="flex items-center gap-3 text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-3">
            <span className="text-brand-red">{categoryName || article.categoryId}</span>
            <span>•</span>
            <span>{dateStr}</span>
          </div>
        )}
        <h3 className={`font-serif font-black ${featured ? 'text-2xl md:text-5xl md:leading-[1.1] mb-6 drop-shadow-lg md:drop-shadow-none' : 'text-xl leading-tight mb-4'} group-hover:text-brand-red transition-colors duration-300`}>
          {article.title}
        </h3>
        {featured && (
          <p className="text-gray-200 md:text-gray-600 mb-8 line-clamp-3 text-lg hidden md:block leading-relaxed font-medium">
            {article.excerpt}
          </p>
        )}
        <div className={`flex items-center gap-4 text-[11px] ${featured ? 'text-gray-300 md:text-gray-500' : 'text-gray-500'} font-bold uppercase tracking-widest`}>
          <span className="text-brand-dark">{article.author}</span>
          {featured && (
            <>
              <span className="hidden md:inline text-gray-300">•</span>
              <span className="hidden md:inline">{dateStr}</span>
              <span className="hidden md:inline text-gray-300">•</span>
              <span className="hidden md:inline text-brand-red">{article.readTime} lecture</span>
            </>
          )}
        </div>
      </div>
    </Link>
  );
}
