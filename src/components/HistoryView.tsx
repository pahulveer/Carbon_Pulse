import React, { useState, useMemo } from 'react';
import {
  Search,
  Upload,
  Trash2,
  X,
  FileSpreadsheet,
  FileJson,
  Car,
  Bus,
  Plane,
  Zap,
  Salad,
  Beef,
  Plus,
  AlertCircle,
  Edit2,
} from 'lucide-react';
import type { ActivityCategory, ActivityLog, ActivityType, FilterOptions } from '../types';
import { ACTIVITY_DEFINITIONS } from '../lib/emissions';
import { formatDateDisplay, formatDateISO, getMondayOfWeek, getSundayOfWeek } from '../lib/weekUtils';
import { exportActivitiesToCSV, exportActivitiesToJSON } from '../lib/storage';

interface HistoryViewProps {
  activities: ActivityLog[];
  onDeleteActivity: (id: string) => void;
  onEditActivity?: (activity: ActivityLog) => void;
  onOpenLogModal: () => void;
  onImportData: (jsonStr: string) => void;
  initialCategory?: ActivityCategory | 'all';
  currentWeekStart?: string;
  currentWeekEnd?: string;
}

const ICONS_MAP: Record<ActivityType, React.ReactNode> = {
  car: <Car size={16} />,
  bus: <Bus size={16} />,
  flight: <Plane size={16} />,
  electricity: <Zap size={16} />,
  veg_meal: <Salad size={16} />,
  non_veg_meal: <Beef size={16} />,
};

