import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm pointer-events-none">
      {toasts.map((toast) => {
        const isSuccess = toast.type === 'success';
        const isError = toast.type === 'error';

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-xl border shadow-xl backdrop-blur-md bg-white animate-in slide-in-from-bottom-2 duration-200 ${
              isSuccess
                ? 'border-[#65A88B]/40 text-[#18243A]'
                : isError
                ? 'border-[#FF805D]/40 text-[#18243A]'
                : 'border-[#4169E1]/30 text-[#18243A]'
            }`}
          >
            {isSuccess && <CheckCircle2 className="w-4 h-4 text-[#65A88B] shrink-0 mt-0.5" />}
            {isError && <AlertCircle className="w-4 h-4 text-[#FF805D] shrink-0 mt-0.5" />}
            {!isSuccess && !isError && <Info className="w-4 h-4 text-[#4169E1] shrink-0 mt-0.5" />}
            <div className="flex-1 text-xs text-[#202A38] font-medium leading-snug">
              {toast.message}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-[#78818D] hover:text-[#202A38] transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
