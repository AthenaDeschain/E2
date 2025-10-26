import React from 'react';

const DonationTier: React.FC<{ title: string; amount: string; description: string; recurring: string; isPopular?: boolean; }> = ({ title, amount, description, recurring, isPopular }) => (
    <div className={`border rounded-lg p-6 relative ${isPopular ? 'border-blue-500 ring-2 ring-blue-500/50' : 'border-slate-200 dark:border-slate-700'}`}>
        {isPopular && <div className="absolute top-0 -translate-y-1/2 px-3 py-1 text-sm font-semibold text-white bg-blue-600 rounded-full">Most Popular</div>}
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">{title}</h3>
        <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white my-3">{amount} <span className="text-base font-normal text-slate-500 dark:text-slate-400">{recurring}</span></p>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-5">{description}</p>
        <button className={`w-full py-2 font-semibold rounded-md ${isPopular ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-600'}`}>
            Select Plan
        </button>
    </div>
);

const Funding: React.FC = () => {
    return (
        <div className="p-4 sm:p-6 lg:p-8 bg-slate-50 dark:bg-slate-900">
            <div className="max-w-5xl mx-auto">
                <div className="text-center mb-12">
                    <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white">Support Eureka²</h1>
                    <p className="mt-3 max-w-2xl mx-auto text-lg text-slate-600 dark:text-slate-400">
                        Your contribution keeps Eureka² independent, ad-free, and accessible to all. By supporting the platform, you help us maintain server costs, develop new features, and foster a global community of open science.
                    </p>
                </div>

                {/* Platform Donations */}
                <div className="mb-16">
                    <h2 className="text-3xl font-bold text-center text-slate-900 dark:text-white mb-8">Keep Eureka² Running</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <DonationTier title="Lab Supporter" amount="$10" recurring="per month" description="Help cover our server costs and ensure the platform remains fast and reliable for everyone." />
                        <DonationTier title="Research Ally" amount="$25" recurring="per month" description="Fund the development of new collaboration tools and features for all our users." isPopular={true} />
                        <DonationTier title="Innovation Patron" amount="$100" recurring="per month" description="Provide a grant for a small citizen science project and champion the next big discovery." />
                    </div>
                     <p className="text-center mt-6 text-slate-500 dark:text-slate-400">Prefer a one-time donation? <a href="#" className="text-blue-600 hover:underline">Click here</a>.</p>
                </div>

                {/* Our Sponsors */}
                <div>
                    <h2 className="text-3xl font-bold text-center text-slate-900 dark:text-white mb-8">Our Sponsors</h2>
                    <div className="flex justify-center items-center flex-wrap gap-x-12 gap-y-6">
                        <p className="font-semibold text-slate-500 dark:text-slate-400 text-lg">Open Science Foundation</p>
                        <p className="font-semibold text-slate-500 dark:text-slate-400 text-lg">Datawave Inc.</p>
                        <p className="font-semibold text-slate-500 dark:text-slate-400 text-lg">The Curiosity Fund</p>
                        <p className="font-semibold text-slate-500 dark:text-slate-400 text-lg">Quantum Leap Ventures</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Funding;