'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import { Alert } from '@/components/ui/Alert';
import {
  HeartIcon,
  BoltIcon,
  FaceSmileIcon,
  ShieldCheckIcon,
  ArrowTrendingUpIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

import { riskService } from '@/services/riskService';
import { wellbeingService } from '@/services/wellbeingService';

export default function RiskPage() {
  const [clusters, setClusters] = useState<any[]>([]);
  const [trends, setTrends] = useState<any[]>([]);
  const [tip, setTip] = useState<string>('Analyzing organizational patterns...');
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    fetchRiskData();
  }, []);

  const fetchRiskData = async () => {
    try {
      const [clusterData, trendData, tipData] = await Promise.all([
        riskService.getRiskClusters(),
        riskService.getTrends(),
        wellbeingService.getWellbeingTip()
      ]);
      setClusters(clusterData);
      setTrends(trendData);
      setTip(tipData.content);
    } catch (err) {
      console.error('Failed to fetch risk data', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="flex justify-center py-20"><Spinner /></div>;

  const getRiskColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'critical': return { color: 'text-red-600', bg: 'bg-red-50' };
      case 'high': return { color: 'text-orange-600', bg: 'bg-orange-50' };
      case 'medium': return { color: 'text-yellow-600', bg: 'bg-yellow-50' };
      default: return { color: 'text-green-600', bg: 'bg-green-50' };
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col gap-1 text-left">
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Psychological Safety & Burnout</h1>
        <p className="text-gray-500 font-medium italic">Privacy-focused AI analysis of organizational friction and wellbeing.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2" title="Burnout Risk Heatmap" subtitle="Aggregated organizational telemetry identifying high-friction clusters.">
          <div className="h-96 flex flex-col items-center justify-center bg-gray-50/80 rounded-2xl border-2 border-dashed border-gray-100 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-tr from-blue-50/20 to-indigo-50/20 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="flex gap-4">
              {trends.map((t, i) => (
                <div key={i} className="flex flex-col items-center gap-2">
                  <div
                    className="w-12 bg-indigo-500 rounded-t-lg transition-all hover:bg-indigo-600 cursor-help"
                    style={{ height: `${t.score * 20}px` }}
                    title={`Score: ${t.score} on ${t.date}`}
                  />
                  <span className="text-[8px] font-bold text-gray-400 uppercase">{t.date.split('-')[2]} Mar</span>
                </div>
              ))}
            </div>
            <p className="text-gray-400 font-bold tracking-widest uppercase text-[10px] mt-8">Organization Sentiment Trend</p>
            <Badge variant="info" className="mt-4">Live Sync Active</Badge>
          </div>
        </Card>

        <Card title="Risk Clusters" subtitle="Detected support priority segments.">
          <div className="space-y-6">
            {clusters.map((cluster) => {
              const styles = getRiskColor(cluster.risk_level);
              return (
                <div key={cluster.name} className={`p-4 rounded-xl border border-gray-100 flex items-center justify-between ${styles.bg}`}>
                  <div className="space-y-1">
                    <p className="text-xs font-black uppercase tracking-widest text-gray-400 opacity-80">{cluster.name}</p>
                    <p className={`text-lg font-black ${styles.color}`}>{cluster.employee_count} Employees</p>
                  </div>
                  <Button variant="ghost" size="sm" className="bg-white text-gray-600 font-bold text-[10px] uppercase shadow-sm">Details</Button>
                </div>
              );
            })}

            <div className="p-6 bg-slate-900 rounded-2xl text-white relative overflow-hidden shadow-xl">
              <div className="absolute bottom-0 right-0 w-20 h-20 bg-blue-500/10 blur-2xl" />
              <HeartIcon className="w-6 h-6 text-pink-500 mb-2" />
              <h4 className="text-sm font-bold uppercase tracking-widest mb-2">Wellbeing Tip</h4>
              <p className="text-xs leading-relaxed italic opacity-80">"{tip}"</p>
              <Button
                onClick={fetchRiskData}
                variant="ghost"
                className="w-full mt-4 text-white/50 hover:text-white font-bold text-[10px] uppercase tracking-widest"
              >
                Refresh Analysis
              </Button>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="flex flex-col items-center text-center p-6 bg-white gap-2 border-none shadow-sm">
          <FaceSmileIcon className="w-8 h-8 text-green-500" />
          <p className="text-sm font-bold uppercase tracking-widest text-gray-400">Avg. Happiness</p>
          <p className="text-2xl font-black text-gray-900">8.4/10</p>
        </Card>
        <Card className="flex flex-col items-center text-center p-6 bg-white gap-2 border-none shadow-sm">
          <ShieldCheckIcon className="w-8 h-8 text-blue-600" />
          <p className="text-sm font-bold uppercase tracking-widest text-gray-400">Safety Index</p>
          <p className="text-2xl font-black text-gray-900">92%</p>
        </Card>
        <Card className="flex flex-col items-center text-center p-6 bg-white gap-2 border-none shadow-sm">
          <ClockIcon className="w-8 h-8 text-indigo-500" />
          <p className="text-sm font-bold uppercase tracking-widest text-gray-400">Avg. OT Hours</p>
          <p className="text-2xl font-black text-gray-900">
            {trends.length > 0 ? (trends.reduce((a, b) => a + b.score, 0) / trends.length).toFixed(1) : '4.2'}
            <span className="text-xs font-bold text-red-500 ml-2">↑12%</span>
          </p>
        </Card>
        <Card className="flex flex-col items-center text-center p-6 bg-white gap-2 border-none shadow-sm">
          <ArrowTrendingUpIcon className="w-8 h-8 text-purple-600" />
          <p className="text-sm font-bold uppercase tracking-widest text-gray-400">Retention Risk</p>
          <p className="text-2xl font-black text-gray-900">Low</p>
        </Card>
      </div>

      <FrictionLab />
    </div>
  );
}

function FrictionLab() {
  const [text, setText] = useState('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleCheck = async () => {
    if (!text.trim()) return;
    setLoading(true);
    try {
      const data = await wellbeingService.checkFriction(text);
      setResult(data);
    } catch (err) {
      console.error('Friction check failed', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card title="AI Friction Laboratory" subtitle="Proactively test workplace communication for hidden friction or support needs.">
      <div className="space-y-4">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste anonymized message or meeting transcript here..."
          className="w-full h-32 p-4 bg-gray-50 rounded-xl border-2 border-transparent focus:border-indigo-500 focus:bg-white transition-all outline-none text-sm font-medium"
        />
        <div className="flex justify-end">
          <Button
            onClick={handleCheck}
            loading={loading}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs uppercase tracking-widest px-8 shadow-lg shadow-indigo-200"
          >
            Analyze Friction
          </Button>
        </div>

        {result && (
          <div className={`mt-6 p-6 rounded-2xl animate-in slide-in-from-top-4 duration-500 ${result.data.has_friction ? 'bg-orange-50 border border-orange-100' : 'bg-green-50 border border-green-100'}`}>
            <div className="flex items-start gap-4">
              <div className={`p-2 rounded-lg ${result.data.has_friction ? 'bg-orange-600 text-white' : 'bg-green-600 text-white'}`}>
                {result.data.has_friction ? <BoltIcon className="w-5 h-5" /> : <ShieldCheckIcon className="w-5 h-5" />}
              </div>
              <div className="space-y-2">
                <p className={`text-sm font-black uppercase tracking-widest ${result.data.has_friction ? 'text-orange-900' : 'text-green-900'}`}>
                  AI Assessment: {result.data.has_friction ? 'Friction Detected' : 'No Major Friction'}
                </p>
                <p className="text-sm text-gray-700 leading-relaxed font-medium capitalize">{result.content}</p>
                <div className="pt-2">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Recommendation</span>
                  <p className="text-xs text-gray-500 italic mt-1 font-medium">{result.data.support_hint}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
