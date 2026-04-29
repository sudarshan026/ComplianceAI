import { Sun, Moon, Bell, Search } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { useNavigate } from 'react-router-dom';

export default function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-20 h-16 bg-background/80 backdrop-blur-md border-b border-border flex items-center justify-between px-6">
      <div className="flex items-center gap-4 flex-1">
        <button
          onClick={() => navigate('/search')}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-muted text-muted-foreground text-sm hover:bg-accent transition-colors max-w-md w-full"
        >
          <Search className="w-4 h-4" />
          <span>Search documents, policies, clauses...</span>
          <kbd className="ml-auto hidden sm:inline-flex h-5 px-1.5 items-center rounded border border-border bg-background text-[10px] font-medium text-muted-foreground">
            ⌘K
          </kbd>
        </button>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={toggleTheme}
          className="w-9 h-9 rounded-lg flex items-center justify-center hover:bg-accent transition-colors"
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
        <button className="w-9 h-9 rounded-lg flex items-center justify-center hover:bg-accent transition-colors relative">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-destructive" />
        </button>
      </div>
    </header>
  );
}
