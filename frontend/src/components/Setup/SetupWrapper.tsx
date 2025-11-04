import React from 'react';
import { Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface SetupWrapperProps extends React.ComponentProps<'div'> {
  currentStep: number;
  children: React.ReactNode;
}

const steps = [
  { id: 1, title: 'Set Up Authentication', description: 'Configure authentication settings', url: '/setup/auth' },
  { id: 2, title: 'Install Bookmarklet', description: 'Install browser bookmarklet', url: '/setup/bookmarklet' },
  { id: 3, title: 'Import Bookmarks', description: 'Import your existing bookmarks', url: '/setup/import' },
];

export const SetupWrapper = ({ currentStep, children }: SetupWrapperProps) => {
  const navigate = useNavigate();

  return (
    <div className="flex items-start justify-center text-left min-h-svh w-full px-3 py-16">
      <div className={`setup-wrapper w-full md:w-3xl flex flex-col items-stretch gap-4`}>
        <nav className="w-full mb-8">
          <div className="w-full flex items-center justify-between">
            {steps.map((step, index) => (
              <React.Fragment key={step.id}>
                <div
                  className={`flex flex-col items-center transition-all duration-200 ${
                    currentStep > step.id
                      ? 'cursor-pointer'
                      : currentStep === step.id
                        ? 'cursor-default'
                        : 'cursor-default opacity-50'
                  }`}
                  onClick={() => currentStep > step.id && navigate(step.url)}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 ${
                      currentStep > step.id
                        ? 'bg-primary text-secondary'
                        : currentStep === step.id
                          ? 'bg-primary text-secondary'
                          : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    {currentStep > step.id ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <span className="text-sm font-medium">{step.id}</span>
                    )}
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-medium">{step.title}</div>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div className={`flex-1 h-px mx-4 ${currentStep > step.id ? 'bg-primary' : 'bg-gray-200'}`} />
                )}
              </React.Fragment>
            ))}
          </div>
        </nav>
        {children}
      </div>
    </div>
  );
};
