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
import { HeroSection } from './components/HeroSection';
import { FeatureStrip } from './components/FeatureStrip';
import { Dashboard } from './components/Dashboard';
import { HistoryView } from './components/HistoryView';
import { MissionSection } from './components/MissionSection';
import { LogActivityModal } from './components/LogActivityModal';
import { WeeklyTargetModal } from './components/WeeklyTargetModal';
import { SolutionsDrawer } from './components/SolutionsDrawer';
import { WatchDemoModal } from './components/WatchDemoModal';
import { SearchModal } from './components/SearchModal';
import { TargetExceededNudge } from './components/TargetExceededNudge';
import { DemoToolbar } from './components/DemoToolbar';
import { Footer } from './components/Footer';
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

  // Calendar date tracking with auto-refresh to prevent telemetry staleness
  const [currentDate, setCurrentDate] = useState<Date>(() => new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentDate((prev) => {
        const now = new Date();
        if (
          now.getDate() !== prev.getDate() ||
          now.getMonth() !== prev.getMonth() ||
          now.getFullYear() !== prev.getFullYear() ||
          Math.floor(now.getTime() / 60000) !== Math.floor(prev.getTime() / 60000)
        ) {
          return now;
        }
        return prev;
      });
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  // Modal & Drawer States
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState<ActivityLog | null>(null);
  const [initialLogType, setInitialLogType] = useState<ActivityType>('car');
  const [initialLogQty, setInitialLogQty] = useState<number | undefined>(undefined);
  const [isTargetModalOpen, setIsTargetModalOpen] = useState(false);
  const [isSolutionsDrawerOpen, setIsSolutionsDrawerOpen] = useState(false);
  const [isDemoTourOpen, setIsDemoTourOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);

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

  // Compute Weekly Metrics derived dynamically from activities, target, and active calendar date
  const metrics: WeekMetrics = useMemo(() => {
    return computeWeekMetrics(activities, weeklyTarget, currentDate);
  }, [activities, weeklyTarget, currentDate]);

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
          particleCount: 26,
          spread: 45,
          origin: { y: 0.85, x: 0.8 },
          colors: ['#40916c', '#52b788', '#1b4332'],
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
      const scMetrics = computeWeekMetrics(data, 20, currentDate);
      addToast(
        'success',
        'Scenario Loaded: On Pace',
        `Weekly total ${scMetrics.totalCo2Kg.toFixed(1)} kg CO₂ (${scMetrics.percentUsed}% of ${scMetrics.targetKg.toFixed(0)} kg target).`
      );
    } else if (scenario === 'exceeded') {
      setWeeklyTarget(20);
      saveWeeklyTarget(20);
      const scMetrics = computeWeekMetrics(data, 20, currentDate);
      addToast(
        'warning',
        'Scenario Loaded: Target Exceeded',
        `Weekly total ${scMetrics.totalCo2Kg.toFixed(1)} kg CO₂ (+${scMetrics.excessKg.toFixed(1)} kg above target). Triggers DP1 supportive guidance.`
      );
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
        setIsSolutionsDrawerOpen(false);
        setIsDemoTourOpen(false);
        setIsSearchModalOpen(false);
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
      } else if (e.key === '/') {
        e.preventDefault();
        setIsSearchModalOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="app-wrapper">
      {/* Top Navigation */}
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
        onOpenSolutionsDrawer={() => setIsSolutionsDrawerOpen(true)}
        onOpenSearchModal={() => setIsSearchModalOpen(true)}
      />

      {/* Main Composition Root */}
      <main className="main-container">
        {/* Section 1: Hero Overview with 3D Nature Diorama */}
        <section id="home">
          <HeroSection
            metrics={metrics}
            activities={activities}
            onStartTracking={() => {
              setEditingActivity(null);
              setInitialLogQty(undefined);
              setIsLogModalOpen(true);
            }}
            onWatchDemo={() => setIsDemoTourOpen(true)}
          />
        </section>

        {/* Section 2: Quick Feature Access Strip */}
        <section id="features">
          <FeatureStrip
            onTrackClick={() => {
              setEditingActivity(null);
              setInitialLogQty(undefined);
              setIsLogModalOpen(true);
            }}
            onInsightsClick={() => {
              if (activeTab !== 'dashboard') setActiveTab('dashboard');
              setTimeout(() => {
                const el = document.getElementById('insights-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }, 60);
            }}
            onGoalsClick={() => setIsTargetModalOpen(true)}
            onSolutionsClick={() => setIsSolutionsDrawerOpen(true)}
          />
        </section>

        {/* Decision Point 1: Supportive Target Nudge */}
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

        {/* Section 3: Activity Tracker & Command Center */}
        <section id="track" style={{ scrollMarginTop: '90px' }}>
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
              currentWeekStart={metrics.weekStart}
              currentWeekEnd={metrics.weekEnd}
            />
          )}
        </section>

        {/* Section 4: Mission & Principles */}
        <section id="mission">
          <MissionSection />
        </section>
      </main>

      {/* Editorial Footer */}
      <Footer
        onNavClick={(sec) => {
          if (sec === 'solutions') {
            setIsSolutionsDrawerOpen(true);
          } else if (sec === 'about') {
            const el = document.getElementById('mission');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          } else if (sec === 'track') {
            const el = document.getElementById('track');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          } else if (sec === 'history') {
            setActiveTab('history');
            const el = document.getElementById('track');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          } else if (sec === 'insights') {
            if (activeTab !== 'dashboard') setActiveTab('dashboard');
            setTimeout(() => {
              const el = document.getElementById('insights-section');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }, 50);
          } else {
            const el = document.getElementById('home');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }
        }}
      />

      {/* Modals & Slide-Over Drawers */}
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

      <SolutionsDrawer
        isOpen={isSolutionsDrawerOpen}
        onClose={() => setIsSolutionsDrawerOpen(false)}
        onSelectAction={(activityType) => {
          setInitialLogType(activityType);
          setInitialLogQty(undefined);
          setIsLogModalOpen(true);
        }}
      />

      <WatchDemoModal
        isOpen={isDemoTourOpen}
        onClose={() => setIsDemoTourOpen(false)}
        onTriggerScenario={handleLoadScenario}
        onTriggerAbsurd={handleTriggerAbsurdDemo}
      />

      <SearchModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
        onSelectActivity={(type) => {
          setInitialLogType(type);
          setInitialLogQty(undefined);
          setIsLogModalOpen(true);
        }}
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
