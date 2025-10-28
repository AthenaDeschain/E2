import React, { useState, useEffect } from 'react';
import { DonationTierInfo, Sponsor } from '../types';
import apiService from '../services/apiService';
import LoadingSpinner from './common/LoadingSpinner';

const DonationTier: React.FC<{ tier: DonationTierInfo }> = ({ tier }) => (
    <div className={`border rounded-lg p-6 relative ${tier.isPopular ? 'border-blue-500 ring-2 ring-blue-500/50' : 'border-slate-200 dark:border-slate-700'}`}>
        {tier.isPopular && <div className="absolute top-0 -translate-y-1/2 px-3 py-1 text-sm font-semibold text-white bg-blue-600 rounded-full">Most Popular</div>}
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">{tier.title}</h3>
        <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white my-3">${tier.amount} <span className="text-base font-normal text-slate-500 dark:text-slate-400">{tier.recurring}</span></p>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-5">{tier.description}</p>
        <button className={`w-full py-2 font-semibold rounded-md ${tier.isPopular ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-600'}`}>
            Select Plan
        </button>
    </div>
);

const Funding: React.FC = () => {
    const [tiers, setTiers] = useState<DonationTierInfo[]>([]);
    const [sponsors, setSponsors] = useState<Sponsor[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchFundingInfo = async () => {
            try {
                setIsLoading(true);
                const data = await apiService<{ tiers: DonationTierInfo[], sponsors: Sponsor[] }>('/funding/info');
                setTiers(data.tiers);
                setSponsors(data.sponsors);
            } catch (err) {
                setError('Failed to load funding information.');
            } finally {
                setIsLoading(false);
            }
        };
        fetchFundingInfo();
    }, []);

    const renderContent = () => {
        if (isLoading) {
            return <div className="py-16"><LoadingSpinner /></div>;
        }
        if (error) {
            return <div className="text-center py-16 bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg">{error}</div>;
        }
        return (
            <>
                <div className="mb-16">
                    <h2 className="text-3xl font-bold text-center text-slate-900 dark:text-white mb-8">Keep Eureka² Running</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {tiers.map(tier => <DonationTier key={tier.id} tier={tier} />)}
                    </div>
                    <p className="text-center mt-6 text-slate-500 dark:text-slate-400">Prefer a one-time donation? <a href="/donate" className="text-blue-600 hover:underline">Click here</a>.</p>
                </div>

                <div>
                    <h2 className="text-3xl font-bold text-center text-slate-900 dark:text-white mb-8">Our Sponsors</h2>
                    <div className="flex justify-center items-center flex-wrap gap-x-12 gap-y-6">
                        {sponsors.map(sponsor => (
                            <p key={sponsor.id} className="font-semibold text-slate-500 dark:text-slate-400 text-lg">{sponsor.name}</p>
                        ))}
                    </div>
                </div>
            </>
        );
    };

    return (
        <div className="p-4 sm:p-6 lg:p-8 bg-slate-50 dark:bg-slate-900">
            <div className="max-w-5xl mx-auto">
                <div className="text-center mb-12">
                    <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white">Support Eureka²</h1>
                    <p className="mt-3 max-w-2xl mx-auto text-lg text-slate-600 dark:text-slate-400">
                        Your contribution keeps Eureka² independent, ad-free, and accessible to all. By supporting the platform, you help us maintain server costs, develop new features, and foster a global community of open science.
                    </p>
                </div>
                {renderContent()}
            </div>
        </div>
    );
};

export default Funding;