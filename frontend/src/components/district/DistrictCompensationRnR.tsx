export default function DistrictCompensationRnR() {
  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-emerald-600 px-2.5 py-0.5 text-xs font-bold text-white">
              Sec 23 &amp; Sec 31 Compensation &amp; R&amp;R
            </span>
            <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
              Direct Benefit Transfer (DBT) via PFMS / e-Kuber
            </span>
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 mt-1">
            Compensation Disbursal &amp; R&amp;R Rehabilitation Portal
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Monitor direct bank transfers to affected landholders, escrow account balances, and rehabilitation plot allotments
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="rounded-xl bg-emerald-50 border border-emerald-200 px-3 py-1.5 text-xs font-bold text-emerald-800">
            74.3% Disbursal Rate
          </span>
        </div>
      </div>

      {/* 4 Summary Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <span className="text-xs font-bold text-slate-500">Total Award Determined</span>
          <span className="block text-2xl font-black text-slate-900 mt-1">₹1,680.0 Cr</span>
          <span className="text-[10px] text-slate-400 mt-1 block">Sec 23 Market Value + 100% Solatium</span>
        </div>

        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-5 shadow-xs">
          <span className="text-xs font-bold text-emerald-800">DBT Compensation Disbursed</span>
          <span className="block text-2xl font-black text-emerald-950 mt-1">₹1,248.6 Cr</span>
          <span className="text-[10px] text-emerald-700 font-bold mt-1 block">Transferred to 2,610 Landowners</span>
        </div>

        <div className="rounded-2xl border border-blue-200 bg-blue-50/50 p-5 shadow-xs">
          <span className="text-xs font-bold text-[#042A5E]">Affected Families</span>
          <span className="block text-2xl font-black text-[#042A5E] mt-1">2,610 Families</span>
          <span className="text-[10px] text-blue-800 font-bold mt-1 block">1,890 Aadhaar KYC Verified</span>
        </div>

        <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-5 shadow-xs">
          <span className="text-xs font-bold text-amber-900">R&amp;R Plots Allotted</span>
          <span className="block text-2xl font-black text-amber-950 mt-1">420 Housing Sites</span>
          <span className="text-[10px] text-amber-800 font-bold mt-1 block">Out of 540 Eligible Families</span>
        </div>
      </div>

      {/* Disbursal Tracker Table & Escrow Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Disbursal Schedule Table */}
        <div className="lg:col-span-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900">
              Project-wise Compensation Disbursal Status
            </h3>
            <span className="text-xs text-slate-500">Live PFMS/e-Kuber Sync</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-700 font-bold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Project Title</th>
                  <th className="py-2.5 px-3">Awarded (Cr)</th>
                  <th className="py-2.5 px-3">Disbursed (Cr)</th>
                  <th className="py-2.5 px-3">Families Paid</th>
                  <th className="py-2.5 px-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                <tr className="hover:bg-slate-50">
                  <td className="py-3 px-3 font-bold text-slate-900">Pune Outer Ring Road (Phase 1)</td>
                  <td className="py-3 px-3 font-extrabold text-slate-800">₹480.0 Cr</td>
                  <td className="py-3 px-3 font-extrabold text-emerald-700">₹360.5 Cr</td>
                  <td className="py-3 px-3">840 / 1,140 Families</td>
                  <td className="py-3 px-3 text-right">
                    <span className="rounded bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                      75.1% Paid
                    </span>
                  </td>
                </tr>
                <tr className="hover:bg-slate-50">
                  <td className="py-3 px-3 font-bold text-slate-900">Pune-Nasik Rail Corridor</td>
                  <td className="py-3 px-3 font-extrabold text-slate-800">₹290.0 Cr</td>
                  <td className="py-3 px-3 font-extrabold text-emerald-700">₹85.0 Cr</td>
                  <td className="py-3 px-3">180 / 520 Families</td>
                  <td className="py-3 px-3 text-right">
                    <span className="rounded bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-900">
                      29.3% Paid
                    </span>
                  </td>
                </tr>
                <tr className="hover:bg-slate-50">
                  <td className="py-3 px-3 font-bold text-slate-900">Talegaon Industrial Expansion</td>
                  <td className="py-3 px-3 font-extrabold text-slate-800">₹310.0 Cr</td>
                  <td className="py-3 px-3 font-extrabold text-emerald-700">₹240.0 Cr</td>
                  <td className="py-3 px-3">340 / 410 Families</td>
                  <td className="py-3 px-3 text-right">
                    <span className="rounded bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                      77.4% Paid
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Escrow & Title Disputes Panel */}
        <div className="lg:col-span-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Escrow Accounts &amp; Title Disputes
          </h3>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <span className="text-[10px] font-bold text-slate-500 uppercase">
              District Revenue Escrow Balance
            </span>
            <span className="block text-xl font-black text-slate-900">
              ₹431.4 Cr
            </span>
            <span className="text-[11px] text-slate-500 block">
              Deposited in SBI Treasury Escrow A/c for pending title adjudications
            </span>
          </div>

          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-800">Pending Title Objections (LAO Tribunal)</h4>
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs">
              <span className="font-bold text-amber-900 block">24 Survey Disputes Pending</span>
              <p className="text-[11px] text-amber-800 mt-0.5">
                Hearing date scheduled: 05 Oct 2026 before Special Land Acquisition Officer.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
