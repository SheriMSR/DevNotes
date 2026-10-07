import React, { useState, useMemo } from 'react';
import type { LearningActivity, AppLanguage } from '../../types';
import { Flame, Zap, Target, Calendar } from 'lucide-react';

interface ContributionsCalendarProps {
  activities: LearningActivity[];
  lang: AppLanguage;
}

export const ContributionsCalendar: React.FC<ContributionsCalendarProps> = ({
  activities,
  lang,
}) => {
  const isVi = lang === 'vi';
  const [hoveredDay, setHoveredDay] = useState<{ date: string; count: number; activities: string[] } | null>(null);

  // Generate 16 weeks of calendar days (112 days ending today)
  const calendarDays = useMemo(() => {
    const days: { dateStr: string; dateObj: Date; count: number; items: string[] }[] = [];
    const today = new Date();
    today.setHours(23, 59, 59, 999);

    // Map activities by date string "YYYY-MM-DD"
    const activityMap: Record<string, { count: number; items: string[] }> = {};
    activities.forEach((act) => {
      const d = new Date(act.timestamp);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      if (!activityMap[key]) {
        activityMap[key] = { count: 0, items: [] };
      }
      activityMap[key].count += 1;
      if (!activityMap[key].items.includes(act.label)) {
        activityMap[key].items.push(act.label);
      }
    });

    const totalDays = 112; // 16 weeks
    for (let i = totalDays - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      const entry = activityMap[dateStr] || { count: 0, items: [] };
      days.push({
        dateStr,
        dateObj: d,
        count: entry.count,
        items: entry.items,
      });
    }

    return days;
  }, [activities]);

  // Calculate streaks
  const { currentStreak, longestStreak, totalContributions } = useMemo(() => {
    let current = 0;
    let longest = 0;
    let temp = 0;
    let total = 0;

    // Iterate backwards from yesterday/today
    for (let i = calendarDays.length - 1; i >= 0; i--) {
      const day = calendarDays[i];
      total += day.count;
      if (day.count > 0) {
        current++;
      } else if (i === calendarDays.length - 1) {
        // If no activity today yet, check yesterday
        continue;
      } else {
        break;
      }
    }

    // Longest streak
    for (let i = 0; i < calendarDays.length; i++) {
      if (calendarDays[i].count > 0) {
        temp++;
        if (temp > longest) longest = temp;
      } else {
        temp = 0;
      }
    }

    return {
      currentStreak: current,
      longestStreak: longest,
      totalContributions: total,
    };
  }, [calendarDays]);

  const getLevel = (count: number) => {
    if (count === 0) return 'level-0';
    if (count <= 2) return 'level-1';
    if (count <= 4) return 'level-2';
    if (count <= 6) return 'level-3';
    return 'level-4';
  };

  const weekdays = isVi ? ['T2', '', 'T4', '', 'T6', '', 'CN'] : ['Mon', '', 'Wed', '', 'Fri', '', 'Sun'];

  return (
    <div className="contributions-card">
      {/* Header with Title & Streak Badges */}
      <div className="contributions-header">
        <div>
          <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.15rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-primary)' }}>
            <Calendar size={18} color="var(--primary)" />
            <span>{isVi ? 'Biểu Đồ Đóng Góp & Tiến Độ Học (Contributions Stats)' : 'Learning Activity & Contributions Heatmap'}</span>
          </h3>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: 2 }}>
            {isVi
              ? 'Theo dõi tính liên tục và chuỗi ngày rèn luyện code theo phong cách GitHub.'
              : 'Track your daily consistency and coding streaks GitHub-style.'}
          </p>
        </div>

        <div className="streak-badges-row">
          <div className="streak-badge" style={{ borderColor: '#f59e0b', color: '#f59e0b' }}>
            <Flame size={15} fill="#f59e0b" />
            <span>{currentStreak} {isVi ? 'ngày streak' : 'days streak'}</span>
          </div>

          <div className="streak-badge" style={{ borderColor: 'var(--primary)', color: 'var(--primary)' }}>
            <Zap size={15} fill="var(--primary)" />
            <span>{isVi ? `Kỷ lục: ${longestStreak} ngày` : `Best: ${longestStreak} days`}</span>
          </div>

          <div className="streak-badge">
            <Target size={15} color="#10b981" />
            <span>{totalContributions} {isVi ? 'hoạt động' : 'contributions'}</span>
          </div>
        </div>
      </div>

      {/* Heatmap Grid */}
      <div className="heatmap-scroll-container">
        <div className="heatmap-body">
          {/* Weekday labels */}
          <div className="heatmap-weekdays">
            {weekdays.map((w, idx) => (
              <div key={idx} style={{ height: 13, lineHeight: '13px' }}>
                {w}
              </div>
            ))}
          </div>

          {/* Grid of 112 cells (16 columns x 7 rows) */}
          <div className="heatmap-grid">
            {calendarDays.map((day, idx) => (
              <div
                key={idx}
                className={`heatmap-cell ${getLevel(day.count)}`}
                onMouseEnter={() =>
                  setHoveredDay({
                    date: day.dateStr,
                    count: day.count,
                    activities: day.items,
                  })
                }
                onMouseLeave={() => setHoveredDay(null)}
              />
            ))}
          </div>
        </div>

        {/* Hover info or placeholder */}
        <div style={{ minHeight: 22, fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: 4 }}>
          {hoveredDay ? (
            <span style={{ color: 'var(--text-primary)' }}>
              <strong>{hoveredDay.count} {isVi ? 'hoạt động' : 'contributions'}</strong> {isVi ? 'vào ngày' : 'on'} {hoveredDay.date}
              {hoveredDay.activities.length > 0 && ` (${hoveredDay.activities.join(', ')})`}
            </span>
          ) : (
            <span style={{ color: 'var(--text-muted)' }}>
              {isVi ? 'Di chuột lên các ô vuông để xem chi tiết hoạt động từng ngày.' : 'Hover over any square to inspect daily activities.'}
            </span>
          )}
        </div>

        {/* Legend */}
        <div className="heatmap-legend">
          <span>{isVi ? 'Ít hơn' : 'Less'}</span>
          <div className="heatmap-cell level-0" style={{ cursor: 'default' }} />
          <div className="heatmap-cell level-1" style={{ cursor: 'default' }} />
          <div className="heatmap-cell level-2" style={{ cursor: 'default' }} />
          <div className="heatmap-cell level-3" style={{ cursor: 'default' }} />
          <div className="heatmap-cell level-4" style={{ cursor: 'default' }} />
          <span>{isVi ? 'Nhiều hơn' : 'More'}</span>
        </div>
      </div>
    </div>
  );
};
