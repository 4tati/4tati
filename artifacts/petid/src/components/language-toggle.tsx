import { useLanguage } from '@/lib/i18n';

export function LanguageToggle() {
  const { lang, setLanguage } = useLanguage();

  return (
    <div className="absolute top-4 right-4 z-[100]">
      <div className="bg-card/60 backdrop-blur-xl border border-white/40 dark:border-white/10 rounded-full p-1 shadow-lg flex items-center">
        <button
          onClick={() => setLanguage('ka')}
          className={`px-3 py-1.5 text-xs font-bold rounded-full transition-all ${
            lang === 'ka' 
              ? 'bg-foreground text-background shadow-sm' 
              : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
          }`}
        >
          ქართ
        </button>
        <button
          onClick={() => setLanguage('en')}
          className={`px-3 py-1.5 text-xs font-bold rounded-full transition-all ${
            lang === 'en' 
              ? 'bg-foreground text-background shadow-sm' 
              : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
          }`}
        >
          EN
        </button>
      </div>
    </div>
  );
}
