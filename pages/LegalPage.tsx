import React from 'react';

interface LegalPageProps {
    type: 'terms' | 'privacy';
    onBack: () => void;
}

const LegalContent = {
    terms: {
        title: 'Terms of Service',
        content: `
            <p><strong>Last Updated:</strong> ${new Date().toLocaleDateString()}</p>
            <p class="mb-4">Welcome to Eureka²! These Terms of Service ("Terms") govern your access to and use of the Eureka² platform, including our websites, services, and applications (collectively, the "Platform"). By creating an account or using the Platform, you agree to be bound by these Terms.</p>
            
            <h2 class="text-xl font-bold mt-6 mb-2">1. Your Account</h2>
            <p>You must be at least 13 years old to use the Platform. You are responsible for safeguarding your account information and for all activities that occur under your account. You agree to notify us immediately of any unauthorized use of your account.</p>

            <h2 class="text-xl font-bold mt-6 mb-2">2. User-Generated Content</h2>
            <p class="mb-2">Our Platform allows you to post content, including posts, project details, data, and comments ("User Content").</p>
            <ul class="list-disc ml-6 space-y-2">
                <li><strong>Ownership:</strong> You retain all intellectual property rights to the User Content you create and share. We do not claim ownership of your research or contributions.</li>
                <li><strong>License to Us:</strong> By posting User Content, you grant Eureka² a non-exclusive, worldwide, royalty-free license to use, display, reproduce, and distribute your User Content on and through the Platform. This license is solely for the purpose of operating, promoting, and improving the Platform.</li>
                <li><strong>Responsibility:</strong> You are solely responsible for your User Content and you represent that you have all necessary rights to post it and that it does not violate any third-party rights or applicable laws.</li>
            </ul>

            <h2 class="text-xl font-bold mt-6 mb-2">3. Community Guidelines and Acceptable Use</h2>
            <p class="mb-2">You agree not to use the Platform to:</p>
            <ul class="list-disc ml-6 space-y-2">
                <li>Post any content that is unlawful, harmful, defamatory, or infringes on intellectual property rights, including plagiarism.</li>
                <li>Harass, abuse, or harm another person or group.</li>
                <li>Post or spread misinformation or scientifically unsubstantiated claims without appropriate context or disclaimers.</li>
                <li>Engage in any activity that interferes with or disrupts the Platform.</li>
                <li>Violate any applicable laws or regulations.</li>
            </ul>
            <p class="mt-2">We reserve the right to remove content that violates these guidelines and to suspend or terminate accounts of repeat violators.</p>

            <h2 class="text-xl font-bold mt-6 mb-2">4. Collaboration and Projects</h2>
            <p>When collaborating on projects, you agree to uphold standards of academic and scientific integrity. All collaborators are expected to clearly define roles, responsibilities, and intellectual property agreements amongst themselves. Eureka² provides the platform for collaboration but is not a party to any agreements between users.</p>

            <h2 class="text-xl font-bold mt-6 mb-2">5. Disclaimers</h2>
            <p>The Platform is provided "as is" without any warranties, express or implied. Eureka² does not guarantee the accuracy, completeness, or usefulness of any information on the Platform, and you rely on such information at your own risk. Content on the Platform does not constitute professional scientific, legal, or medical advice.</p>
            
            <h2 class="text-xl font-bold mt-6 mb-2">6. Limitation of Liability</h2>
            <p>To the fullest extent permitted by law, Eureka² shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues, whether incurred directly or indirectly, resulting from your use of the Platform.</p>

            <h2 class="text-xl font-bold mt-6 mb-2">7. Changes to These Terms</h2>
            <p>We may modify these Terms from time to time. We will provide notice of any material changes by posting the new Terms on the Platform. Your continued use of the Platform after any such change constitutes your acceptance of the new Terms.</p>
        `
    },
    privacy: {
        title: 'Privacy Policy',
        content: `
            <p><strong>Last Updated:</strong> ${new Date().toLocaleDateString()}</p>
            <p class="mb-4">This Privacy Policy describes how Eureka² ("we," "us," or "our") collects, uses, and shares information about you when you use our Platform. We are committed to protecting your privacy and handling your data in an open and transparent manner.</p>
            
            <h2 class="text-xl font-bold mt-6 mb-2">1. Information We Collect</h2>
            <p class="mb-2">We collect information in the following ways:</p>
            <ul class="list-disc ml-6 space-y-2">
                <li><strong>Information You Provide:</strong> This includes your name, email, role (Career or Civilian Scientist), bio, interests, and any other information you provide when you create an account or update your profile. It also includes all User Content you post.</li>
                <li><strong>Usage Information:</strong> We automatically collect information about your interactions with the Platform, such as the pages you view, the links you click, and other actions you take. This may include your IP address, browser type, and device information.</li>
                <li><strong>Cookies:</strong> We use cookies and similar technologies to help operate our Platform and collect usage data.</li>
            </ul>

            <h2 class="text-xl font-bold mt-6 mb-2">2. How We Use Your Information</h2>
            <p class="mb-2">We use the information we collect to:</p>
            <ul class="list-disc ml-6 space-y-2">
                <li>Provide, maintain, and improve the Platform.</li>
                <li>Personalize your experience by showing you content relevant to your interests.</li>
                <li>Facilitate collaboration and communication between users.</li>
                <li>Communicate with you about service updates and platform news.</li>
                <li>Monitor and analyze trends, usage, and activities to ensure the security and integrity of our Platform.</li>
            </ul>

            <h2 class="text-xl font-bold mt-6 mb-2">3. How We Share Information</h2>
            <p class="mb-2">We may share information in the following circumstances:</p>
            <ul class="list-disc ml-6 space-y-2">
                <li><strong>With Other Users:</strong> Your profile information (name, handle, role, bio) and public User Content are visible to other users. Information shared within a project is visible to project members.</li>
                <li><strong>With Service Providers:</strong> We may share information with third-party vendors and service providers who need access to such information to carry out work on our behalf (e.g., hosting, analytics).</li>
                <li><strong>For Legal Reasons:</strong> We may disclose information if we believe it's required by law, subpoena, or other legal process.</li>
            </ul>
            <p class="mt-2">We do not sell your personal information to third parties.</p>

            <h2 class="text-xl font-bold mt-6 mb-2">4. Your Rights and Choices</h2>
            <p>You have rights over your personal information. You can review and update your profile information at any time through your account settings. You may also request deletion of your account and associated data by contacting us.</p>
            
            <h2 class="text-xl font-bold mt-6 mb-2">5. Data Security</h2>
            <p>We implement security measures designed to protect your information from unauthorized access, alteration, disclosure, or destruction. However, no internet-based service is 100% secure, so we cannot guarantee absolute security.</p>
            
            <h2 class="text-xl font-bold mt-6 mb-2">6. Changes to This Policy</h2>
            <p>We may update this Privacy Policy from time to time. If we make material changes, we will notify you by posting the new policy on the Platform and updating the "Last Updated" date.</p>
        `
    }
}

const LegalPage: React.FC<LegalPageProps> = ({ type, onBack }) => {
    const { title, content } = LegalContent[type];
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-4 sm:p-6 lg:p-8">
            <div className="max-w-4xl mx-auto">
                <button onClick={onBack} className="flex items-center text-sm font-semibold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 mb-6">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
                    Back
                </button>
                <div className="bg-white dark:bg-slate-800/50 p-6 sm:p-8 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700">
                    <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-6">{title}</h1>
                    <div className="prose prose-slate dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: content }}></div>
                </div>
            </div>
        </div>
    );
};

export default LegalPage;