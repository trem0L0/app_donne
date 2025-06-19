import { Check } from "lucide-react";

interface DonationStepsProps {
  currentStep: number;
}

export function DonationSteps({ currentStep }: DonationStepsProps) {
  const steps = [
    { number: 1, label: "Montant" },
    { number: 2, label: "Informations" },
    { number: 3, label: "Paiement" },
  ];

  return (
    <div className="flex items-center space-x-2 text-sm text-gray-600">
      {steps.map((step, index) => (
        <div key={step.number} className="flex items-center">
          <span
            className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
              step.number < currentStep
                ? "bg-green-500 text-white"
                : step.number === currentStep
                ? "bg-primary text-white"
                : "bg-gray-300 text-gray-600"
            }`}
          >
            {step.number < currentStep ? <Check size={12} /> : step.number}
          </span>
          <span className="ml-1">{step.label}</span>
          {index < steps.length - 1 && <span className="mx-2">→</span>}
        </div>
      ))}
    </div>
  );
}
