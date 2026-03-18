import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Globe,
  Monitor,
  Wifi,
  HardDrive,
  Shield,
  Eye,
  Download,
  RefreshCw,
  Info,
  Activity,
  Clock,
  Crown,
  AlertTriangle,
} from 'lucide-react';
import { collectAllMetadata, getMetadataExplanations } from '@/utils/metadataCollector';
import { calculatePrivacyScore } from '@/utils/privacyScorer';
import PricingModal from '@/components/PricingModal';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const MetadataField = ({ label, value, explanation }) => {
  const displayValue = typeof value === 'object' ? JSON.stringify(value) : String(value);
  
  return (
    <div className="flex justify-between items-start py-2 border-b border-zinc-800/50 last:border-0 group" data-testid={`metadata-field-${label.toLowerCase().replace(/\s+/g, '-')}`}>
      <div className="flex items-start gap-2 flex-1">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-2 cursor-help">
                <span className="font-mono text-xs uppercase tracking-widest text-zinc-500">{label}</span>
                <Info className="w-3 h-3 text-zinc-600 group-hover:text-cyan-400 transition-colors" />
              </div>
            </TooltipTrigger>
            <TooltipContent className="max-w-xs bg-zinc-900 border-zinc-700">
              <p className="text-sm">{explanation || 'Metadata collected from your device.'}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      <span className="font-mono text-sm text-cyan-400 break-all text-right max-w-md">{displayValue}</span>
    </div>
  );
};

