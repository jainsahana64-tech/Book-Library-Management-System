import React from 'react';
import { BookMarked, CheckCircle2, BookmarkCheck, Layers } from 'lucide-react';

export default function StatsOverview({ stats }) {
  const cards = [
    {
      label: 'Total Books',
      value: stats?.total ?? 0,
      icon: BookMarked,
      color: '#6366f1',
      bg: 'rgba(99, 102, 241, 0.15)',
    },
    {
      label: 'Available Now',
      value: stats?.available ?? 0,
      icon: CheckCircle2,
      color: '#10b981',
      bg: 'rgba(16, 185, 129, 0.15)',
    },
    {
      label: 'Currently Issued',
      value: stats?.issued ?? 0,
      icon: BookmarkCheck,
      color: '#f59e0b',
      bg: 'rgba(245, 158, 11, 0.15)',
    },
    {
      label: 'Categories',
      value: stats?.categoriesCount ?? 0,
      icon: Layers,
      color: '#38bdf8',
      bg: 'rgba(56, 189, 248, 0.15)',
    },
  ];

  return (
    <section className="stats-grid" aria-label="Library Statistics">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div key={idx} className="stat-card" style={{ '--card-glow': card.bg }}>
            <div className="stat-icon" style={{ backgroundColor: card.bg, color: card.color }}>
              <Icon size={26} />
            </div>
            <div className="stat-info">
              <span className="stat-label">{card.label}</span>
              <span className="stat-value">{card.value}</span>
            </div>
          </div>
        );
      })}
    </section>
  );
}
