import React from 'react';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';

const LanguageSelector = () => {
    const { i18n } = useTranslation();

    const languages = [
        { code: 'en', name: 'English', flag: '🇺🇸' },
        { code: 'fr', name: 'Français', flag: '🇫🇷' },
        { code: 'rn', name: 'Kirundi', flag: '🇧🇮' }
    ];

    const changeLanguage = (lng) => {
        i18n.changeLanguage(lng);
    };

    return (
        <div className="flex items-center space-x-2 bg-slate-100/50 p-1 rounded-xl border border-slate-200">
            {languages.map((lang) => (
                <button
                    key={lang.code}
                    onClick={() => changeLanguage(lang.code)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${i18n.language === lang.code
                            ? 'bg-white text-blue-600 shadow-sm'
                            : 'text-slate-500 hover:text-slate-900'
                        }`}
                >
                    <span className="mr-1.5">{lang.flag}</span>
                    {lang.name}
                </button>
            ))}
        </div>
    );
};

export default LanguageSelector;
