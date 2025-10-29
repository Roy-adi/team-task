import React, { useState } from 'react';
import { User, Briefcase, CreditCard, ChevronLeft, ChevronRight, Check, SkipForward } from 'lucide-react';

const MultiStepForm = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState([]);
  const [formData, setFormData] = useState({
    firstName: "",
    lastname: "",
    email: "",
    phone: "",
    company_name: "",
    position: "",
    yearofexp: "",
    salary: "",
    address: "",
    card_no: "",
    exp_date: "",
    cvv: "",
    cardholder_name: ""
  });

  const steps = [
    {
      id: 0,
      title: "Personal Info",
      icon: User,
      fields: [
        { name: "firstName", label: "First Name", type: "text", placeholder: "John" },
        { name: "lastname", label: "Last Name", type: "text", placeholder: "Doe" },
        { name: "email", label: "Email Address", type: "email", placeholder: "john.doe@example.com", fullWidth: true },
        { name: "phone", label: "Phone Number", type: "tel", placeholder: "+1 (555) 000-0000", fullWidth: true }
      ]
    },
    {
      id: 1,
      title: "Professional Info",
      icon: Briefcase,
      fields: [
        { name: "company_name", label: "Company Name", type: "text", placeholder: "Acme Corp" },
        { name: "position", label: "Position", type: "text", placeholder: "Software Engineer" },
        { 
          name: "yearofexp", 
          label: "Years of Experience", 
          type: "select", 
          placeholder: "Select experience",
          options: ["0-1 years", "1-3 years", "3-5 years", "5-10 years", "10+ years"]
        },
        { name: "salary", label: "Expected Salary", type: "text", placeholder: "$50,000" }
      ]
    },
    {
      id: 2,
      title: "Billing Info",
      icon: CreditCard,
      fields: [
        { name: "address", label: "Billing Address", type: "text", placeholder: "123 Main St, City, State", fullWidth: true },
        { name: "card_no", label: "Card Number", type: "text", placeholder: "1234 5678 9012 3456", fullWidth: true },
        { name: "cardholder_name", label: "Cardholder Name", type: "text", placeholder: "John Doe", fullWidth: true },
        { name: "exp_date", label: "Expiry Date", type: "text", placeholder: "MM/YY" },
        { name: "cvv", label: "CVV", type: "text", placeholder: "123" }
      ]
    }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      if (!completedSteps.includes(currentStep)) {
        setCompletedSteps(prev => [...prev, currentStep]);
      }
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleSubmit = () => {
    if (!completedSteps.includes(currentStep)) {
      setCompletedSteps(prev => [...prev, currentStep]);
    }
    console.log("Form Data Submitted:", formData);
    alert("Form submitted successfully! Check console for data.");
  };

  const currentStepData = steps[currentStep];
  const Icon = currentStepData.icon;

  // console.log(currentStepData,"currentStepData")
  // console.log(currentStep,"currentStep")

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Progress Bar */}
        <div className="mb-12">
          <div className="flex items-center justify-between relative">
            {/* Progress Line */}
            <div className="absolute top-8 left-0 right-0 h-1 bg-gray-200 -z-10">
              <div 
                className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-500 ease-out"
                style={{ width: `${(completedSteps.length / steps.length) * 100}%` }}
              />
            </div>
            
            {steps.map((step, index) => {
              const StepIcon = step.icon;
              const isCompleted = completedSteps.includes(index);
              const isCurrent = currentStep === index;
              
              return (
                <div key={step.id} className="flex flex-col items-center flex-1">
                  <div 
                    className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 ${
                      isCompleted 
                        ? 'bg-gradient-to-br from-green-500 to-emerald-600 shadow-lg shadow-green-500/50' 
                        : isCurrent 
                        ? 'bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/50 scale-110' 
                        : 'bg-white border-2 border-gray-300'
                    }`}
                  >
                    {isCompleted ? (
                      <Check className="w-8 h-8 text-white" />
                    ) : (
                      <StepIcon className={`w-7 h-7 ${isCurrent ? 'text-white' : 'text-gray-400'}`} />
                    )}
                  </div>
                  <span className={`mt-3 text-sm font-medium ${
                    isCurrent ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-500'
                  }`}>
                    {step.title}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
              <Icon className="w-7 h-7 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-gray-800">{currentStepData.title}</h2>
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {currentStepData.fields.map((field) => (
              <div key={field.name} className={field.fullWidth ? "md:col-span-2" : ""}>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {field.label}
                </label>
                {field.type === "select" ? (
                  <select
                    name={field.name}
                    value={formData[field.name]}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none bg-gray-50 focus:bg-white"
                  >
                    <option value="">{field.placeholder}</option>
                    {field.options.map((option) => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    type={field.type}
                    name={field.name}
                    value={formData[field.name]}
                    onChange={handleInputChange}
                    placeholder={field.placeholder}
                    className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none bg-gray-50 focus:bg-white"
                  />
                )}
              </div>
            ))}
          </div>

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between pt-6 border-t-2 border-gray-100">
            <button
              onClick={handlePrevious}
              disabled={currentStep === 0}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
                currentStep === 0
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300 hover:shadow-md'
              }`}
            >
              <ChevronLeft className="w-5 h-5" />
              Previous
            </button>

            <div className="flex gap-3">
              {currentStep < steps.length - 1 && (
                <button
                  onClick={handleSkip}
                  className="flex items-center gap-2 px-6 py-3 rounded-lg font-medium bg-gray-100 text-gray-600 hover:bg-gray-200 transition-all"
                >
                  <SkipForward className="w-5 h-5" />
                  Skip
                </button>
              )}
              
              {currentStep < steps.length - 1 ? (
                <button
                  onClick={handleNext}
                  className="flex items-center gap-2 px-8 py-3 rounded-lg font-medium bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all"
                >
                  Next
                  <ChevronRight className="w-5 h-5" />
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  className="px-8 py-3 rounded-lg font-medium bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700 shadow-lg hover:shadow-xl transition-all"
                >
                  Submit
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Progress Text */}
        <div className="text-center mt-6 text-gray-600">
          Step {currentStep + 1} of {steps.length}
        </div>
      </div>
    </div>
  );
};

export default MultiStepForm;