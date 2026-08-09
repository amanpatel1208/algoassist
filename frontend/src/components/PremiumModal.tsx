import { Sparkles, X } from 'lucide-react';

interface PremiumModalProps {
  isOpen: boolean;
  onClose: () => void;
  feature?: string;
}

export default function PremiumModal({ isOpen, onClose, feature }: PremiumModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 p-4">
      <div className="bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="relative h-28 bg-gradient-to-br from-brand/20 to-purple-500/20 flex flex-col items-center justify-center p-6 text-center border-b border-light-border dark:border-dark-border">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-md text-light-muted dark:text-dark-muted hover:bg-light-bg dark:hover:bg-dark-bg hover:text-light-text dark:hover:text-dark-text transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          
          <h2 className="text-xl font-bold text-light-text dark:text-dark-text flex items-center gap-2 mt-4">
            <Sparkles className="w-5 h-5 text-brand" /> Choose Your Plan
          </h2>
          {feature && (
            <p className="text-xs text-light-muted dark:text-dark-muted mt-2">
              Unlock <span className="font-semibold text-brand">{feature}</span> and take your interview prep to the next level.
            </p>
          )}
        </div>

        <div className="p-8 text-center space-y-6">
          <div className="space-y-2">
            <h3 className="text-lg font-bold text-light-text dark:text-dark-text">Coming Soon!</h3>
            <p className="text-sm text-light-muted dark:text-dark-muted">
              AlgoAssist Pro and Pay-As-You-Go credit plans will be available in the future. 
              We are working hard to bring you the best interview preparation experience.
            </p>
          </div>
          
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-lg border border-light-border dark:border-dark-border hover:bg-light-surface dark:hover:bg-dark-surface text-light-text dark:text-dark-text font-semibold text-sm transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
