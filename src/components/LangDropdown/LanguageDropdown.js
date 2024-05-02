import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import i18n from '../../18n';
import './LangDropdown.css';

const languages = [
  { name: 'English', code: 'en' },
  { name: '中文', code: 'zh' },
  { name: 'Español', code: 'es' },
  { name: 'Français', code: 'fr' },
  { name: 'Deutsch', code: 'de' },
  { name: 'Italiano', code: 'it' },
  { name: 'عرب', code: 'ar' },
  { name: 'Русский', code: 'ru' },
  { name: 'Português', code: 'pt' },
  { name: '日本語', code: 'ja' },
];

const LanguageDropdown = () => {
  const [selectedLanguage, setSelectedLanguage] = useState('');
  const { t, i18n } = useTranslation();

  useEffect(() => {
    const savedLanguage = localStorage.getItem('selectedLanguage');
    if (savedLanguage) {
      setSelectedLanguage(savedLanguage);
      changeLanguage(savedLanguage);
    }
  }, [i18n.language]);

  useEffect(() => {
    setSelectedLanguage(i18n.language);
  }, [i18n.language]);

  const handleChange = (event) => {
    const selectedCode = event.target.value;
    setSelectedLanguage(selectedCode);
    changeLanguage(selectedCode);
    localStorage.setItem('selectedLanguage', selectedCode);
  };

  const changeLanguage = (language) => {
    i18n.changeLanguage(language);
  };

  return (
    <div className='lang-dropdown'>
      <select value={selectedLanguage} onChange={handleChange} className='select-lang'>
        {languages.map((language, index) => (
          <option key={index} value={language.code} >
            {language.name}
          </option>
        ))}
      </select>
    </div>
  );
};

export default LanguageDropdown;
