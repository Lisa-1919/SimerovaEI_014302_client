import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import i18n from '../../18n';
import './LangDropdown.css';

const languages = [
  { name: 'English', code: 'en' },
  { name: 'Китайский', code: 'zh' },
  { name: 'Испанский', code: 'es' },
  { name: 'Французский', code: 'fr' },
  { name: 'Немецкий', code: 'de' },
  { name: 'Итальянский', code: 'it' },
  { name: 'Арабский', code: 'ar' },
  { name: 'Русский', code: 'ru' },
  { name: 'Португальский', code: 'pt' },
  { name: 'Японский', code: 'ja' },
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
  }, []);

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
