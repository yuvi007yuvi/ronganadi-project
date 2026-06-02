import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { apiFetch } from '../config/api';
import { useAuth } from './AuthContext';

const DataContext = createContext(null);

export function DataProvider({ children }) {
  const [citizens, setCitizensState] = useState([]);
  const [announcements, setAnnouncementsState] = useState([]);
  const [customSurveys, setCustomSurveysState] = useState([]);
  const [surveyResponses, setSurveyResponsesState] = useState([]);
  const [loading, setLoading] = useState(true);

  const { currentUser } = useAuth();

  const fetchData = useCallback(async () => {
    if (!currentUser) return; // Don't fetch if not logged in
    
    try {
      const [cit, ann, csurveys, cresponses] = await Promise.all([
        apiFetch('/citizens.php'),
        apiFetch('/announcements.php'),
        apiFetch('/custom_surveys.php').catch(() => []),
        apiFetch('/custom_survey_responses.php').catch(() => [])
      ]);
      const citRecords = Array.isArray(cit) ? cit : (cit?.records || []);
      const mappedCit = citRecords.map(c => ({
        ...c,
        fullName: c.full_name || c.fullName,
        schemesAvailed: c.schemes_availed || c.schemesAvailed,
        schemesNotAvailed: c.schemes_not_availed || c.schemesNotAvailed,
        voterIdNumber: c.voter_id_number || c.voterIdNumber,
        panNumber: c.pan_number || c.panNumber,
        casteCategory: c.caste_category || c.casteCategory,
        surveyorId: c.surveyor_id || c.surveyorId,
        surveyorName: c.surveyor_name || c.surveyorName,
        submittedAt: c.submitted_at || c.submittedAt,
        updatedAt: c.updated_at || c.updatedAt
      }));
      setCitizensState(mappedCit);
      setAnnouncementsState(ann || []);
      setCustomSurveysState(csurveys || []);
      setSurveyResponsesState(cresponses || []);
    } catch (e) {
      console.error('Error fetching data:', e);
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    if (currentUser) {
      fetchData();
    } else {
      setLoading(false); // Stop loading if not logged in
    }
  }, [fetchData, currentUser]);

  // ─── Citizen CRUD ───
  const addCitizen = async (citizen) => {
    const res = await apiFetch('/citizens.php', { method: 'POST', body: citizen });
    if (res && res.id) setCitizensState(prev => [...prev, res]);
    return res;
  };

  const updateCitizen = async (id, updates) => {
    const res = await apiFetch(`/citizens.php?id=${id}`, { method: 'PUT', body: updates });
    if (res) setCitizensState(prev => prev.map(c => c.id === id ? { ...c, ...updates, updatedAt: new Date().toISOString() } : c));
  };

  const deleteCitizen = async (id) => {
    await apiFetch(`/citizens.php?id=${id}`, { method: 'DELETE' });
    setCitizensState(prev => prev.filter(c => c.id !== id));
  };



  // ─── Announcements CRUD ───
  const addAnnouncement = async (ann) => {
    const res = await apiFetch('/announcements.php', { method: 'POST', body: ann });
    if (res && res.id) setAnnouncementsState(prev => [res, ...prev]);
    return res;
  };

  const updateAnnouncement = async (id, updates) => {
    const res = await apiFetch(`/announcements.php?id=${id}`, { method: 'PUT', body: updates });
    if (res) setAnnouncementsState(prev => prev.map(a => a.id === id ? { ...a, ...updates } : a));
  };

  const toggleAnnouncement = async (id) => {
    const ann = announcements.find(a => a.id === id);
    if (!ann) return;
    await updateAnnouncement(id, { published: !ann.published });
  };

  const deleteAnnouncement = async (id) => {
    await apiFetch(`/announcements.php?id=${id}`, { method: 'DELETE' });
    setAnnouncementsState(prev => prev.filter(a => a.id !== id));
  };

  // ─── Custom Surveys CRUD ───
  const addCustomSurvey = async (survey) => {
    const res = await apiFetch('/custom_surveys.php', { method: 'POST', body: survey });
    if (res && res.id) {
      setCustomSurveysState(prev => [{ ...survey, id: res.id, created_at: new Date().toISOString() }, ...prev]);
    }
    return res;
  };
  
  const deleteCustomSurvey = async (id) => {
    await apiFetch(`/custom_surveys.php?id=${id}`, { method: 'DELETE' });
    setCustomSurveysState(prev => prev.filter(s => s.id !== id));
  };

  // ─── Analytics ───
  const getStats = () => {
    const totalCitizens = citizens.length;
    const schemeBeneficiaries = citizens.filter(c => c.schemesAvailed?.length > 0 || (typeof c.schemesAvailed === 'string' && c.schemesAvailed.trim().length > 0)).length;
    const areaWise = {};
    surveyResponses.forEach(r => {
      const citizen = citizens.find(c => c.mobile === r.citizen_phone);
      if (citizen && citizen.area) {
        areaWise[citizen.area] = (areaWise[citizen.area] || 0) + 1;
      }
    });
    const occupations = {};
    const castes = {};
    citizens.forEach(c => {
      if (c.occupation) occupations[c.occupation] = (occupations[c.occupation] || 0) + 1;
      if (c.casteCategory) castes[c.casteCategory] = (castes[c.casteCategory] || 0) + 1;
    });

    const activeAnnouncementsCount = announcements.filter(a => a.published).length;

    return { 
      totalCitizens, 
      schemeBeneficiaries, 
      areaWise, 
      customSurveysCount: customSurveys.length,
      surveyResponsesCount: surveyResponses.length,
      occupations,
      castes,
      activeAnnouncementsCount
    };
  };

  return (
    <DataContext.Provider value={{
      citizens, announcements, customSurveys, surveyResponses, loading,
      addCitizen, updateCitizen, deleteCitizen,
      addAnnouncement, updateAnnouncement, toggleAnnouncement, deleteAnnouncement,
      addCustomSurvey, deleteCustomSurvey,
      getStats, fetchData,
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  return useContext(DataContext);
}
