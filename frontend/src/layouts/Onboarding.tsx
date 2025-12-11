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

export const Onboarding = ({ currentStep, children }: SetupWrapperProps) => {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-svh w-full items-start justify-center px-3 py-16 text-left">
      <div className={`setup-wrapper flex w-full flex-col items-stretch gap-4 md:w-3xl`}>
        <nav className="mb-8 w-full">
          <div className="flex w-full items-center justify-between">
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
                    className={`mb-2 flex h-8 w-8 items-center justify-center rounded-full ${
                      currentStep > step.id
                        ? 'bg-primary text-secondary'
                        : currentStep === step.id
                          ? 'bg-primary text-secondary'
                          : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    {currentStep > step.id ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <span className="text-sm font-medium">{step.id}</span>
                    )}
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-medium">{step.title}</div>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div className={`mx-4 h-px flex-1 ${currentStep > step.id ? 'bg-primary' : 'bg-gray-200'}`} />
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
