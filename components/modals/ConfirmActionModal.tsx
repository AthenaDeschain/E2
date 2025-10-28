import React, { useEffect, useRef } from 'react';

interface ConfirmActionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    children: React.ReactNode;
    confirmText?: string;
    isDestructive?: boolean;
    isActioning?: boolean;
}

const ConfirmActionModal: React.FC<ConfirmActionModalProps> = ({ isOpen, onClose, onConfirm, title, children, confirmText = 'Confirm', isDestructive = false, isActioning = false }) => {
    const modalRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isOpen) {
            const lastFocusedElement = document.activeElement as HTMLElement;
            const modalNode = modalRef.current;
            if (!modalNode) return;

            const focusableElements = modalNode.querySelectorAll<HTMLElement>(
                'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
            );
            const firstElement = focusableElements[0];
            const lastElement = focusableElements[focusableElements.length - 1];
            
            firstElement?.focus();

            const handleKeyDown = (event: KeyboardEvent) => {
                if (event.key === 'Escape') {
                    onClose();
                }
                if (event.key === 'Tab') {
                    if (event.shiftKey) { // Shift+Tab
                        if (document.activeElement === firstElement) {
                            lastElement.focus();
                            event.preventDefault();
                        }
                    } else { // Tab
                        if (document.activeElement === lastElement) {
                            firstElement.focus();
                            event.preventDefault();
                        }
                    }
                }
            };

            document.addEventListener('keydown', handleKeyDown);

            return () => {
                document.removeEventListener('keydown', handleKeyDown);
                lastFocusedElement?.focus();
            };
        }
    }, [isOpen, onClose]);
    
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="confirm-action-title">
            <div ref={modalRef} className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-md p-6 relative" onClick={e => e.stopPropagation()}>
                <h2 id="confirm-action-title" className="text-xl font-bold text-slate-900 dark:text-white mb-4">{title}</h2>
                <div>{children}</div>
                <div className="flex justify-end gap-4 pt-6">
                    <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium rounded-md text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600">
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={onConfirm}
                        disabled={isActioning}
                        className={`px-4 py-2 text-sm font-medium rounded-md text-white disabled:opacity-50 ${isDestructive ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'}`}
                    >
                        {isActioning ? 'Processing...' : confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmActionModal;