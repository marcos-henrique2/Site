import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

const CATEGORY_STYLES = {
  'chaveiro': { emoji: '🔑', bg: '#EEEDFE', color: '#3C3489' },
  'chaveiros': { emoji: '🔑', bg: '#EEEDFE', color: '#3C3489' },
  'decoracao': { emoji: '🏠', bg: '#E1F5EE', color: '#085041' },
  'decoração': { emoji: '🏠', bg: '#E1F5EE', color: '#085041' },
  'utilitarios': { emoji: '⚙️', bg: '#FAECE7', color: '#712B13' },
  'utilitários': { emoji: '⚙️', bg: '#FAECE7', color: '#712B13' },
  'games': { emoji: '🎮', bg: '#E6F1FB', color: '#0C447C' },
  'geek': { emoji: '🎮', bg: '#E6F1FB', color: '#0C447C' },
  'games-geek': { emoji: '🎮', bg: '#E6F1FB', color: '#0C447C' },
  'trofeus': { emoji: '🏆', bg: '#FAEEDA', color: '#633806' },
  'troféus': { emoji: '🏆', bg: '#FAEEDA', color: '#633806' },
  'presentes': { emoji: '🎁', bg: '#FBEAF0', color: '#72243E' },
  'jardim': { emoji: '🌱', bg: '#EAF3DE', color: '#27500A' },
  'ferramentas': { emoji: '🔧', bg: '#F1EFE8', color: '#444441' },
  'organizacao': { emoji: '📦', bg: '#E6F1FB', color: '#0C447C' },
  'organização': { emoji: '📦', bg: '#E6F1FB', color: '#0C447C' },
  'brinquedos': { emoji: '🪀', bg: '#FBEAF0', color: '#72243E' },
  'miniaturas': { emoji: '🎨', bg: '#EEEDFE', color: '#3C3489' },
  'prototipos': { emoji: '🔬', bg: '#E1F5EE', color: '#085041' },
  'protótipos': { emoji: '🔬', bg: '#E1F5EE', color: '#085041' },
  'acessorios': { emoji: '✨', bg: '#FAEEDA', color: '#633806' },
  'acessórios': { emoji: '✨', bg: '#FAEEDA', color: '#633806' },
  'halloween': { emoji: '🎃', bg: '#FAECE7', color: '#712B13' },
  'natal': { emoji: '🎄', bg: '#EAF3DE', color: '#27500A' },
};

const FALLBACK_STYLES = [
  { emoji: '📦', bg: '#EEEDFE', color: '#3C3489' },
  { emoji: '✨', bg: '#E1F5EE', color: '#085041' },
  { emoji: '🎨', bg: '#FAECE7', color: '#712B13' },
  { emoji: '⭐', bg: '#E6F1FB', color: '#0C447C' },
  { emoji: '🚀', bg: '#FAEEDA', color: '#633806' },
  { emoji: '💡', bg: '#FBEAF0', color: '#72243E' },
  { emoji: '🔷', bg: '#EAF3DE', color: '#27500A' },
  { emoji: '🎯', bg: '#F1EFE8', color: '#444441' },
];

function getCategoryStyle(name, slug, index) {
  const key = (slug || name || '').toLowerCase().replace(/\s+/g, '-');
  const nameKey = (name || '').toLowerCase();

  return (
    CATEGORY_STYLES[key] ||
    CATEGORY_STYLES[nameKey] ||
    FALLBACK_STYLES[index % FALLBACK_STYLES.length]
  );
}

/**
 * @param {Object} props
 * @param {any} props.category
 * @param {number} [props.index]
 */
export default function CategoryCard({ category, index = 0 }) {
  const style = getCategoryStyle(category.name, category.slug, index);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
    >
      <Link
        to={`/produtos?categoria=${category.slug}`}
        className="group flex flex-col items-center gap-3 p-5 bg-card rounded-2xl border border-border hover:border-border/80 hover:shadow-md hover:shadow-primary/5 transition-all duration-200"
      >
        {/* Ícone / Emoji */}
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shrink-0 group-hover:scale-110 transition-transform duration-200"
          style={{ background: style.bg }}
        >
          {style.emoji}
        </div>

        {/* Nome */}
        <div className="text-center">
          <h3 className="font-semibold text-sm text-foreground leading-snug line-clamp-2">
            {category.name}
          </h3>
          {category.description && (
            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
              {category.description}
            </p>
          )}
        </div>

        {/* Link sutil */}
        <span className="flex items-center gap-1 text-xs font-medium text-muted-foreground group-hover:text-primary transition-colors">
          Ver produtos
          <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
        </span>
      </Link>
    </motion.div>
  );
}
