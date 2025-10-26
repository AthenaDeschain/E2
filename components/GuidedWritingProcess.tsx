import React, { useState } from 'react';
import ToolInterface from './ToolInterface';
import { refineIdea, createOutline, getResearchAndCitations, suggestJournals } from '../services/geminiService';
import { GeminiResponse } from '../types';
import Tooltip from './common/Tooltip';

const InfoIconTooltip: React.FC<{ tip: string }> = ({ tip }) => {
    return (
        <Tooltip tip={tip} position="top">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 cursor-help" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        </Tooltip>
    );
};


const GUIDED_STEPS = [
    {
        title: "Step 1: Refine Your Idea",
        description: "Start with a rough idea, a question, or an observation. The AI will help you flesh it out into a solid research concept.",
        placeholder: "e.g., 'The effect of coffee on student productivity'",
        buttonText: "Refine Idea",
        apiCall: refineIdea,
        isLargeInput: true,
        jitDescription: "A strong, clear idea is the foundation of any great paper. This step ensures your research question is focused and feasible."
    },
    {
        title: "Step 2: Find Foundational Literature",
        description: "Based on your refined idea, let's find key papers. This will help you understand the current state of research in the field.",
        placeholder: "Enter keywords from your refined idea...",
        buttonText: "Find Literature",
        apiCall: getResearchAndCitations,
        isLargeInput: false,
        jitDescription: "Understanding existing research prevents reinventing the wheel and helps you position your work within the scientific conversation."
    },
    {
        title: "Step 3: Create an Outline",
        description: "A good outline is the backbone of your paper or report. The AI will generate a logical structure for you to follow.",
        placeholder: "Paste your refined idea and key research questions here...",
        buttonText: "Generate Outline",
        apiCall: createOutline,
        isLargeInput: true,
        jitDescription: "An outline saves you time by organizing your thoughts and ensuring a logical flow before you start drafting the full text."
    },
    {
        title: "Step 4: Plan Your Dissemination",
        description: "It's good to have a target venue in mind. Paste your abstract (or a summary of your findings) to get suggestions for journals, conferences, or even public-facing platforms.",
        placeholder: "Paste your draft abstract here...",
        buttonText: "Suggest Venues",
        apiCall: suggestJournals,
        isLargeInput: true,
        jitDescription: "Knowing your target audience and publication venue early can help you tailor your writing style and increase your chances of acceptance."
    }
];

const GuidedWritingProcess: React.FC = () => {
    const [currentStep, setCurrentStep] = useState(0);
    const [completedSteps, setCompletedSteps] = useState<boolean[]>(new Array(GUIDED_STEPS.length).fill(false));

    const handleNext = () => {
        if (currentStep < GUIDED_STEPS.length - 1) {
            setCurrentStep(currentStep + 1);
        }
    };

    const handlePrev = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };
    
    const onStepSuccess = (response: GeminiResponse) => {
        const newCompleted = [...completedSteps];
        newCompleted[currentStep] = true;
        setCompletedSteps(newCompleted);
    };

    const step = GUIDED_STEPS[currentStep];

    return (
        <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto">
            {/* Stepper Navigation */}
            <div className="mb-8">
                 <div className="flex items-center gap-2 mb-4">
                    <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">Guided Writing Process</h1>
                    <InfoIconTooltip tip="This step-by-step guide uses AI to help you structure your research from initial idea to final publication plan." />
                </div>
                <ol className="flex items-center w-full">
                    {GUIDED_STEPS.map((s, index) => (
                        <li key={s.title} className={`flex w-full items-center ${index < GUIDED_STEPS.length -1 ? `after:content-[''] after:w-full after:h-1 after:border-b ${completedSteps[index] ? 'after:border-blue-600' : 'after:border-slate-200 dark:after:border-slate-700'} after:inline-block` : ""}`}>
                            <button
                                onClick={() => setCurrentStep(index)}
                                className={`flex items-center justify-center w-10 h-10 rounded-full lg:h-12 lg:w-12 shrink-0 transition-colors ${currentStep >= index ? 'bg-blue-600 text-white' : 'bg-slate-200 dark:bg-slate-700'}`}
                            >
                               {completedSteps[index] ? (
                                   <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                               ) : index + 1}
                            </button>
                        </li>
                    ))}
                </ol>
            </div>
            
            <div className="bg-white dark:bg-slate-800/50 p-1 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700">
                <ToolInterface
                    key={currentStep}
                    title={
                        <div className="flex items-center gap-2">
                           {step.title} <InfoIconTooltip tip={step.jitDescription} />
                        </div>
                    }
                    description={step.description}
                    placeholder={step.placeholder}
                    buttonText={step.buttonText}
                    isLargeInput={step.isLargeInput}
                    apiCall={step.apiCall}
                    onSuccess={onStepSuccess}
                />
            </div>
            
            {/* Navigation Buttons */}
            <div className="mt-8 flex justify-between">
                <button
                    onClick={handlePrev}
                    disabled={currentStep === 0}
                    className="px-6 py-2 border border-slate-300 dark:border-slate-600 text-base font-medium rounded-md shadow-sm text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50"
                >
                    Previous
                </button>
                <button
                    onClick={handleNext}
                    disabled={currentStep === GUIDED_STEPS.length - 1 || !completedSteps[currentStep]}
                    className="px-6 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 disabled:cursor-not-allowed"
                >
                    Next
                </button>
            </div>
        </div>
    );
};

export default GuidedWritingProcess;