export const HistoryView: React.FC<HistoryViewProps> = ({
  activities,
  onDeleteActivity,
  onEditActivity,
  onOpenLogModal,
  onImportData,
  initialCategory = 'all',
  currentWeekStart,
  currentWeekEnd,
}) => {
  const [filter, setFilter] = useState<FilterOptions>({
    searchQuery: '',
    activityType: 'all',
    category: initialCategory,
    dateRange: 'all',
    sortBy: 'date_desc',
  });

  const [prevInitialCat, setPrevInitialCat] = useState(initialCategory);
  if (initialCategory !== prevInitialCat) {
    setPrevInitialCat(initialCategory);
    setFilter((f) => ({ ...f, category: initialCategory }));
  }

  const [customStart, setCustomStart] = useState<string>('');
  const [customEnd, setCustomEnd] = useState<string>('');
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Compute Monday & Sunday of current week for 'this_week' filter (synchronized with app telemetry)
  const { thisWeekStart, thisWeekEnd } = useMemo(() => {
    if (currentWeekStart && currentWeekEnd) {
      return { thisWeekStart: currentWeekStart, thisWeekEnd: currentWeekEnd };
    }
    const now = new Date();
    return {
      thisWeekStart: formatDateISO(getMondayOfWeek(now)),
      thisWeekEnd: formatDateISO(getSundayOfWeek(now)),
    };
  }, [currentWeekStart, currentWeekEnd]);

  // Filtered Activities
  const filteredActivities = useMemo(() => {
    return activities
      .filter((act) => {
        // Activity Type
        if (filter.activityType !== 'all' && act.type !== filter.activityType) {
          return false;
        }

        // Category
        if (filter.category !== 'all') {
          const def = ACTIVITY_DEFINITIONS[act.type] || ACTIVITY_DEFINITIONS.car;
          if (def.category !== filter.category) return false;
        }

        // Date Range
        if (filter.dateRange === 'this_week') {
          if (act.date < thisWeekStart || act.date > thisWeekEnd) return false;
        } else if (filter.dateRange === 'custom') {
          if (customStart && act.date < customStart) return false;
          if (customEnd && act.date > customEnd) return false;
        }

        // Search Query
        if (filter.searchQuery.trim()) {
          const q = filter.searchQuery.toLowerCase();
          const def = ACTIVITY_DEFINITIONS[act.type] || ACTIVITY_DEFINITIONS.car;
          const matches =
            def.label.toLowerCase().includes(q) ||
            act.type.toLowerCase().includes(q) ||
            (act.notes && act.notes.toLowerCase().includes(q)) ||
            act.date.includes(q);
          if (!matches) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (filter.sortBy === 'date_desc') return b.date.localeCompare(a.date) || b.createdAt - a.createdAt;
        if (filter.sortBy === 'date_asc') return a.date.localeCompare(b.date) || a.createdAt - b.createdAt;
        if (filter.sortBy === 'co2_desc') return b.co2Kg - a.co2Kg;
        if (filter.sortBy === 'co2_asc') return a.co2Kg - b.co2Kg;
        return 0;
      });
  }, [activities, filter, thisWeekStart, thisWeekEnd, customStart, customEnd]);

  // Aggregate stats for filtered result
  const filteredTotalCo2 = filteredActivities.reduce((acc, curr) => acc + curr.co2Kg, 0);

  // Active filters count
  const hasActiveFilters =
    filter.activityType !== 'all' ||
    filter.category !== 'all' ||
    filter.dateRange !== 'all' ||
    filter.searchQuery.trim() !== '' ||
    Boolean(customStart || customEnd);

  const clearAllFilters = () => {
    setFilter({
      searchQuery: '',
      activityType: 'all',
      category: 'all',
      dateRange: 'all',
      sortBy: 'date_desc',
    });
    setCustomStart('');
    setCustomEnd('');
  };

  const handleExportCSV = () => {
    const csv = exportActivitiesToCSV(filteredActivities);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `carbon_pulse_ledger_${Date.now()}.csv`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const handleExportJSON = () => {
    const json = exportActivitiesToJSON(filteredActivities);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `carbon_pulse_backup_${Date.now()}.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const content = ev.target?.result as string;
      if (content) onImportData(content);
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top Ledger Header & Actions */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Carbon Activity Ledger</h2>
          <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)' }}>
            Complete historical registry of logged emissions with multi-axis filtering
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <button onClick={handleExportCSV} className="btn btn-secondary btn-sm" title="Download CSV ledger">
            <FileSpreadsheet size={15} />
            <span>Export CSV</span>
          </button>

          <button onClick={handleExportJSON} className="btn btn-secondary btn-sm" title="Backup data to JSON">
            <FileJson size={15} />
            <span>Export JSON</span>
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleFileUpload}
            style={{ display: 'none' }}
          />

          <button
            onClick={() => fileInputRef.current?.click()}
            className="btn btn-secondary btn-sm"
            title="Import activities from JSON"
          >
            <Upload size={15} />
            <span>Import</span>
          </button>

          <button onClick={onOpenLogModal} className="btn btn-primary btn-sm">
            <Plus size={15} />
            <span>Log Activity</span>
          </button>
        </div>
      </div>

      {/* Filter Control Console */}
      <div
        className="glass-card"
        style={{
          padding: '16px 20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px',
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '12px',
          }}
        >
          {/* Keyword Search */}
          <div style={{ position: 'relative' }}>
            <Search
              size={16}
              color="var(--forest-700)"
              style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
            />
            <input
              type="text"
              placeholder="Search activity, notes..."
              value={filter.searchQuery}
              onChange={(e) => setFilter({ ...filter, searchQuery: e.target.value })}
              style={{ width: '100%', paddingLeft: '36px', paddingRight: filter.searchQuery ? '32px' : '12px' }}
            />
            {filter.searchQuery.trim() && (
              <button
                type="button"
                onClick={() => setFilter({ ...filter, searchQuery: '' })}
                aria-label="Clear search input"
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  borderRadius: '50%',
                }}
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Activity Type Filter */}
          <div>
            <select
              value={filter.activityType}
              onChange={(e) => setFilter({ ...filter, activityType: e.target.value as ActivityType | 'all' })}
              style={{ width: '100%' }}
              aria-label="Filter by activity type"
            >
              <option value="all">All Activity Types</option>
              <option value="car">Car travel (0.20 kg/km)</option>
              <option value="bus">Bus travel (0.08 kg/km)</option>
              <option value="flight">Flight (0.25 kg/km)</option>
              <option value="electricity">Electricity (0.80 kg/kWh)</option>
              <option value="veg_meal">Veg meal (0.50 kg/meal)</option>
              <option value="non_veg_meal">Non-veg meal (2.00 kg/meal)</option>
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={filter.category}
              onChange={(e) => setFilter({ ...filter, category: e.target.value as ActivityCategory | 'all' })}
              style={{ width: '100%' }}
              aria-label="Filter by category"
            >
              <option value="all">All Categories</option>
              <option value="transport">Transport (Car, Bus, Flight)</option>
              <option value="energy">Energy (Electricity)</option>
              <option value="food">Food (Veg & Non-veg meals)</option>
            </select>
          </div>

          {/* Date Scope Filter */}
          <div>
            <select
              value={filter.dateRange}
              onChange={(e) => setFilter({ ...filter, dateRange: e.target.value as FilterOptions['dateRange'] })}
              style={{ width: '100%' }}
              aria-label="Filter by date scope"
            >
              <option value="all">All Time</option>
              <option value="this_week">This Week (Mon → Sun)</option>
              <option value="custom">Custom Date Range</option>
            </select>
          </div>

          {/* Sort By */}
          <div>
            <select
              value={filter.sortBy}
              onChange={(e) => setFilter({ ...filter, sortBy: e.target.value as FilterOptions['sortBy'] })}
              style={{ width: '100%' }}
              aria-label="Sort activities"
            >
              <option value="date_desc">Newest First (Date ↓)</option>
              <option value="date_asc">Oldest First (Date ↑)</option>
              <option value="co2_desc">Highest Carbon (CO₂ ↓)</option>
              <option value="co2_asc">Lowest Carbon (CO₂ ↑)</option>
            </select>
          </div>
        </div>

        {/* Custom Date Range Inputs if selected */}
        {filter.dateRange === 'custom' && (
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>From:</span>
            <input
              type="date"
              value={customStart}
              onChange={(e) => setCustomStart(e.target.value)}
              style={{ padding: '6px 10px', fontSize: '0.85rem' }}
            />
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>To:</span>
            <input
              type="date"
              value={customEnd}
              onChange={(e) => setCustomEnd(e.target.value)}
              style={{ padding: '6px 10px', fontSize: '0.85rem' }}
            />
          </div>
        )}

        {/* Active Filter Chips & Clear Button */}
        {hasActiveFilters && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '8px',
              paddingTop: '8px',
              borderTop: '1px solid var(--border-subtle)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>Active Filters:</span>
              {filter.category !== 'all' && (
                <span className="badge badge-emerald" style={{ textTransform: 'capitalize' }}>
                  Category: {filter.category}
                </span>
              )}
              {filter.activityType !== 'all' && (
                <span className="badge badge-emerald">
                  Type: {ACTIVITY_DEFINITIONS[filter.activityType].label}
                </span>
              )}
              {filter.dateRange === 'this_week' && <span className="badge badge-sky">Scope: This Week</span>}
              {filter.dateRange === 'custom' && <span className="badge badge-sky">Scope: Custom Date</span>}
              {filter.searchQuery.trim() && (
                <span className="badge badge-amber">Query: "{filter.searchQuery}"</span>
              )}
            </div>

            <button
              onClick={clearAllFilters}
              className="btn btn-secondary btn-sm"
              style={{ padding: '3px 8px', fontSize: '0.74rem' }}
            >
              <X size={12} />
              <span>Clear Filters</span>
            </button>
          </div>
        )}
      </div>

      {/* Summary Stat for Filtered Results */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '0.86rem',
          color: 'var(--text-secondary)',
          padding: '0 4px',
        }}
      >
        <span>
          Showing <strong>{filteredActivities.length}</strong> of {activities.length} activities
        </span>
        <span>
          Filtered Total:{' '}
          <strong style={{ color: 'var(--emerald-400)', fontFamily: 'var(--font-mono)' }}>
            {filteredTotalCo2.toFixed(2)} kg CO₂
          </strong>
        </span>
      </div>

      {/* Activity Table / List */}
      {filteredActivities.length === 0 ? (
        <div
          className="glass-card"
          style={{
            textAlign: 'center',
            padding: '50px 20px',
            background: '#ffffff',
          }}
        >
          <AlertCircle size={36} color="var(--amber-500)" style={{ margin: '0 auto 12px auto' }} />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--forest-950)', marginBottom: '6px' }}>
            NO MATCHING ACTIVITIES
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginBottom: '16px' }}>
            Try changing your filters or searching with different keywords.
          </p>
          {hasActiveFilters && (
            <button onClick={clearAllFilters} className="btn btn-secondary btn-sm">
              <span>Reset All Filters</span>
            </button>
          )}
        </div>
      ) : (
        <div
          className="glass-card"
          style={{
            padding: 0,
            overflow: 'hidden',
            background: '#ffffff',
          }}
        >
          <div style={{ overflowX: 'auto' }}>
            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                textAlign: 'left',
                fontSize: '0.88rem',
              }}
            >
              <thead>
                <tr
                  style={{
                    background: '#f8faf7',
                    borderBottom: '1px solid var(--border-subtle)',
                    color: 'var(--text-muted)',
                    fontSize: '0.76rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                  }}
                >
                  <th style={{ padding: '14px 18px' }}>
                    <button
                      type="button"
                      className="table-sort-btn"
                      onClick={() =>
                        setFilter((f) => ({
                          ...f,
                          sortBy: f.sortBy === 'date_desc' ? 'date_asc' : 'date_desc',
                        }))
                      }
                      title="Sort by date"
                      aria-label="Sort by date"
                      style={{
                        color: filter.sortBy.startsWith('date') ? 'var(--forest-800)' : 'inherit',
                      }}
                    >
                      <span>Date</span>
                      <span style={{ fontSize: '0.82rem' }}>
                        {filter.sortBy === 'date_desc' ? '↓' : filter.sortBy === 'date_asc' ? '↑' : '↕'}
                      </span>
                    </button>
                  </th>
                  <th style={{ padding: '14px 18px' }}>Activity Type</th>
                  <th style={{ padding: '14px 18px' }}>Quantity</th>
                  <th style={{ padding: '14px 18px' }}>Factor</th>
                  <th style={{ padding: '14px 18px' }}>
                    <button
                      type="button"
                      className="table-sort-btn"
                      onClick={() =>
                        setFilter((f) => ({
                          ...f,
                          sortBy: f.sortBy === 'co2_desc' ? 'co2_asc' : 'co2_desc',
                        }))
                      }
                      title="Sort by CO2 footprint"
                      aria-label="Sort by carbon footprint"
                      style={{
                        color: filter.sortBy.startsWith('co2') ? 'var(--forest-800)' : 'inherit',
                      }}
                    >
                      <span>Footprint</span>
                      <span style={{ fontSize: '0.82rem' }}>
                        {filter.sortBy === 'co2_desc' ? '↓' : filter.sortBy === 'co2_asc' ? '↑' : '↕'}
                      </span>
                    </button>
                  </th>
                  <th style={{ padding: '14px 18px' }}>Notes</th>
                  <th style={{ padding: '14px 18px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredActivities.map((act) => {
                  const def = ACTIVITY_DEFINITIONS[act.type] || ACTIVITY_DEFINITIONS.car;
                  return (
                    <tr
                      key={act.id}
                      style={{
                        borderBottom: '1px solid var(--border-subtle)',
                        transition: 'background 0.15s ease',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(27, 67, 50, 0.03)')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      {/* Date */}
                      <td style={{ padding: '14px 18px', fontFamily: 'var(--font-mono)', whiteSpace: 'nowrap' }}>
                        {formatDateDisplay(act.date)}
                        <span style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-dim)' }}>
                          {act.date}
                        </span>
                      </td>

                      {/* Type */}
                      <td style={{ padding: '14px 18px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{ color: 'var(--forest-800)' }}>{ICONS_MAP[act.type]}</div>
                          <div>
                            <span style={{ fontWeight: 600, color: 'var(--forest-950)' }}>{def.label}</span>
                            {act.flaggedAsAbsurd && (
                              <span
                                className="badge badge-amber"
                                style={{ marginLeft: '8px', fontSize: '0.62rem', padding: '1px 6px' }}
                              >
                                Flagged
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Quantity */}
                      <td style={{ padding: '14px 18px', fontFamily: 'var(--font-mono)' }}>
                        <strong>{act.quantity.toLocaleString()}</strong> {act.unit}
                      </td>

                      {/* Factor */}
                      <td style={{ padding: '14px 18px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                        {act.factor.toFixed(2)} kg/{act.unit}
                      </td>

                      {/* Footprint CO2 */}
                      <td style={{ padding: '14px 18px' }}>
                        <span
                          style={{
                            fontWeight: 700,
                            fontFamily: 'var(--font-mono)',
                            color: 'var(--emerald-400)',
                            fontSize: '0.98rem',
                          }}
                        >
                          {act.co2Kg.toFixed(2)} kg
                        </span>
                      </td>

                      {/* Notes */}
                      <td style={{ padding: '14px 18px', color: 'var(--text-secondary)', maxWidth: '200px' }}>
                        {act.notes || <span style={{ color: 'var(--text-dim)' }}>—</span>}
                      </td>

                      {/* Action */}
                      <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px' }}>
                          {onEditActivity && (
                            <button
                              onClick={() => onEditActivity(act)}
                              title="Edit entry"
                              aria-label={`Edit ${def.label} logged on ${act.date}`}
                              className="btn btn-secondary btn-icon"
                              style={{ width: '30px', height: '30px' }}
                            >
                              <Edit2 size={13} />
                            </button>
                          )}
                          <button
                            onClick={() => onDeleteActivity(act.id)}
                            title="Delete entry"
                            aria-label={`Delete ${def.label} logged on ${act.date}`}
                            className="btn btn-secondary btn-icon"
                            style={{
                              width: '30px',
                              height: '30px',
                              display: 'inline-flex',
                              color: 'var(--text-dim)',
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--rose-400)')}
                            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-dim)')}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
