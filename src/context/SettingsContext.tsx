import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { ClinicInfo, INITIAL_CLINIC_INFO } from '../config/clinicSettings';
import { getClinicSettingsDoc, saveClinicSettingsDoc } from '../firebase/firestoreService';

interface SettingsContextType {
  clinicInfo: ClinicInfo;
  language: 'en' | 'hi';
  setLanguage: (lang: 'en' | 'hi') => void;
  updateClinicInfo: (newInfo: Partial<ClinicInfo>) => Promise<void>;
  isLoadingSettings: boolean;
}

const SettingsContext = createContext<SettingsContextType>({
  clinicInfo: INITIAL_CLINIC_INFO,
  language: 'en',
  setLanguage: () => {},
  updateClinicInfo: async () => {},
  isLoadingSettings: false,
});

export const useSettings = () => useContext(SettingsContext);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [clinicInfo, setClinicInfo] = useState<ClinicInfo>(INITIAL_CLINIC_INFO);
  const [language, setLanguage] = useState<'en' | 'hi'>('en');
  const [isLoadingSettings, setIsLoadingSettings] = useState<boolean>(true);

  useEffect(() => {
    async function loadSettings() {
      try {
        const stored = await getClinicSettingsDoc();
        if (stored) {
          setClinicInfo((prev) => ({
            ...prev,
            ...stored,
          }));
        }
      } catch (e) {
        console.warn('Could not load remote clinic settings, using default configuration.', e);
      } finally {
        setIsLoadingSettings(false);
      }
    }

    loadSettings();
  }, []);

  const updateClinicInfo = async (newInfo: Partial<ClinicInfo>) => {
    const updated = { ...clinicInfo, ...newInfo };
    setClinicInfo(updated);
    await saveClinicSettingsDoc(newInfo);
  };

  const contextValue = useMemo(
    () => ({
      clinicInfo,
      language,
      setLanguage,
      updateClinicInfo,
      isLoadingSettings,
    }),
    [clinicInfo, language, isLoadingSettings]
  );

  return (
    <SettingsContext.Provider value={contextValue}>
      {children}
    </SettingsContext.Provider>
  );
};
