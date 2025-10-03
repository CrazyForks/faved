import { Link } from 'react-router-dom';
import { X } from 'lucide-react';
import { useState } from 'react';

export const OnboardingBanner = () => {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50">
      <div className="bg-primary text-primary-foreground px-6 py-3 rounded-lg shadow-lg flex items-center gap-4 min-w-max">
        <span className="text-sm font-medium">
          Walk through the onboarding
        </span>
        <Link
          to="/setup/auth"
          className="bg-primary-foreground text-primary px-3 py-1 rounded text-sm font-medium hover:opacity-90 transition-opacity"
        >
          Start
        </Link>
        <button
          onClick={() => setIsVisible(false)}
          className="text-primary-foreground hover:opacity-70 transition-opacity ml-2"
          aria-label="Dismiss banner"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
};
