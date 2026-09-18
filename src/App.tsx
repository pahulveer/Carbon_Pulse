import { useState, useEffect, useMemo, useCallback } from 'react';
import type { ActivityCategory, ActivityLog, ActivityType, ToastMessage, WeekMetrics } from './types';
import {
  loadActivities,
  saveActivities,
  loadWeeklyTarget,
  saveWeeklyTarget,
  createActivityLog,
  isAppInitialized,
  markAppInitialized,
  importActivitiesFromJSON,
} from './lib/storage';
import { computeWeekMetrics } from './lib/weekUtils';
import { generateSampleWeekData } from './lib/sampleData';
import { EMISSION_FACTORS, ACTIVITY_DEFINITIONS, calculateCO2 } from './lib/emissions';
import { Navbar } from './components/Navbar';
import { Dashboard } from './components/Dashboard';
import { HistoryView } from './components/HistoryView';
import { LogActivityModal } from './components/LogActivityModal';
import { WeeklyTargetModal } from './components/WeeklyTargetModal';
import { TargetExceededNudge } from './components/TargetExceededNudge';
import { DemoToolbar } from './components/DemoToolbar';
import { ToastContainer } from './components/Toast';
import confetti from 'canvas-confetti';

export function App() {
  // State
  const [activities, setActivities] = useState<ActivityLog[]>(() => {
    const loaded = loadActivities();
    // First run initialization: provide balanced sample data so judges see immediate value
    if (loaded.length === 0 && !isAppInitialized()) {
      const sample = generateSampleWeekData('balanced');
      saveActivities(sample);
      markAppInitialized();
      return sample;
    }
    return loaded;
  });

  const [weeklyTarget, setWeeklyTarget] = useState<number>(() => loadWeeklyTarget());
  const [activeTab, setActiveTab] = useState<'dashboard' | 'history'>('dashboard');
  const [historyCategoryFilter, setHistoryCategoryFilter] = useState<ActivityCategory | 'all'>('all');

  // Modal States
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState<ActivityLog | null>(null);
  const [initialLogType, setInitialLogType] = useState<ActivityType>('car');
  const [initialLogQty, setInitialLogQty] = useState<number | undefined>(undefined);
  const [isTargetModalOpen, setIsTargetModalOpen] = useState(false);

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback((type: ToastMessage['type'], title: string, description?: string) => {
    const newToast: ToastMessage = {
      id: `toast_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      type,
      title,
      description,
    };
    setToasts((prev) => [...prev.slice(-4), newToast]);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Compute Weekly Metrics
  const metrics: WeekMetrics = useMemo(() => {
    return computeWeekMetrics(activities, weeklyTarget);
  }, [activities, weeklyTarget]);

  // Persist activities on change
  const handleSaveActivity = (
    type: ActivityType,
    quantity: number,
    date: string,
    flaggedAsAbsurd = false,
    notes?: string
  ) => {
    const newLog = createActivityLog(type, quantity, date, flaggedAsAbsurd, notes);
    const updated = [newLog, ...activities];
    setActivities(updated);
    saveActivities(updated);

    addToast(
      'success',
      'Activity Recorded',
      `${newLog.co2Kg.toFixed(2)} kg CO₂ added to your weekly footprint`
    );

    // If on-pace and within reasonable balance, trigger subtle confetti celebration
    if (!metrics.isTargetExceeded && newLog.co2Kg < 5) {
      try {
        confetti({
          particleCount: 28,
          spread: 45,
          origin: { y: 0.85, x: 0.8 },
          colors: ['#34D399', '#10B981', '#38BDF8'],
          disableForReducedMotion: true,
        });
      } catch {
        // ignore if confetti fails
      }
    }
  };

  const handleDeleteActivity = (id: string) => {
    const targetAct = activities.find((a) => a.id === id);
    const updated = activities.filter((a) => a.id !== id);
    setActivities(updated);
    saveActivities(updated);

    addToast(
      'info',
      'Activity Removed',
      targetAct ? `Removed ${targetAct.co2Kg.toFixed(2)} kg CO₂ entry` : undefined
    );
  };

  const handleEditActivity = (act: ActivityLog) => {
    setEditingActivity(act);
    setIsLogModalOpen(true);
  };

  const handleUpdateActivity = (
    id: string,
    type: ActivityType,
    quantity: number,
    date: string,
    flaggedAsAbsurd = false,
    notes?: string
  ) => {
    const factor = EMISSION_FACTORS[type];
    const co2Kg = calculateCO2(type, quantity);
    const def = ACTIVITY_DEFINITIONS[type];
    const unit = def ? def.unit : 'km';

    const updated = activities.map((act) => {
      if (act.id !== id) return act;
      return {
        ...act,
        type,
        quantity,
        unit,
        factor,
        co2Kg,
        date,
        flaggedAsAbsurd,
        notes,
      };
    });

    setActivities(updated);
    saveActivities(updated);
    setEditingActivity(null);

    addToast(
      'success',
      'Activity Updated',
      `Updated entry to ${co2Kg.toFixed(2)} kg CO₂`
    );
  };

  const handleSaveTarget = (targetKg: number) => {
    setWeeklyTarget(targetKg);
    saveWeeklyTarget(targetKg);
    addToast(
      'success',
      'Weekly Target Updated',
      `New weekly emissions budget set to ${targetKg.toFixed(1)} kg CO₂`
    );
  };

  // Judge Demo Scenarios
  const handleLoadScenario = (scenario: 'balanced' | 'exceeded' | 'empty') => {
    const data = generateSampleWeekData(scenario);
    setActivities(data);
    saveActivities(data);

    if (scenario === 'balanced') {
      setWeeklyTarget(20);
      saveWeeklyTarget(20);
      addToast('success', 'Scenario Loaded: On Pace', 'Weekly total ~12.8 kg CO₂ (64% of 20 kg target).');
    } else if (scenario === 'exceeded') {
      setWeeklyTarget(20);
      saveWeeklyTarget(20);
      addToast('warning', 'Scenario Loaded: Target Exceeded', 'Triggers DP1 supportive guidance card.');
    } else {
      addToast('info', 'Data Reset', 'All activities cleared to initial blank state.');
    }
  };

  const handleTriggerAbsurdDemo = () => {
    setInitialLogType('car');
    setInitialLogQty(500000);
    setIsLogModalOpen(true);
    addToast('info', 'DP2 Demo Ready', '500,000 km pre-filled. Click "ADD ACTIVITY" to view anomaly interceptor.');
  };

  const handleImportJSON = (jsonStr: string) => {
    const res = importActivitiesFromJSON(jsonStr);
    if (res.success) {
      const refreshed = loadActivities();
      setActivities(refreshed);
      addToast('success', 'Import Successful', `Imported ${res.count} activity entries.`);
    } else {
      addToast('error', 'Import Failed', res.error || 'Invalid JSON format');
    }
  };

  // Keyboard Shortcuts (A11y & Speed)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Escape closes open modals first
      if (e.key === 'Escape') {
        setIsLogModalOpen(false);
        setIsTargetModalOpen(false);
        return;
      }

      // Don't trigger if user is typing in an input
      if (['INPUT', 'SELECT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) {
        return;
      }

      if (e.key === 'l' || e.key === 'L' || e.key === '+') {
        e.preventDefault();
        setInitialLogQty(undefined);
        setIsLogModalOpen(true);
      } else if (e.key === 't' || e.key === 'T') {
        e.preventDefault();
        setIsTargetModalOpen(true);
      } else if (e.key === 'd' || e.key === 'D') {
        e.preventDefault();
        setActiveTab('dashboard');
      } else if (e.key === 'h' || e.key === 'H') {
        e.preventDefault();
        setActiveTab('history');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="app-wrapper">
      {/* Top Sticky Navigation */}
      <Navbar
        metrics={metrics}
        activeTab={activeTab}
        onTabChange={(tab) => {
          if (tab === 'history') setHistoryCategoryFilter('all');
          setActiveTab(tab);
        }}
        onOpenLogModal={() => {
          setEditingActivity(null);
          setInitialLogQty(undefined);
          setIsLogModalOpen(true);
        }}
        onOpenTargetModal={() => setIsTargetModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="main-container">
        {/* Decision Point 1: The Nudge (Visible when target is crossed, regardless of tab) */}
        <TargetExceededNudge
          metrics={metrics}
          onOpenLogModal={() => {
            setEditingActivity(null);
            setInitialLogQty(undefined);
            setIsLogModalOpen(true);
          }}
          onOpenTargetModal={() => setIsTargetModalOpen(true)}
          onViewHistory={() => {
            setHistoryCategoryFilter('all');
            setActiveTab('history');
          }}
        />

        {/* View Switcher */}
        {activeTab === 'dashboard' ? (
          <Dashboard
            metrics={metrics}
            recentActivities={activities}
            onOpenLogModal={(type) => {
              setEditingActivity(null);
              if (type) setInitialLogType(type);
              setInitialLogQty(undefined);
              setIsLogModalOpen(true);
            }}
            onOpenTargetModal={() => setIsTargetModalOpen(true)}
            onDeleteActivity={handleDeleteActivity}
            onEditActivity={handleEditActivity}
            onViewAllHistory={() => {
              setHistoryCategoryFilter('all');
              setActiveTab('history');
            }}
            onFilterByCategory={(cat) => {
              setHistoryCategoryFilter(cat);
              setActiveTab('history');
            }}
          />
        ) : (
          <HistoryView
            activities={activities}
            onDeleteActivity={handleDeleteActivity}
            onEditActivity={handleEditActivity}
            onOpenLogModal={() => {
              setEditingActivity(null);
              setInitialLogQty(undefined);
              setIsLogModalOpen(true);
            }}
            onImportData={handleImportJSON}
            initialCategory={historyCategoryFilter}
          />
        )}
      </main>

      {/* Modals */}
      <LogActivityModal
        isOpen={isLogModalOpen}
        onClose={() => {
          setIsLogModalOpen(false);
          setEditingActivity(null);
        }}
        onSaveActivity={handleSaveActivity}
        onUpdateActivity={handleUpdateActivity}
        editingActivity={editingActivity}
        initialActivityType={initialLogType}
        initialQuantity={initialLogQty}
      />

      <WeeklyTargetModal
        isOpen={isTargetModalOpen}
        currentTarget={weeklyTarget}
        currentWeeklyFootprint={metrics.totalCo2Kg}
        onClose={() => setIsTargetModalOpen(false)}
        onSaveTarget={handleSaveTarget}
      />

      {/* Demo Toolbar for Hackathon Judges */}
      <DemoToolbar
        onLoadScenario={handleLoadScenario}
        onTriggerAbsurdDemo={handleTriggerAbsurdDemo}
        onOpenTargetModal={() => setIsTargetModalOpen(true)}
      />

      {/* Micro-Feedback Toast Stream */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}

export default App;
