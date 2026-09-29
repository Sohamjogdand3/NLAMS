/**
 * NLAMS Backend API Service Client
 * Connects to the FastAPI backend API endpoints with JWT auth header handling,
 * automatic refresh token rotation on 401s, and typed domain namespaces.
 */

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1';

export interface ApiError {
  detail?: string | Array<{ msg: string; loc: string[] }>;
  message?: string;
}

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem('nlams_access_token');
  const isFormData = options.body instanceof FormData;

  const headers: Record<string, string> = {
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers as Record<string, string>),
  };

  let response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  // Handle 401 Unauthorized with token refresh rotation
  if (response.status === 401 && !endpoint.includes('/auth/refresh') && !endpoint.includes('/auth/login') && !endpoint.includes('/verify-otp')) {
    const refreshToken = localStorage.getItem('nlams_refresh_token');
    if (refreshToken) {
      try {
        const refreshRes = await fetch(`${BASE_URL}/auth/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refresh_token: refreshToken }),
        });
        if (refreshRes.ok) {
          const refreshData = await refreshRes.json();
          if (refreshData.access_token) {
            localStorage.setItem('nlams_access_token', refreshData.access_token);
            if (refreshData.refresh_token) {
              localStorage.setItem('nlams_refresh_token', refreshData.refresh_token);
            }
            // Retry original request with new access token
            headers.Authorization = `Bearer ${refreshData.access_token}`;
            response = await fetch(`${BASE_URL}${endpoint}`, {
              ...options,
              headers,
            });
          }
        }
      } catch (err) {
        console.warn('Token refresh failed:', err);
      }
    }
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    let errorMessage = `HTTP Error ${response.status}`;
    if (typeof data.detail === 'string') {
      errorMessage = data.detail;
    } else if (Array.isArray(data.detail) && data.detail.length > 0) {
      errorMessage = data.detail.map((err: { msg?: string }) => err.msg || 'Invalid field').join(', ');
    } else if (data.message) {
      errorMessage = data.message;
    }
    throw new Error(errorMessage);
  }

  return data as T;
}

// -----------------------------------------------------------------------------
// Domain Types
// -----------------------------------------------------------------------------
export interface UserProfile {
  id: number | string;
  full_name: string;
  email?: string;
  mobile_number?: string;
  designation?: string;
  department_name?: string;
  emp_id?: string;
  roles?: string[];
  role_code?: string;
  jurisdiction_name?: string;
  jurisdiction_id?: number;
  user?: {
    id: number | string;
    full_name: string;
    email?: string;
    department_name?: string;
  };
  active_role?: {
    code: string;
    name?: string;
  };
  active_jurisdiction?: {
    name: string;
  };
}

export interface Proposal {
  id: number | string;
  proposal_code?: string;
  project_title?: string;
  project_name?: string;
  requiring_agency?: string;
  ministry?: string;
  public_purpose?: string;
  description?: string;
  estimated_budget_inr?: number;
  required_area_ha?: number;
  total_area_ha?: number;
  total_area_sqm?: number;
  total_area_hectares?: number;
  target_district_id?: number;
  districts?: string[];
  state?: string;
  current_stage?: string | number;
  status?: string;
  conflict_status?: string;
  conflict_notes?: string;
  structural_conflict_status?: string;
  multiplier_compliance_verified?: boolean;
  sec11_notification_no?: string;
  sec11_published_at?: string;
  sec11_objection_deadline?: string;
  sec19_declaration_no?: string;
  sec19_published_at?: string;
  award_order_no?: string;
  award_declaration_date?: string;
  total_disbursed_inr?: number;
  compensation_disbursed_at?: string;
  possession_certificate_no?: string;
  possession_handed_over_at?: string;
  pia_accepted_at?: string;
  pia_acceptance_notes?: string;
  parcels_count?: number;
  dpr_count?: number;
  assigned_collector?: string;
  appointed_cala?: string;
  appointment_order_no?: string;
  gazette_notification_number?: string;
  gazette_date?: string;
  estimated_compensation_cr?: number;
  dpr_file_url?: string;
  gis_boundary_file_url?: string;
  comments?: string;
  created_at?: string;
  updated_at?: string;
}

export interface LandParcelRecord {
  id: number;
  proposal_id: number;
  survey_number: string;
  gut_number?: string;
  sub_division?: string;
  village_name: string;
  taluka_name: string;
  district_name: string;
  land_category: string;
  total_area_ha: number;
  affected_area_ha: number;
  owner_name: string;
  aadhaar_vault_ref?: string;
  khatedar_count: number;
  khasra_roster_json?: string;
  data_source: string;
  api_version: string;
  is_frozen: boolean;
  created_at: string;
}

export interface EscrowAccountSummary {
  account_number: string;
  bank_name: string;
  ifsc_code: string;
  total_sanctioned_inr: number;
  deposited_inr: number;
  disbursed_inr: number;
  balance_inr: number;
  burn_rate_pct: number;
  replenishment_threshold_inr: number;
  is_replenishment_needed: boolean;
  status: string;
  last_updated?: string;
}

export interface Section11Notice {
  id?: number;
  proposal_id: number;
  gazette_notification_no: string;
  published_date: string;
  status?: string;
  message?: string;
  days_remaining_in_objection_window?: number;
  total_restricted_parcels_count?: number;
  is_registry_restriction_active?: boolean;
}

export interface Section15ObjectionRecord {
  id: number;
  proposal_id: number;
  citizen_user_id?: number;
  survey_number: string;
  village_name: string;
  objector_name: string;
  objection_category: string;
  description: string;
  parcel_id?: number;
  supporting_document_url?: string;
  hearing_date?: string;
  hearing_location?: string;
  disposal_status: string;
  disposal_order_no?: string;
  disposal_order_summary?: string;
  created_at: string;
}

export interface StatutoryAwardRecord {
  id: number;
  proposal_id: number;
  parcel_id: number;
  market_value_base_inr: number;
  multiplied_market_value_inr: number;
  solatium_100_pct_inr: number;
  additional_interest_12_pct_inr: number;
  structures_cost_inr: number;
  trees_cost_inr: number;
  crops_cost_inr: number;
  total_statutory_award_inr: number;
  is_rural: boolean;
  multiplier_factor: number;
  award_status: string;
  award_order_no?: string;
  declaration_date?: string;
  created_at: string;
}

export interface AffectedFamilyRecord {
  id: number;
  proposal_id: number;
  family_head_name: string;
  village_name: string;
  category: string;
  primary_livelihood_source: string;
  caste_category: string;
  is_scheduled_area_displacement: boolean;
  is_bpl: boolean;
  family_members_count: number;
  dependency_years: number;
  ration_card_no?: string;
  associated_survey_number?: string;
  created_at: string;
}

export interface EntitlementPackageRecord {
  id: number;
  proposal_id: number;
  family_id: number;
  is_rural: boolean;
  constructed_house_allotted: boolean;
  monthly_subsistence_grant_inr: number;
  subsistence_duration_months: number;
  one_time_resettlement_allowance_inr: number;
  transport_allowance_inr: number;
  total_package_value_inr: number;
  status: string;
  approved_by_user_id?: number;
  approval_notes?: string;
  created_at: string;
}

export interface CommunityAssetRecord {
  id: number;
  proposal_id: number;
  village_name: string;
  asset_name: string;
  asset_category: string;
  survey_number?: string;
  affected_extent: string;
  estimated_restoration_cost_inr: number;
  pwd_valuation_ref?: string;
  statutory_amenity_code?: string;
  reconstruction_site_details?: string;
  status: string;
  created_at: string;
}

export interface SurveyTaskRecord {
  id: number;
  task_id: string;
  parcel_id: number;
  proposal_id: number;
  survey_number: string;
  village_name: string;
  taluka_name: string;
  district_name: string;
  owner_name: string;
  official_area_ha: number;
  status: string;
  variance_pct: number;
  evidence_count: number;
  is_verified: boolean;
  assigned_to: string;
  due_date: string;
  polygon_coordinates?: number[][];
}

// -----------------------------------------------------------------------------
// -----------------------------------------------------------------------------
// 1. Authentication & Session Security
// -----------------------------------------------------------------------------
export interface AuthResponse {
  access_token: string;
  refresh_token?: string;
  token_type?: string;
  user?: UserProfile;
  role?: { code?: string; name?: string };
  active_role?: { code?: string; name?: string };
  jurisdiction?: { id?: number; name?: string; code?: string };
}

export const authApi = {
  requestOfficialOTP: (email: string, deviceId?: string) =>
    apiRequest<{ message: string; identifier_masked: string; expires_in_seconds: number; cooldown_seconds: number; provider: string }>(
      '/auth/official/request-otp',
      {
        method: 'POST',
        body: JSON.stringify({ email, device_id: deviceId }),
      }
    ),

  verifyOfficialOTP: (email: string, otp: string, deviceId?: string) =>
    apiRequest<AuthResponse>(
      '/auth/official/verify-otp',
      {
        method: 'POST',
        body: JSON.stringify({ email, otp, device_id: deviceId }),
      }
    ),

  requestCitizenOTP: (identifier: string, provider: string = 'email_otp') =>
    apiRequest<{ message: string; identifier_masked: string; expires_in_seconds: number; cooldown_seconds: number; provider: string }>(
      '/auth/citizen/request-otp',
      {
        method: 'POST',
        body: JSON.stringify({
          ...(identifier.includes('@') ? { email: identifier } : { mobile_number: identifier }),
          provider,
        }),
      }
    ),

  verifyCitizenOTP: (identifier: string, otp: string, provider: string = 'email_otp', deviceId?: string) =>
    apiRequest<AuthResponse>(
      '/auth/citizen/verify-otp',
      {
        method: 'POST',
        body: JSON.stringify({ identifier, otp, provider, device_id: deviceId }),
      }
    ),

  getMe: () => apiRequest<UserProfile>('/auth/me'),

  refreshToken: (refreshToken: string) =>
    apiRequest<AuthResponse>('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refresh_token: refreshToken }),
    }),

  logout: (refreshToken?: string) =>
    apiRequest<{ message: string; success: boolean }>('/auth/logout', {
      method: 'POST',
      body: JSON.stringify({ refresh_token: refreshToken || localStorage.getItem('nlams_refresh_token') }),
    }),

  loginCitizen: (mobileNumber: string, otp: string = '123456') =>
    apiRequest<AuthResponse>('/auth/login/citizen', {
      method: 'POST',
      body: JSON.stringify({ mobile_number: mobileNumber, otp }),
    }),

  loginOfficial: (empIdOrEmail: string, password?: string, otp?: string) =>
    apiRequest<AuthResponse>('/auth/login/official', {
      method: 'POST',
      body: JSON.stringify({
        ...(empIdOrEmail.includes('@') ? { email: empIdOrEmail } : { emp_id: empIdOrEmail }),
        password: password || 'Password@123',
        otp: otp || '123456',
      }),
    }),
};

// -----------------------------------------------------------------------------
// 2. Proposals & Requisition Gateway (PIA)
// -----------------------------------------------------------------------------
export const proposalsApi = {
  fetchProposals: (agency?: string, statusFilter?: string, districtId?: number) => {
    const params = new URLSearchParams();
    if (agency) params.append('agency', agency);
    if (statusFilter) params.append('status_filter', statusFilter);
    if (districtId) params.append('district_id', districtId.toString());
    return apiRequest<Proposal[]>(`/proposals/?${params.toString()}`);
  },

  getProposal: (id: string | number) =>
    apiRequest<Proposal>(`/proposals/${id}`),

  createProposal: (data: {
    project_title: string;
    requiring_agency: string;
    ministry: string;
    public_purpose: string;
    estimated_budget_inr: number;
    required_area_ha: number;
    target_district_id?: number;
    target_taluka_ids?: string;
    description?: string;
  }) =>
    apiRequest<Proposal>('/proposals/', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  uploadDpr: (proposalId: string | number, formData: FormData) =>
    apiRequest<{ id: number; message: string; file_path: string }>(`/proposals/${proposalId}/dpr`, {
      method: 'POST',
      body: formData,
    }),

  uploadKml: (proposalId: string | number, formData?: FormData) =>
    apiRequest<{ message: string; extracted_parcels_count: number; gis_corridor_id: number }>(`/proposals/${proposalId}/kml`, {
      method: 'POST',
      body: formData || JSON.stringify({}),
    }),

  fetchParcels: (proposalId: string | number) =>
    apiRequest<LandParcelRecord[]>(`/proposals/${proposalId}/parcels`),

  submitToState: (proposalId: string | number) =>
    apiRequest<Proposal>(`/proposals/${proposalId}/submit`, { method: 'POST' }),

  submitStateScrutiny: (
    proposalId: string | number,
    statusOrObj: 'APPROVED' | 'REJECTED' | 'NO_CONFLICT' | { action?: string; conflict_status?: string; remarks?: string; conflict_notes?: string; approved?: boolean } = 'APPROVED',
    notes?: string
  ) => {
    let payload: any;
    if (typeof statusOrObj === 'string') {
      payload = {
        conflict_status: statusOrObj === 'NO_CONFLICT' ? 'NO_CONFLICT' : (statusOrObj === 'APPROVED' ? 'APPROVED' : 'CONFLICTS_FLAGGED'),
        conflict_notes: notes || 'State scrutiny completed.',
        multiplier_verified: true,
        approved: statusOrObj !== 'REJECTED',
      };
    } else {
      const isApprove = statusOrObj.action === 'APPROVED' || statusOrObj.approved === true;
      payload = {
        conflict_status: statusOrObj.conflict_status || (isApprove ? 'APPROVED' : 'CLARIFICATION_REQUESTED'),
        conflict_notes: statusOrObj.remarks || statusOrObj.conflict_notes || 'State scrutiny processed.',
        multiplier_verified: true,
        approved: isApprove,
      };
    }
    return apiRequest<Proposal>(`/proposals/${proposalId}/state-scrutiny`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
};

// -----------------------------------------------------------------------------
// 3. State Land Registry & Multipliers Gateway
// -----------------------------------------------------------------------------
export const stateGatewayApi = {
  fetchPendingProposals: (stageFilter?: string) => {
    const params = new URLSearchParams();
    if (stageFilter) params.append('stage_filter', stageFilter);
    return apiRequest<Proposal[]>(`/state-gateway/proposals?${params.toString()}`);
  },

  scrutinizeProposal: (proposalId: string | number, data: {
    conflict_status: string;
    conflict_notes?: string;
    multiplier_verified?: boolean;
    approved?: boolean;
  }) =>
    apiRequest<Proposal>(`/state-gateway/proposals/${proposalId}/scrutinize`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  assignCala: (data: {
    proposal_id: string | number;
    district_id?: number;
    collector_user_id?: number;
    gazette_notification_ref?: string;
    district_collector_name?: string;
    la_officer_name?: string;
    appointment_order_no?: string;
  }) =>
    apiRequest<any>('/state-gateway/assign-cala', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  lookupLandRegistry: (stateCode: string, surveyNo: string, taluka?: string, village?: string) =>
    apiRequest<any>(`/state-gateway/land-registry/${stateCode}/survey/${encodeURIComponent(surveyNo)}?taluka=${taluka || 'Haveli'}&village=${village || 'Wagholi'}`),

  bulkVerifyRegistry: (surveyNumbers: string[], stateCode: string = 'MH') =>
    apiRequest<any>('/state-gateway/land-registry/bulk-verify', {
      method: 'POST',
      body: JSON.stringify({ survey_numbers: surveyNumbers, state_code: stateCode }),
    }),

  getMultipliers: (stateCode: string) =>
    apiRequest<any>(`/state-gateway/multipliers/${stateCode}`),

  fetchMultipliers: (stateCode: string) =>
    apiRequest<any>(`/state-gateway/multipliers/${stateCode}`),

  updateMultipliers: (data: any) =>
    apiRequest<any>('/state-gateway/multipliers', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

// -----------------------------------------------------------------------------
// 4. Escrow Management
// -----------------------------------------------------------------------------
export const escrowApi = {
  getEscrowByProposal: (proposalId: string | number) =>
    apiRequest<EscrowAccountSummary>(`/escrow/proposal/${proposalId}`),

  depositFunds: (accountOrProposalId: string | number, amount: number) =>
    apiRequest<EscrowAccountSummary>(`/escrow/${accountOrProposalId}/deposit`, {
      method: 'POST',
      body: JSON.stringify({ amount }),
    }),

  createEscrowAccount: (proposalId: string | number) =>
    apiRequest<any>('/escrow/create-account', {
      method: 'POST',
      body: JSON.stringify({ proposal_id: Number(proposalId) }),
    }),

  getBalance: (accountNumber: string) =>
    apiRequest<{ account_number: string; live_balance_inr: number; is_replenishment_needed: boolean }>(`/escrow/${accountNumber}/balance`),
};

// -----------------------------------------------------------------------------
// 5. CALA Statutory Adjudication & Valuation
// -----------------------------------------------------------------------------
export const adjudicationApi = {
  issueSection11: (data: {
    proposal_id: number;
    gazette_notification_no: string;
    public_notice_summary: string;
  }) =>
    apiRequest<Section11Notice>('/adjudication/section11-notification', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getSection11Status: (proposalId: string | number) =>
    apiRequest<Section11Notice>(`/adjudication/section11/${proposalId}`),

  publishSection11: (notificationId: string | number) =>
    apiRequest<{ message: string; gazette_number: string; published_at: string }>(`/adjudication/section11/${notificationId}/publish`, {
      method: 'POST',
    }),

  freezeParcels: (parcelIds: number[]) =>
    apiRequest<{ message: string; frozen_count: number; freeze_timestamp: string }>('/adjudication/parcels/freeze-interim', {
      method: 'POST',
      body: JSON.stringify({ parcel_ids: parcelIds }),
    }),

  fetchObjections: (proposalId: string | number) =>
    apiRequest<Section15ObjectionRecord[]>(`/adjudication/objections/proposal/${proposalId}`),

  createObjection: (data: {
    proposal_id: number;
    survey_number: string;
    village_name: string;
    objector_name: string;
    objection_category: string;
    description: string;
    parcel_id?: number;
    supporting_document_url?: string;
  }) =>
    apiRequest<Section15ObjectionRecord>('/adjudication/objections', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  recordHearing: (objectionId: string | number, hearingDate: string, location?: string) =>
    apiRequest<Section15ObjectionRecord>(`/adjudication/objections/${objectionId}/hearing`, {
      method: 'POST',
      body: JSON.stringify({ hearing_date: hearingDate, hearing_location: location || 'Tehsil Office' }),
    }),

  ruleObjection: (objectionId: string | number, rulingStatus: 'UPHELD' | 'DISMISSED', reasoning: string) =>
    apiRequest<Section15ObjectionRecord>(`/adjudication/objections/${objectionId}/ruling`, {
      method: 'POST',
      body: JSON.stringify({ ruling_status: rulingStatus, reasoning }),
    }),

  calculateValuation: (data: {
    circle_rate_inr_per_ha: number;
    area_acquired_ha: number;
    is_rural: boolean;
    distance_urban_km: number;
    structures_inr?: number;
    trees_inr?: number;
    crops_inr?: number;
    notification_months?: number;
  }) =>
    apiRequest<any>('/adjudication/valuation/calculate-statutory-solatium', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  pronounceAward: (data: {
    proposal_id: number;
    award_id?: number;
    total_award_inr?: number;
    declaration_notes?: string;
  }) =>
    apiRequest<{ id: number; award_order_no: string; total_compensation_payable_inr: number; status: string; message: string }>('/adjudication/awards/pronounce-section23-award', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  fetchAwards: (proposalId: string | number) =>
    apiRequest<StatutoryAwardRecord[]>(`/adjudication/awards/proposal/${proposalId}`),
};

// -----------------------------------------------------------------------------
// 6. R&R Social Welfare & Entitlements
// -----------------------------------------------------------------------------
export const rnrApi = {
  fetchCensus: (proposalId: string | number) =>
    apiRequest<AffectedFamilyRecord[]>(`/rnr/census/proposal/${proposalId}`),

  registerFamily: (data: {
    proposal_id: number;
    family_head_name: string;
    village_name: string;
    category: string;
    primary_livelihood_source: string;
    caste_category: string;
    is_scheduled_area_displacement: boolean;
    is_bpl: boolean;
    family_members_count: number;
    dependency_years: number;
    ration_card_no?: string;
    associated_survey_number?: string;
  }) =>
    apiRequest<AffectedFamilyRecord>('/rnr/census/families', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  generatePackages: (proposalId: string | number) =>
    apiRequest<{ message: string; proposal_id: number; generated_count: number }>('/rnr/entitlements/generate-packages', {
      method: 'POST',
      body: JSON.stringify({ proposal_id: Number(proposalId) }),
    }),

  fetchEntitlements: (proposalId: string | number) =>
    apiRequest<EntitlementPackageRecord[]>(`/rnr/proposals/${proposalId}/entitlements`),

  approvePackage: (packageId: string | number, notes?: string) =>
    apiRequest<EntitlementPackageRecord>(`/rnr/entitlements/${packageId}/approve`, {
      method: 'POST',
      body: JSON.stringify({ approval_notes: notes || 'Approved under RFCTLARR Schedule II.' }),
    }),

  fetchCommunityAssets: (proposalId: string | number) =>
    apiRequest<CommunityAssetRecord[]>(`/rnr/community-assets/proposal/${proposalId}`),

  createCommunityAsset: (data: {
    proposal_id: number;
    village_name: string;
    asset_name: string;
    asset_category: string;
    survey_number?: string;
    affected_extent: string;
    estimated_restoration_cost_inr: number;
    pwd_valuation_ref?: string;
    reconstruction_site_details?: string;
  }) =>
    apiRequest<CommunityAssetRecord>('/rnr/community-assets', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateCommunityAssetStatus: (assetId: string | number, statusVal: string) =>
    apiRequest<any>(`/rnr/community-assets/${assetId}/update-status`, {
      method: 'POST',
      body: JSON.stringify({ status: statusVal }),
    }),

  disburseLandCompensation: (data: {
    proposal_id: number;
    award_id: number;
    amount_inr?: number;
    beneficiary_name?: string;
    bank_account_no?: string;
    bank_ifsc_code?: string;
    bank_name?: string;
  }) =>
    apiRequest<any>('/rnr/payments/disburse-compensation', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  disburseRnrBenefit: (data: {
    proposal_id: number;
    entitlement_id?: number;
    family_id?: number;
    entitlement_package_id?: number;
    amount_inr?: number;
    benefit_type?: string;
    beneficiary_name?: string;
  }) =>
    apiRequest<any>('/rnr/payments/disburse-rnr', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  fetchDisbursalLedger: (proposalId: string | number) =>
    apiRequest<any>(`/rnr/payments/proposal/${proposalId}/ledger`),
};

// -----------------------------------------------------------------------------
// 7. Field Surveyor Toolkit
// -----------------------------------------------------------------------------
export const surveyorApi = {
  fetchTasks: () =>
    apiRequest<SurveyTaskRecord[]>('/surveyor/tasks'),

  submitBoundaryWalk: (data: {
    task_id?: string;
    parcel_id?: number;
    official_area_ha?: number;
    measured_area_ha?: number;
    coordinates?: number[][];
    coordinates_geojson?: string;
    surveyor_notes?: string;
  }) =>
    apiRequest<{ task_id: string; computed_area_ha: number; variance_pct: number; is_within_tolerance: boolean; message: string }>('/surveyor/boundary-walk', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  submitAssetEvidence: (data: {
    task_id: string;
    category: string;
    count: number;
    estimated_value_inr: number;
    latitude: number;
    longitude: number;
    photo_url?: string;
  }) =>
    apiRequest<any>('/surveyor/asset-evidence', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  batchSync: (items: any[]) =>
    apiRequest<{ message: string; synced_count: number; sync_status: string }>('/surveyor/batch-sync', {
      method: 'POST',
      body: JSON.stringify({ items }),
    }),

  verifySurvey: (data: {
    task_id: string;
    verification_status: string;
    remarks?: string;
  }) =>
    apiRequest<{ task_id: string; verification_status: string; verified_by: string; verified_at: string }>('/surveyor/verify', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getProposalSurveySummary: (proposalId: string | number) =>
    apiRequest<{ proposal_id: number; total_tasks: number; completed_tasks: number; in_progress_tasks: number; pending_tasks: number; verified_tasks: number; avg_variance_pct: number }>(`/surveyor/proposal/${proposalId}/summary`),
};

// -----------------------------------------------------------------------------
// 8. Possession, Digital Mutation & Handover
// -----------------------------------------------------------------------------
export const possessionApi = {
  checkReadiness: (proposalId: string | number) =>
    apiRequest<{
      proposal_id: number;
      is_ready_for_possession: boolean;
      award_pronounced: boolean;
      compensation_disbursed_pct: number;
      panchnama_completed: boolean;
      certificate_issued: boolean;
      mutation_executed: boolean;
      pia_accepted: boolean;
      current_stage: string;
    }>(`/possession/readiness/${proposalId}`),

  createPanchnama: (data: {
    proposal_id: number;
    panchas?: string[];
    witnesses?: string[];
    notes?: string;
  }) =>
    apiRequest<any>('/possession/create-panchnama', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  issueCertificate: (data: { proposal_id: number }) =>
    apiRequest<{ certificate_number: string; proposal_id: number; issued_by: string; advancement_stage: string; message: string }>('/possession/issue-certificate', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  executeDigitalMutation: (data: { proposal_id: number; requiring_agency?: string }) =>
    apiRequest<{ mutation_entry_no: string; proposal_id: number; is_simulated: boolean; simulation_banner: string; interim_freeze_lifted: boolean; message: string }>('/possession/execute-digital-mutation', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  piaHandoverAction: (data: { proposal_id: number; action: 'ACCEPT' | 'DEFECT_FLAGGED'; notes?: string }) =>
    apiRequest<{ proposal_id: number; action: string; current_stage: string; message: string }>('/possession/pia-handover-action', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  completeProject: (data: { proposal_id: number }) =>
    apiRequest<{ proposal_id: number; status: string; current_stage: string; sha256_audit_dossier_seal: string; message: string }>('/possession/complete-project', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

// -----------------------------------------------------------------------------
// 9. Citizen Portal
// -----------------------------------------------------------------------------
export interface CitizenProjectItem {
  id: number;
  name: string;
  proposal_code: string;
  requiring_agency: string;
  status: string;
  location: { lat: number; lng: number };
  required_area_ha: number;
  estimated_budget_inr: number;
}

export const citizenApi = {
  fetchCitizenProjects: (page: number = 1, pageSize: number = 20) =>
    apiRequest<{ items: CitizenProjectItem[]; total: number }>(`/citizen/projects?page=${page}&size=${pageSize}`),

  fetchProjectLocation: (projectId: number) =>
    apiRequest<{ lat: number; lng: number }>(`/citizen/projects/${projectId}/location`),

  fetchMyNotices: () =>
    apiRequest<any[]>('/citizen/my-notices'),

  submitObjection: (data: {
    proposal_id?: number;
    survey_number: string;
    village_name: string;
    objector_name: string;
    objection_category: string;
    description: string;
    supporting_document_url?: string;
  }) =>
    apiRequest<any>('/citizen/objections', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

// -----------------------------------------------------------------------------
// 10. National Overview Analytics (Central)
// -----------------------------------------------------------------------------
export const analyticsApi = {
  getNationalSummary: () =>
    apiRequest<{
      kpis: {
        total_projects: number;
        total_acquired_ha: number;
        total_disbursed_inr: number;
        total_budget_inr: number;
        sla_breach_count: number;
        sla_compliance_rate_pct: number;
        total_parcels_managed: number;
        total_paf_rehabilitated: number;
      };
      stage_distribution: Record<string, number>;
      state_performance: Array<{
        state_code: string;
        state_name: string;
        total_projects: number;
        acquired_ha: number;
        disbursed_cr: number;
        sla_compliance_pct: number;
        active_disputes: number;
        status: string;
      }>;
      sla_alerts: Array<{
        id: string;
        proposal_code: string;
        project_title: string;
        stage: string;
        days_in_stage: number;
        sla_limit_days: number;
        severity: string;
        message: string;
      }>;
      critical_projects: Proposal[];
    }>('/proposals/analytics/national-summary'),
};
