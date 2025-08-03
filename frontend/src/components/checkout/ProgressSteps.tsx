'use client';

import { 
  CreditCardIcon, 
  UserIcon, 
  BedIcon,
  CheckIcon,
} from 'lucide-react';

interface ProgressStepsProps {
  currentStep: number;
}

export function ProgressSteps({ currentStep }: ProgressStepsProps) {
  const steps = [
    { number: 1, title: 'Údaje hosťa', icon: UserIcon },
    { number: 2, title: 'Kontrola', icon: BedIcon },
    { number: 3, title: 'Platba', icon: CreditCardIcon },
    { number: 4, title: 'Potvrdenie', icon: CheckIcon },
  ];

  return (
    <div className="flex items-center justify-center mb-8">
      {steps.map((step, index) => (
        <div key={step.number} className="flex items-center">
          <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
            currentStep >= step.number 
              ? 'bg-primary-600 text-foreground' 
              : 'bg-secondary-200 text-secondary-600'
          }`}>
            {currentStep > step.number ? (
              <CheckIcon className="h-5 w-5" />
            ) : (
              <step.icon className="h-5 w-5" />
            )}
          </div>
          <span className={`ml-2 text-sm font-medium ${
            currentStep >= step.number ? 'text-primary-800' : 'text-secondary-500'
          }`}>
            {step.title}
          </span>
          {index < 3 && (
            <div className={`w-16 h-1 mx-4 ${
              currentStep > step.number ? 'bg-primary-600' : 'bg-secondary-200'
            }`} />
          )}
        </div>
      ))}
    </div>
  );
}