import { useState } from 'react'
import {
  Database,
  RefreshCw,
  Lock,
  Server,
  Activity,
  HardDrive,
} from 'lucide-react'
import type { LandRegistryApiGatewayStatus } from '../../types/stateNodal'

interface StateLandRegistryApiProps {
  gateways: LandRegistryApiGatewayStatus[]
}

export default function StateLandRegistryApi({ gateways }: StateLandRegistryApiProps) {
  const [gatewaysList, setGatewaysList] = useState(gateways)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [lastSync, setLastSync] = useState(new Date().toLocaleTimeString())

  const handlePingAll = () => {
    setIsRefreshing(true)
    setTimeout(() => {
      setGatewaysList((prev) =>
        prev.map((g) => ({
          ...g,
          realtimePingMs: Math.floor(30 + Math.random() * 40),
          lastSyncTimestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
        }))
      )
      setIsRefreshing(false)
      setLastSync(new Date().toLocaleTimeString())
    }, 800)
  }

  const totalIndexed = gatewaysList.reduce((acc, g) => acc + g.totalRecordsIndexed, 0)
  const totalActiveLocks = gatewaysList.reduce((acc, g) => acc + g.activeLocksCount, 0)

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
              <Database className="h-5 w-5 text-[#042A5E]" />
              State &amp; National Land Records API Gateways
            </h2>
            <p className="text-xs text-slate-500 max-w-3xl">
              High-throughput real-time integration connectors linking NLAMS directly with Mahabhulekh (RoR 7/12 &amp; 8A), DILRMP Spatial GIS Cadastre, and SARITA Registry for automatic encumbrance verification and Section 11 digital mutation locks.
            </p>
          </div>
          <button
            onClick={handlePingAll}
            disabled={isRefreshing}
            className="inline-flex items-center gap-2 rounded-xl bg-[#042A5E] px-4 py-2 text-xs font-bold text-white hover:bg-[#07397b] transition-colors disabled:opacity-50 cursor-pointer shadow-xs shrink-0"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Pinging Nodes...' : 'Ping All Gateways'}
          </button>
        </div>
      </div>

      {/* Gateway Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Indexed Land Records</span>
            <div className="rounded-lg bg-blue-50 p-2 text-blue-700">
              <HardDrive className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900">
            {(totalIndexed / 1000000).toFixed(1)}M
          </div>
          <p className="mt-1 text-[11px] text-slate-400">Total RoR titles in state database</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Active Section 11 Locks</span>
            <div className="rounded-lg bg-amber-50 p-2 text-amber-700">
              <Lock className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-amber-600">
            {totalActiveLocks.toLocaleString()} Parcels
          </div>
          <p className="mt-1 text-[11px] text-slate-400">Locked against sale / partition</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Gateway Status</span>
            <div className="rounded-lg bg-emerald-50 p-2 text-emerald-700">
              <Activity className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-emerald-700">100% Online</div>
          <p className="mt-1 text-[11px] text-slate-400">Last synchronized at {lastSync}</p>
        </div>
      </div>

      {/* Gateway Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {gatewaysList.map((gw) => (
          <div
            key={gw.gatewayId}
            className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs space-y-4 hover:border-slate-300 transition-colors"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <div className="rounded-lg bg-[#042A5E]/10 p-2 text-[#042A5E]">
                  <Server className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-xs font-black text-slate-900 leading-tight">{gw.name}</h3>
                  <span className="text-[10px] font-mono text-slate-400">{gw.gatewayId}</span>
                </div>
              </div>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-black text-emerald-800">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                {gw.status}
              </span>
            </div>

            <div className="rounded-lg bg-slate-50 p-3 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Coverage</span>
                <span className="font-bold text-slate-800">{gw.coverage}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Records Indexed</span>
                <span className="font-bold text-slate-800 font-mono">
                  {gw.totalRecordsIndexed.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">API Response Ping</span>
                <span className="font-bold font-mono text-emerald-700">
                  {gw.realtimePingMs} ms
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Active Parcels Locked</span>
                <span className="font-bold font-mono text-amber-700">
                  {gw.activeLocksCount.toLocaleString()}
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
              <span>Sync: {gw.lastSyncTimestamp}</span>
              <span className="font-bold text-[#042A5E] cursor-pointer hover:underline">
                Inspect Logs
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
