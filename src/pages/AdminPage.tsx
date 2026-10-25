import React, { useState, useEffect } from 'react';
import {
  Lock,
  LogOut,
  Calendar,
  MessageSquare,
  PhoneCall,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Trash2,
  Phone,
  Eye,
  Settings,
  ShieldAlert,
  UserCheck,
  AlertTriangle,
  AlertCircle,
  RefreshCw,
  X,
  Save,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import {
  getAppointments,
  getConversations,
  updateAppointmentStatus,
  deleteAppointment,
  updateConversationStatus,
  deleteConversation,
  AppointmentRecord,
  ConversationRecord,
} from '../firebase/firestoreService';
import { GbpSeoChecklist } from '../components/seo/GbpSeoChecklist';

export const AdminPage: React.FC = () => {
  const {
    currentUser,
    isAdmin,
    loading: authLoading,
    authError,
    unauthorizedDomain,
    clearAuthError,
    loginWithGoogle,
    logout,
  } = useAuth();
  const [copiedDomain, setCopiedDomain] = useState(false);
  const { clinicInfo, updateClinicInfo } = useSettings();

  // Active tab
  const [activeTab, setActiveTab] = useState<'appointments' | 'conversations' | 'settings' | 'seo'>('appointments');

  // Data
  const [appointments, setAppointments] = useState<AppointmentRecord[]>([]);
  const [conversations, setConversations] = useState<ConversationRecord[]>([]);
  const [isLoadingData, setIsLoadingData] = useState<boolean>(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sessionFilter, setSessionFilter] = useState('all');

  // Selected Detail Modal
  const [selectedAppointment, setSelectedAppointment] = useState<AppointmentRecord | null>(null);
  const [selectedConversation, setSelectedConversation] = useState<ConversationRecord | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [staffNote, setStaffNote] = useState('');

  // Settings edit form
  const [settingsForm, setSettingsForm] = useState({
    phoneNumber: clinicInfo.phoneNumber || '',
    whatsappNumber: clinicInfo.whatsappNumber || '',
    isPhoneVerified: clinicInfo.isPhoneVerified || false,
    isWhatsAppVerified: clinicInfo.isWhatsAppVerified || false,
    doctorName: clinicInfo.doctorName || '',
    doctorQualifications: clinicInfo.doctorQualifications || '',
    doctorRegistration: clinicInfo.doctorRegistration || '',
    doctorBio: clinicInfo.doctorBio || '',
    isDoctorVerified: clinicInfo.isDoctorVerified || false,
    openingHours: clinicInfo.openingHours || '',
    isHoursVerified: clinicInfo.isHoursVerified || false,
  });
  const [settingsSaveSuccess, setSettingsSaveSuccess] = useState(false);
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  useEffect(() => {
    if (currentUser && isAdmin) {
      loadDashboardData();
    }
  }, [currentUser, isAdmin]);

  const loadDashboardData = async () => {
    setIsLoadingData(true);
    setFetchError(null);
    try {
      const [apts, convs] = await Promise.all([
        getAppointments(),
        getConversations(),
      ]);
      setAppointments(apts);
      setConversations(convs);
    } catch (err) {
      console.error('Failed to load admin records:', err);
      setFetchError(
        'Could not load records. Ensure you are signed in with an authorized clinic administrator account.'
      );
    } finally {
      setIsLoadingData(false);
    }
  };

  // Metrics (derived from real records, no fake stats)
  const totalAppointments = appointments.length;
  const newAppointments = appointments.filter((a) => a.status === 'new').length;
  const totalConversations = conversations.length;
  const chatConversations = conversations.filter((c) => c.sessionType === 'Chat').length;
  const voiceConversations = conversations.filter((c) => c.sessionType === 'Voice Call').length;
  const pendingFollowups = conversations.filter((c) => c.followUpStatus === 'new').length;

  // Filtered Appointments
  const filteredAppointments = appointments.filter((apt) => {
    const matchesSearch =
      apt.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      apt.mobileNumber.includes(searchQuery);
    const matchesStatus = statusFilter === 'all' || apt.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Filtered Conversations
  const filteredConversations = conversations.filter((conv) => {
    const nameMatch = conv.patientName?.toLowerCase().includes(searchQuery.toLowerCase()) || false;
    const phoneMatch = conv.mobileNumber?.includes(searchQuery) || false;
    const transcriptMatch = conv.transcript.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSearch = !searchQuery || nameMatch || phoneMatch || transcriptMatch;

    const matchesStatus = statusFilter === 'all' || conv.followUpStatus === statusFilter;
    const matchesSession = sessionFilter === 'all' || conv.sessionType === sessionFilter;

    return matchesSearch && matchesStatus && matchesSession;
  });

  // Update Appointment
  const handleUpdateAptStatus = async (id: string, newStatus: AppointmentRecord['status']) => {
    setUpdatingStatus(true);
    try {
      await updateAppointmentStatus(id, newStatus, staffNote || undefined);
      setAppointments((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status: newStatus, notes: staffNote || a.notes } : a))
      );
      if (selectedAppointment) {
        setSelectedAppointment((prev) =>
          prev ? { ...prev, status: newStatus, notes: staffNote || prev.notes } : null
        );
      }
    } catch (e) {
      console.error('Update appointment failed', e);
    } finally {
      setUpdatingStatus(false);
    }
  };

  // Delete Appointment
  const handleDeleteApt = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this appointment request? This action cannot be undone.')) return;
    try {
      await deleteAppointment(id);
      setAppointments((prev) => prev.filter((a) => a.id !== id));
      setSelectedAppointment(null);
    } catch (e) {
      console.error('Delete failed', e);
    }
  };

  // Update Conversation
  const handleUpdateConvStatus = async (id: string, newStatus: ConversationRecord['followUpStatus']) => {
    setUpdatingStatus(true);
    try {
      await updateConversationStatus(id, newStatus, staffNote || undefined);
      setConversations((prev) =>
        prev.map((c) => (c.id === id ? { ...c, followUpStatus: newStatus, notes: staffNote || c.notes } : c))
      );
      if (selectedConversation) {
        setSelectedConversation((prev) =>
          prev ? { ...prev, followUpStatus: newStatus, notes: staffNote || prev.notes } : null
        );
      }
    } catch (e) {
      console.error('Update conversation failed', e);
    } finally {
      setUpdatingStatus(false);
    }
  };

  // Delete Conversation
  const handleDeleteConv = async (id: string) => {
    if (!window.confirm('Delete this patient conversation record? This will permanently delete the transcript.')) return;
    try {
      await deleteConversation(id);
      setConversations((prev) => prev.filter((c) => c.id !== id));
      setSelectedConversation(null);
    } catch (e) {
      console.error('Delete failed', e);
    }
  };

  // Save Settings
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingSettings(true);
    setSettingsSaveSuccess(false);
    try {
      await updateClinicInfo({
        phoneNumber: settingsForm.phoneNumber.trim() || null,
        whatsappNumber: settingsForm.whatsappNumber.trim() || null,
        isPhoneVerified: settingsForm.isPhoneVerified,
        isWhatsAppVerified: settingsForm.isWhatsAppVerified,
        doctorName: settingsForm.doctorName.trim() || null,
        doctorQualifications: settingsForm.doctorQualifications.trim() || null,
        doctorRegistration: settingsForm.doctorRegistration.trim() || null,
        doctorBio: settingsForm.doctorBio.trim() || null,
        isDoctorVerified: settingsForm.isDoctorVerified,
        openingHours: settingsForm.openingHours.trim() || null,
        isHoursVerified: settingsForm.isHoursVerified,
      });
      setSettingsSaveSuccess(true);
      setTimeout(() => setSettingsSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to update clinic settings:', err);
    } finally {
      setIsSavingSettings(false);
    }
  };

  // Unauthenticated or not admin view
  if (!currentUser || !isAdmin) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-md text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center mx-auto border border-teal-200">
          <Lock className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-slate-900 font-heading">
            Staff & Administrator Portal
          </h1>
          <p className="text-xs text-slate-600 leading-relaxed">
            Authorized clinic staff only. Please authenticate with your Google Workspace or authorized clinic email to view appointments and consultation transcripts.
          </p>
        </div>

        {authError && (
          <div className="bg-rose-50 border border-rose-200 p-4 rounded-2xl text-xs text-rose-900 text-left space-y-2">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-1.5 font-bold text-rose-700">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>Google Sign-In Error</span>
              </div>
              <button
                onClick={clearAuthError}
                className="text-xs text-rose-500 hover:text-rose-800 underline"
              >
                Dismiss
              </button>
            </div>
            <p className="text-rose-800 leading-relaxed">{authError}</p>
            {unauthorizedDomain && (
              <div className="bg-white/80 p-3 rounded-xl border border-rose-200 space-y-2 mt-2">
                <p className="font-semibold text-rose-950">Quick Fix for Vercel:</p>
                <ol className="list-decimal list-inside space-y-1 text-slate-700">
                  <li>Open <strong>Firebase Console &gt; Authentication &gt; Settings</strong></li>
                  <li>Scroll to <strong>Authorized domains</strong> and click <strong>Add domain</strong></li>
                  <li>Add your current Vercel domain:</li>
                </ol>
                <div className="flex items-center gap-2 pt-1">
                  <code className="bg-slate-100 text-slate-800 px-2 py-1 rounded font-mono text-xs flex-1 truncate">
                    {unauthorizedDomain}
                  </code>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(unauthorizedDomain);
                      setCopiedDomain(true);
                      setTimeout(() => setCopiedDomain(false), 2500);
                    }}
                    className="px-3 py-1 bg-teal-700 hover:bg-teal-800 text-white font-medium text-xs rounded-lg transition-colors cursor-pointer shrink-0"
                  >
                    {copiedDomain ? 'Copied!' : 'Copy Domain'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {currentUser && !isAdmin && (
          <div className="bg-amber-50 border border-amber-200 p-3.5 rounded-xl text-xs text-amber-900 text-left">
            <p className="font-semibold mb-1">Access Restricted:</p>
            <p>
              Signed in as <span className="font-mono">{currentUser.email}</span>, but this account is not recognized as an authorized clinic administrator.
            </p>
          </div>
        )}

        <div className="space-y-3">
          <button
            onClick={loginWithGoogle}
            disabled={authLoading}
            className="w-full py-3 px-4 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs shadow-md transition-all active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
          >
            <UserCheck className="w-4 h-4" />
            <span>Sign In with Google</span>
          </button>

          {currentUser && (
            <button
              onClick={logout}
              className="w-full py-2.5 text-xs text-slate-500 hover:text-slate-700 transition-colors"
            >
              Sign Out
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 py-10 space-y-8 text-left">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white border border-slate-200 p-6 rounded-3xl shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-md border border-teal-200">
              Admin Portal
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs text-slate-600 font-mono">{currentUser.email}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-heading">
            Indian Dental Clinic Dashboard
          </h1>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={loadDashboardData}
            disabled={isLoadingData}
            className="p-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors"
            title="Refresh records"
          >
            <RefreshCw className={`w-4 h-4 ${isLoadingData ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={logout}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {fetchError && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-2xl text-xs flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
          <span>{fetchError}</span>
        </div>
      )}

      {/* Real Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs">
          <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Appointments
          </p>
          <p className="text-2xl font-extrabold text-slate-900 mt-1">{totalAppointments}</p>
          <p className="text-[11px] text-teal-700 font-medium mt-0.5">{newAppointments} new</p>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs">
          <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            AI Conversations
          </p>
          <p className="text-2xl font-extrabold text-slate-900 mt-1">{totalConversations}</p>
          <p className="text-[11px] text-teal-700 font-medium mt-0.5">Consented logs</p>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs">
          <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Chat Sessions
          </p>
          <p className="text-2xl font-extrabold text-slate-900 mt-1">{chatConversations}</p>
          <p className="text-[11px] text-slate-500 mt-0.5">Text enquiries</p>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs">
          <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Voice Calls
          </p>
          <p className="text-2xl font-extrabold text-slate-900 mt-1">{voiceConversations}</p>
          <p className="text-[11px] text-slate-500 mt-0.5">Voice consultations</p>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs col-span-2 lg:col-span-1">
          <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Pending Follow-ups
          </p>
          <p className="text-2xl font-extrabold text-amber-600 mt-1">{pendingFollowups}</p>
          <p className="text-[11px] text-slate-500 mt-0.5">Need attention</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-6">
        <button
          onClick={() => setActiveTab('appointments')}
          className={`pb-3 text-xs font-bold transition-all border-b-2 cursor-pointer ${
            activeTab === 'appointments'
              ? 'border-teal-700 text-teal-800'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Appointment Requests ({appointments.length})
        </button>
        <button
          onClick={() => setActiveTab('conversations')}
          className={`pb-3 text-xs font-bold transition-all border-b-2 cursor-pointer ${
            activeTab === 'conversations'
              ? 'border-teal-700 text-teal-800'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          AI Consultations ({conversations.length})
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`pb-3 text-xs font-bold transition-all border-b-2 cursor-pointer ${
            activeTab === 'settings'
              ? 'border-teal-700 text-teal-800'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Clinic Information Settings
        </button>
        <button
          onClick={() => setActiveTab('seo')}
          className={`pb-3 text-xs font-bold transition-all border-b-2 cursor-pointer ${
            activeTab === 'seo'
              ? 'border-teal-700 text-teal-800'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Local SEO &amp; Google Guide
        </button>
      </div>

      {/* TAB 1: APPOINTMENTS TABLE */}
      {activeTab === 'appointments' && (
        <div className="space-y-4">
          {/* Search & Filter Bar */}
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search by patient name or phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-600 focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-xs text-slate-500">Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="text-xs bg-white border border-slate-200 rounded-xl px-3 py-2 focus:outline-none"
              >
                <option value="all">All Statuses</option>
                <option value="new">New</option>
                <option value="contacted">Contacted</option>
                <option value="scheduled">Scheduled</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="p-4">Patient Name</th>
                    <th className="p-4">Mobile Number</th>
                    <th className="p-4">Requested Date</th>
                    <th className="p-4">Time Slot</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Received</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredAppointments.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-slate-500">
                        No appointment requests found matching your filter criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredAppointments.map((apt) => (
                      <tr key={apt.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="p-4 font-bold text-slate-900">{apt.patientName}</td>
                        <td className="p-4 font-mono">
                          <a
                            href={`tel:${apt.mobileNumber}`}
                            className="text-teal-700 hover:underline flex items-center gap-1"
                          >
                            <Phone className="w-3 h-3" />
                            <span>{apt.mobileNumber}</span>
                          </a>
                        </td>
                        <td className="p-4 text-slate-700 font-medium">{apt.preferredDate}</td>
                        <td className="p-4 text-slate-600">{apt.preferredTime || 'Any'}</td>
                        <td className="p-4">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              apt.status === 'new'
                                ? 'bg-amber-100 text-amber-800'
                                : apt.status === 'scheduled'
                                ? 'bg-teal-100 text-teal-800'
                                : apt.status === 'completed'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {apt.status}
                          </span>
                        </td>
                        <td className="p-4 text-slate-500 text-[11px]">
                          {new Date(apt.createdAt).toLocaleDateString([], {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </td>
                        <td className="p-4 text-right space-x-1">
                          <button
                            onClick={() => {
                              setSelectedAppointment(apt);
                              setStaffNote(apt.notes || '');
                            }}
                            className="p-1.5 rounded-lg text-slate-600 hover:text-teal-700 hover:bg-slate-100 transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteApt(apt.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                            title="Delete Request"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: CONVERSATIONS TABLE */}
      {activeTab === 'conversations' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search conversation text, name or phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-600 focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select
                value={sessionFilter}
                onChange={(e) => setSessionFilter(e.target.value)}
                className="text-xs bg-white border border-slate-200 rounded-xl px-3 py-2 focus:outline-none"
              >
                <option value="all">All Session Types</option>
                <option value="Chat">Chat</option>
                <option value="Voice Call">Voice Call</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="text-xs bg-white border border-slate-200 rounded-xl px-3 py-2 focus:outline-none"
              >
                <option value="all">All Follow-up Status</option>
                <option value="new">New</option>
                <option value="contacted">Contacted</option>
                <option value="appointment_requested">Appointment Requested</option>
                <option value="completed">Completed</option>
                <option value="closed">Closed</option>
              </select>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="p-4">Session Type</th>
                    <th className="p-4">Patient / Caller</th>
                    <th className="p-4">Category</th>
                    <th className="p-4">Summary</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Date</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredConversations.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-slate-500">
                        No conversation records found matching your filter criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredConversations.map((conv) => (
                      <tr key={conv.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="p-4">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                              conv.sessionType === 'Voice Call'
                                ? 'bg-purple-100 text-purple-800'
                                : 'bg-teal-100 text-teal-800'
                            }`}
                          >
                            {conv.sessionType === 'Voice Call' ? (
                              <PhoneCall className="w-3 h-3" />
                            ) : (
                              <MessageSquare className="w-3 h-3" />
                            )}
                            <span>{conv.sessionType}</span>
                          </span>
                        </td>
                        <td className="p-4 font-bold text-slate-900">
                          {conv.patientName || 'Anonymous'}
                          {conv.mobileNumber && (
                            <p className="text-[11px] font-mono text-teal-700 font-normal">
                              {conv.mobileNumber}
                            </p>
                          )}
                        </td>
                        <td className="p-4 text-slate-700 font-medium">
                          {conv.enquiryCategory || 'General Dental'}
                        </td>
                        <td className="p-4 text-slate-600 max-w-xs truncate">
                          {conv.summary || conv.transcript.slice(0, 80)}
                        </td>
                        <td className="p-4">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700">
                            {conv.followUpStatus}
                          </span>
                        </td>
                        <td className="p-4 text-slate-500 text-[11px]">
                          {new Date(conv.createdAt).toLocaleDateString([], {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </td>
                        <td className="p-4 text-right space-x-1">
                          <button
                            onClick={() => {
                              setSelectedConversation(conv);
                              setStaffNote(conv.notes || '');
                            }}
                            className="p-1.5 rounded-lg text-slate-600 hover:text-teal-700 hover:bg-slate-100 transition-colors"
                            title="Inspect Transcript"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteConv(conv.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                            title="Purge Record"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: SETTINGS EDITOR */}
      {activeTab === 'settings' && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-10 shadow-xs max-w-3xl space-y-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900 font-heading">
              Clinic Contact & Doctor Details Editor
            </h2>
            <p className="text-xs text-slate-500 leading-relaxed">
              Once verified by clinic management, update the official phone, WhatsApp number, doctor degrees, and timings here. Changes are saved to Firestore and immediately reflect on the public website.
            </p>
          </div>

          {settingsSaveSuccess && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3.5 rounded-xl text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Clinic settings updated successfully!</span>
            </div>
          )}

          <form onSubmit={handleSaveSettings} className="space-y-6">
            {/* Phone & WhatsApp */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Clinic Phone Number
                </label>
                <input
                  type="text"
                  value={settingsForm.phoneNumber}
                  onChange={(e) => setSettingsForm({ ...settingsForm, phoneNumber: e.target.value })}
                  placeholder="e.g. +91 98260 00000"
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-600 focus:outline-none"
                />
                <label className="flex items-center gap-2 mt-2 text-xs text-slate-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settingsForm.isPhoneVerified}
                    onChange={(e) => setSettingsForm({ ...settingsForm, isPhoneVerified: e.target.checked })}
                    className="rounded text-teal-600"
                  />
                  <span>Mark as Verified (enables direct call buttons)</span>
                </label>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Clinic WhatsApp Number
                </label>
                <input
                  type="text"
                  value={settingsForm.whatsappNumber}
                  onChange={(e) => setSettingsForm({ ...settingsForm, whatsappNumber: e.target.value })}
                  placeholder="e.g. +91 98260 00000"
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-600 focus:outline-none"
                />
                <label className="flex items-center gap-2 mt-2 text-xs text-slate-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settingsForm.isWhatsAppVerified}
                    onChange={(e) => setSettingsForm({ ...settingsForm, isWhatsAppVerified: e.target.checked })}
                    className="rounded text-teal-600"
                  />
                  <span>Mark as Verified (enables WhatsApp button)</span>
                </label>
              </div>
            </div>

            {/* Doctor Info */}
            <div className="pt-4 border-t border-slate-100 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-teal-800">
                Lead Dental Surgeon Information
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Doctor Full Name
                  </label>
                  <input
                    type="text"
                    value={settingsForm.doctorName}
                    onChange={(e) => setSettingsForm({ ...settingsForm, doctorName: e.target.value })}
                    placeholder="e.g. Dr. Verified Name"
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Qualifications & Degrees
                  </label>
                  <input
                    type="text"
                    value={settingsForm.doctorQualifications}
                    onChange={(e) => setSettingsForm({ ...settingsForm, doctorQualifications: e.target.value })}
                    placeholder="e.g. BDS, MDS (Conservative Dentistry)"
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-600 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Dental Council Registration Number
                </label>
                <input
                  type="text"
                  value={settingsForm.doctorRegistration}
                  onChange={(e) => setSettingsForm({ ...settingsForm, doctorRegistration: e.target.value })}
                  placeholder="e.g. MP State Dental Council Reg #12345"
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settingsForm.isDoctorVerified}
                    onChange={(e) => setSettingsForm({ ...settingsForm, isDoctorVerified: e.target.checked })}
                    className="rounded text-teal-600"
                  />
                  <span className="font-semibold">Confirm doctor credentials are officially verified</span>
                </label>
              </div>
            </div>

            {/* Opening Hours */}
            <div className="pt-4 border-t border-slate-100 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-teal-800">
                Clinic Timings
              </h3>
              <input
                type="text"
                value={settingsForm.openingHours}
                onChange={(e) => setSettingsForm({ ...settingsForm, openingHours: e.target.value })}
                placeholder="e.g. Monday - Saturday: 10:00 AM – 1:30 PM & 5:00 PM – 8:30 PM"
                className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-600 focus:outline-none"
              />
              <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settingsForm.isHoursVerified}
                  onChange={(e) => setSettingsForm({ ...settingsForm, isHoursVerified: e.target.checked })}
                  className="rounded text-teal-600"
                />
                <span className="font-semibold">Publish verified opening hours</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={isSavingSettings}
              className="py-3 px-6 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs shadow-md transition-colors flex items-center gap-2 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{isSavingSettings ? 'Saving...' : 'Save Clinic Settings'}</span>
            </button>
          </form>
        </div>
      )}

      {/* TAB 4: LOCAL SEO & GOOGLE BUSINESS PROFILE GUIDE */}
      {activeTab === 'seo' && (
        <GbpSeoChecklist />
      )}

      {/* APPOINTMENT DETAIL MODAL */}
      {selectedAppointment && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 animate-in fade-in"
          onClick={() => setSelectedAppointment(null)}
        >
          <div
            className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6 text-left relative max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-md border border-teal-200">
                  Appointment Request
                </span>
                <h3 className="text-lg font-bold text-slate-900 mt-1 font-heading">
                  {selectedAppointment.patientName}
                </h3>
              </div>
              <button
                onClick={() => setSelectedAppointment(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <span className="text-slate-400 block mb-0.5">Mobile Number</span>
                <a
                  href={`tel:${selectedAppointment.mobileNumber}`}
                  className="font-mono font-bold text-teal-700 text-sm flex items-center gap-1.5 hover:underline"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>{selectedAppointment.mobileNumber}</span>
                </a>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <span className="text-slate-400 block mb-0.5">Preferred Date</span>
                <span className="font-bold text-slate-800 text-sm">
                  {selectedAppointment.preferredDate}
                </span>
              </div>
            </div>

            <div className="text-xs space-y-1">
              <span className="text-slate-400 block">Preferred Time Slot</span>
              <p className="font-semibold text-slate-800 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                {selectedAppointment.preferredTime || 'Not specified'}
              </p>
            </div>

            {selectedAppointment.reason && (
              <div className="text-xs space-y-1">
                <span className="text-slate-400 block">Patient Symptoms / Reason</span>
                <p className="text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100 leading-relaxed">
                  {selectedAppointment.reason}
                </p>
              </div>
            )}

            <div className="text-xs space-y-2 pt-2 border-t border-slate-100">
              <label className="font-bold text-slate-700 block">
                Update Follow-up Status
              </label>
              <div className="flex flex-wrap gap-2">
                {(['new', 'contacted', 'scheduled', 'completed', 'cancelled'] as const).map(
                  (st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => handleUpdateAptStatus(selectedAppointment.id, st)}
                      disabled={updatingStatus}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                        selectedAppointment.status === st
                          ? 'bg-teal-700 text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {st}
                    </button>
                  )
                )}
              </div>
            </div>

            <div className="text-xs space-y-1">
              <label className="font-bold text-slate-700 block">
                Staff Internal Notes
              </label>
              <textarea
                rows={2}
                value={staffNote}
                onChange={(e) => setStaffNote(e.target.value)}
                placeholder="Add notes about call confirmation or scheduled appointment time..."
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-600 focus:outline-none"
              />
              <button
                onClick={() => handleUpdateAptStatus(selectedAppointment.id, selectedAppointment.status)}
                className="mt-1 px-3 py-1 bg-slate-800 text-white text-[11px] font-bold rounded-lg hover:bg-slate-900"
              >
                Save Notes
              </button>
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-slate-100 text-xs">
              <span className="text-slate-400 font-mono text-[11px]">
                ID: {selectedAppointment.id}
              </span>
              <button
                onClick={() => handleDeleteApt(selectedAppointment.id)}
                className="text-red-600 hover:underline flex items-center gap-1 font-semibold"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Request</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONVERSATION DETAIL MODAL */}
      {selectedConversation && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 animate-in fade-in"
          onClick={() => setSelectedConversation(null)}
        >
          <div
            className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6 text-left relative max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                      selectedConversation.sessionType === 'Voice Call'
                        ? 'bg-purple-100 text-purple-800'
                        : 'bg-teal-100 text-teal-800'
                    }`}
                  >
                    {selectedConversation.sessionType === 'Voice Call' ? (
                      <PhoneCall className="w-3.5 h-3.5" />
                    ) : (
                      <MessageSquare className="w-3.5 h-3.5" />
                    )}
                    <span>{selectedConversation.sessionType}</span>
                  </span>
                  <span className="text-xs font-semibold text-slate-500">
                    Consent: Explicit (v1.0)
                  </span>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mt-1 font-heading">
                  {selectedConversation.patientName || 'Anonymous Caller / Patient'}
                </h3>
              </div>
              <button
                onClick={() => setSelectedConversation(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {selectedConversation.mobileNumber && (
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-600">Callback Phone:</span>
                <a
                  href={`tel:${selectedConversation.mobileNumber}`}
                  className="font-mono font-bold text-teal-700 text-xs flex items-center gap-1.5 hover:underline"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>{selectedConversation.mobileNumber}</span>
                </a>
              </div>
            )}

            {selectedConversation.summary && (
              <div className="bg-teal-50/70 border border-teal-200/80 p-4 rounded-xl text-xs text-teal-950 space-y-1">
                <p className="font-bold text-teal-900 uppercase tracking-wider text-[10px]">
                  Clinical Intake Summary:
                </p>
                <p className="leading-relaxed">{selectedConversation.summary}</p>
              </div>
            )}

            <div className="space-y-1.5 text-xs">
              <span className="font-bold text-slate-700 block uppercase tracking-wider text-[10px]">
                Full Conversation Transcript
              </span>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 max-h-60 overflow-y-auto whitespace-pre-wrap font-sans text-xs text-slate-800 leading-relaxed space-y-2">
                {selectedConversation.transcript}
              </div>
            </div>

            <div className="text-xs space-y-2 pt-2 border-t border-slate-100">
              <label className="font-bold text-slate-700 block">
                Update Follow-up Status
              </label>
              <div className="flex flex-wrap gap-2">
                {(['new', 'contacted', 'appointment_requested', 'completed', 'closed'] as const).map(
                  (st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => handleUpdateConvStatus(selectedConversation.id, st)}
                      disabled={updatingStatus}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                        selectedConversation.followUpStatus === st
                          ? 'bg-teal-700 text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {st}
                    </button>
                  )
                )}
              </div>
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-slate-100 text-xs">
              <span className="text-slate-400 font-mono text-[11px]">
                Recorded: {new Date(selectedConversation.createdAt).toLocaleString()}
              </span>
              <button
                onClick={() => handleDeleteConv(selectedConversation.id)}
                className="text-red-600 hover:underline flex items-center gap-1 font-semibold"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Transcript</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