const MetadataCard = ({ title, icon: Icon, data, explanations, category }) => {
  const [expanded, setExpanded] = useState(false);
  const entries = Object.entries(data).slice(0, expanded ? undefined : 4);

  return (
    <Card className="bg-[#0A0A0A] border border-zinc-800 rounded-sm relative overflow-hidden hover:border-cyan-500/50 transition-colors duration-300 animate-slide-in" data-testid={`metadata-card-${category}`}>
      <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-3xl"></div>
      <CardHeader className="border-b border-zinc-800/50 bg-zinc-900/20 relative z-10">
        <CardTitle className="font-heading font-semibold text-xl tracking-wide text-cyan-400 flex items-center gap-2">
          <Icon className="w-5 h-5" />
          {title}
          <Badge className="ml-auto font-mono text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider border bg-cyan-950/30 text-cyan-400 border-cyan-900/50" data-testid={`badge-count-${category}`}>
            {Object.keys(data).length} fields
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 relative z-10">
        <div className="space-y-1">
          {entries.map(([key, value]) => (
            <MetadataField
              key={key}
              label={key}
              value={value}
              explanation={explanations?.[key]}
            />
          ))}
        </div>
        {Object.entries(data).length > 4 && (
          <Button
            variant="ghost"
            className="w-full mt-4 font-heading uppercase tracking-wider text-xs hover:bg-zinc-800/50 text-zinc-400 hover:text-white"
            onClick={() => setExpanded(!expanded)}
            data-testid={`expand-button-${category}`}
          >
            {expanded ? 'Show Less' : `Show ${Object.entries(data).length - 4} More`}
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

const Dashboard = () => {
  const [metadata, setMetadata] = useState(null);
  const [loading, setLoading] = useState(true);
  const [serverMetadata, setServerMetadata] = useState(null);
  const [privacyScore, setPrivacyScore] = useState(null);
  const [showPricing, setShowPricing] = useState(false);
  const explanations = getMetadataExplanations();

  const loadMetadata = async () => {
    setLoading(true);
    try {
      const clientData = await collectAllMetadata();
      setMetadata(clientData);

      // Calculate privacy score
      const score = calculatePrivacyScore(clientData);
      setPrivacyScore(score);

      // Get server-side metadata
      const response = await axios.get(`${API}/metadata/collect`);
      setServerMetadata(response.data);
    } catch (error) {
      console.error('Error collecting metadata:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMetadata();
  }, []);

  const handleExport = () => {
    const exportData = {
      client: metadata,
      server: serverMetadata,
      exportTime: new Date().toISOString(),
    };
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `metadata-report-${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleSave = async () => {
    try {
      await axios.post(`${API}/metadata/save`, {
        client: metadata,
        server: serverMetadata,
      });
      alert('Metadata snapshot saved!');
    } catch (error) {
      console.error('Error saving metadata:', error);
      alert('Failed to save metadata');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="text-center space-y-4">
          <Activity className="w-12 h-12 text-cyan-400 animate-pulse mx-auto" />
          <p className="font-heading text-xl text-zinc-400 uppercase tracking-wider">Scanning Device...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] relative">
      {/* Scanlines Effect */}
      <div className="fixed inset-0 scanlines pointer-events-none z-50 opacity-10"></div>
      
      {/* Header */}
      <header className="sticky top-0 z-40 backdrop-blur-md bg-black/40 border-b border-zinc-800">
        <div className="max-w-7xl mx-auto p-4 md:p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="w-8 h-8 text-cyan-400 text-glow" />
            <h1 className="font-heading font-bold text-3xl md:text-4xl tracking-tight uppercase text-glow" data-testid="app-title">
              Device Intel
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={() => setShowPricing(true)}
              className="font-heading uppercase tracking-wider text-xs bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-[0_0_20px_rgba(6,182,212,0.4)]"
              data-testid="upgrade-button"
            >
              <Crown className="w-4 h-4 mr-2" />
              Upgrade to Pro
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={loadMetadata}
              className="font-heading uppercase tracking-wider text-xs hover:bg-zinc-800/50 text-zinc-400 hover:text-white"
              data-testid="refresh-button"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Rescan
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleSave}
              className="font-heading uppercase tracking-wider text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700"
              data-testid="save-button"
            >
              Save Snapshot
            </Button>
            <Button
              onClick={handleExport}
              className="font-heading uppercase tracking-wider font-semibold text-xs bg-cyan-600 hover:bg-cyan-500 text-white shadow-[0_0_15px_rgba(6,182,212,0.3)]"
              data-testid="export-button"
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-4 md:p-8">
        {/* Info Banner */}
        <div className="mb-8 bg-zinc-900/50 border border-zinc-800 rounded-sm p-6 backdrop-blur-sm" data-testid="info-banner">
          <div className="flex items-start gap-4">
            <Eye className="w-6 h-6 text-cyan-400 flex-shrink-0 mt-1" />
            <div>
              <h2 className="font-heading font-semibold text-xl text-white mb-2">What Information Is Being Collected?</h2>
              <p className="text-zinc-400 leading-relaxed">
                This dashboard shows all metadata that websites can collect from your device. Every field includes an explanation
                of what it is and how it's typically used. Hover over the <Info className="w-3 h-3 inline" /> icon for details.
                This data can be used for analytics, personalization, security, and unfortunately, fingerprinting.
              </p>
            </div>
          </div>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Privacy Score Card */}
          {privacyScore && (
            <Card className="bg-[#0A0A0A] border border-zinc-800 rounded-sm relative overflow-hidden hover:border-cyan-500/50 transition-colors duration-300 lg:col-span-2" data-testid="privacy-score-card">
              <div className={`absolute top-0 right-0 w-48 h-48 rounded-full blur-3xl ${
                privacyScore.grade === 'A' ? 'bg-emerald-500/10' :
                privacyScore.grade === 'B' ? 'bg-cyan-500/10' :
                privacyScore.grade === 'C' ? 'bg-yellow-500/10' :
                'bg-red-500/10'
              }`}></div>
              <CardHeader className="border-b border-zinc-800/50 bg-zinc-900/20 relative z-10">
                <CardTitle className="font-heading font-semibold text-xl tracking-wide text-cyan-400 flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Privacy Score
                  <Badge className={`ml-auto font-heading text-lg px-3 py-1 ${
                    privacyScore.grade === 'A' ? 'bg-emerald-600' :
                    privacyScore.grade === 'B' ? 'bg-cyan-600' :
                    privacyScore.grade === 'C' ? 'bg-yellow-600' :
                    'bg-red-600'
                  } text-white`} data-testid="privacy-grade">
                    {privacyScore.grade}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 relative z-10">
                <div className="flex items-center gap-6 mb-4">
                  <div className="text-center">
                    <div className={`font-heading font-bold text-6xl ${
                      privacyScore.score >= 80 ? 'text-emerald-400' :
                      privacyScore.score >= 65 ? 'text-cyan-400' :
                      privacyScore.score >= 50 ? 'text-yellow-400' :
                      'text-red-400'
                    }`} data-testid="privacy-score">
                      {privacyScore.score}
                    </div>
                    <div className="text-zinc-500 text-sm font-mono">out of 100</div>
                  </div>
                  <div className="flex-1">
                    <p className="text-zinc-300 leading-relaxed">{privacyScore.summary}</p>
                    {privacyScore.issues.length > 0 && (
                      <div className="mt-3">
                        <p className="text-xs text-zinc-500 uppercase tracking-wider mb-2 font-mono">Top Issues:</p>
                        <div className="space-y-1">
                          {privacyScore.issues.slice(0, 3).map((issue, idx) => (
                            <div key={idx} className="flex items-start gap-2">
                              <AlertTriangle className={`w-3 h-3 flex-shrink-0 mt-0.5 ${
                                issue.severity === 'high' ? 'text-red-400' :
                                issue.severity === 'medium' ? 'text-yellow-400' :
                                'text-blue-400'
                              }`} />
                              <span className="text-xs text-zinc-400">{issue.issue}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <Button
                  onClick={() => setShowPricing(true)}
                  className="w-full font-heading uppercase tracking-wider text-xs bg-cyan-600 hover:bg-cyan-500 text-white"
                  data-testid="unlock-recommendations-button"
                >
                  <Crown className="w-4 h-4 mr-2" />
                  Unlock Full Report & Recommendations
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Time Info - Small Card */}
          <Card className="bg-[#0A0A0A] border border-zinc-800 rounded-sm relative overflow-hidden hover:border-cyan-500/50 transition-colors duration-300" data-testid="metadata-card-time">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl"></div>
            <CardContent className="p-6 relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <Clock className="w-5 h-5 text-emerald-400" />
                <h3 className="font-heading font-semibold text-lg text-emerald-400 uppercase tracking-wide">Timestamp</h3>
              </div>
              <p className="font-mono text-2xl text-white">{metadata?.time?.localTime}</p>
              <p className="font-mono text-xs text-zinc-500 mt-2">{metadata?.time?.timezone}</p>
            </CardContent>
          </Card>

          {/* Browser Info */}
          <MetadataCard
            title="Browser"
            icon={Globe}
            data={metadata?.browser || {}}
            explanations={explanations.browser}
            category="browser"
          />

          {/* Device Info */}
          <MetadataCard
            title="Device"
            icon={Monitor}
            data={metadata?.device || {}}
            explanations={explanations.device}
            category="device"
          />

          {/* Network Info */}
          <MetadataCard
            title="Network"
            icon={Wifi}
            data={metadata?.network || {}}
            explanations={explanations.network}
            category="network"
          />

          {/* Storage Info */}
          <MetadataCard
            title="Storage"
            icon={HardDrive}
            data={metadata?.storage || {}}
            explanations={explanations.storage}
            category="storage"
          />

          {/* Permissions */}
          <MetadataCard
            title="Permissions"
            icon={Shield}
            data={metadata?.permissions || {}}
            explanations={explanations.permissions}
            category="permissions"
          />

          {/* Hidden/Fingerprinting Data - Spans 2 columns on large screens */}
          <div className="lg:col-span-3">
            <MetadataCard
              title="Hidden Fingerprinting Data"
              icon={Eye}
              data={metadata?.hidden || {}}
              explanations={explanations.hidden}
              category="hidden"
            />
          </div>

          {/* Server-Side Data - Spans 2 columns */}
          {serverMetadata && (
            <div className="lg:col-span-3">
              <Card className="bg-[#0A0A0A] border border-amber-800/50 rounded-sm relative overflow-hidden hover:border-amber-500/50 transition-colors duration-300" data-testid="metadata-card-server">
                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-3xl"></div>
                <CardHeader className="border-b border-zinc-800/50 bg-zinc-900/20 relative z-10">
                  <CardTitle className="font-heading font-semibold text-xl tracking-wide text-amber-400 flex items-center gap-2">
                    <Activity className="w-5 h-5" />
                    Server-Side Collection
                    <Badge className="ml-auto font-mono text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider border bg-amber-950/30 text-amber-400 border-amber-900/50">
                      HTTP Headers
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 relative z-10">
                  <p className="text-zinc-400 text-sm mb-4">
                    This data is collected by the server from your HTTP request. It includes your IP address, request headers, and other connection metadata.
                  </p>
                  <div className="space-y-1">
                    {Object.entries(serverMetadata).map(([key, value]) => (
                      <MetadataField
                        key={key}
                        label={key}
                        value={value}
                        explanation="Collected from HTTP headers sent to the server."
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {/* Footer Info */}
        <div className="mt-12 text-center text-zinc-600 text-sm font-mono" data-testid="footer">
          <p>All data collection happens locally in your browser and on our server.</p>
          <p className="mt-2">No data is shared with third parties. Use Export to save your report.</p>
        </div>
      </main>

      {/* Pricing Modal */}
      <PricingModal open={showPricing} onClose={() => setShowPricing(false)} />
    </div>
  );
};

export default Dashboard;
