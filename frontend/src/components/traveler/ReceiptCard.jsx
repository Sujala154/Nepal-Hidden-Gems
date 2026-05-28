import React, { useEffect } from 'react';
import { FaDownload, FaPrint } from 'react-icons/fa';
import html2pdf from 'html2pdf.js';

const ReceiptCard = ({ payment, autoDownload = false }) => {
    if (!payment) return null;

    const handleDownloadPDF = () => {
        const element = document.getElementById('receipt-content');
        const opt = {
            margin: 10,
            filename: 'Nepal_Hidden_Gems_Receipt.pdf',
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };
        html2pdf().set(opt).from(element).save();
    };

    // Auto-download when component mounts if autoDownload is true
    useEffect(() => {
        if (autoDownload) {
            const timer = setTimeout(() => {
                handleDownloadPDF();
            }, 500); // Small delay to ensure DOM is ready
            return () => clearTimeout(timer);
        }
    }, [autoDownload]);


    const ReceiptRow = ({ label, value, isBold = true }) => (
        <div className="flex justify-between items-start py-2 border-b border-slate-100 last:border-0">
            <span className="text-[11px] text-slate-500 font-medium">{label}</span>
            <span className={`text-[11px] text-slate-900 text-right max-w-[60%] ${isBold ? 'font-bold' : 'font-medium'}`}>{value}</span>
        </div>
    );

    return (
        <div className="w-full font-sans print:p-0 bg-white">
            {/* Receipt Content for PDF - excludes modal UI */}
            <div id="receipt-content" className="bg-white p-6">
                {/* Branding Header */}
                <div className="text-center mb-6 pb-4 border-b border-slate-200">
                    <div className="flex items-center justify-center gap-3 mb-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-900 to-orange-500 rounded-lg flex items-center justify-center">
                            <span className="text-white font-black text-sm">NHG</span>
                        </div>
                        <div>
                            <h1 className="text-xl font-black text-blue-900 uppercase tracking-tight">Nepal Hidden Gems</h1>
                            <p className="text-[8px] text-orange-600 font-bold uppercase tracking-widest">Adventure Travel Company</p>
                        </div>
                    </div>
                </div>

                <div className="mb-4">
                    <h1 className="text-lg font-bold text-slate-900">Payment Receipt</h1>
                </div>

            <div className="bg-[#f8faff] rounded-lg p-6 mb-6">
                <div className="space-y-0.5">
                    <ReceiptRow 
                        label="Transaction Date" 
                        value={`${new Date(payment.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).replace(/ /g, '-')}, ${new Date(payment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}`} 
                    />
                    <ReceiptRow 
                        label="Transaction ID" 
                        value={payment.transactionId?.toUpperCase() || 'N/A'} 
                    />
                    <ReceiptRow 
                        label="Service Name" 
                        value="Nepal Hidden Gems" 
                    />
                    <ReceiptRow 
                        label="Traveler Name" 
                        value={payment.traveler?.name || 'N/A'} 
                    />
                    <ReceiptRow 
                        label="Guide Name" 
                        value={payment.guide?.name || 'N/A'} 
                    />
                    <ReceiptRow 
                        label="Destination" 
                        value={payment.bookingId?.destinationName || 'Tour Booking'} 
                    />
                    <div className="my-2 border-t border-slate-200 border-dashed" />
                    <ReceiptRow 
                        label="Transaction Amount" 
                        value={`${payment.totalPaid?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`} 
                    />
                    <ReceiptRow 
                        label="Total Amount" 
                        value={`${payment.totalPaid?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`} 
                    />
                    <div className="my-2 border-t border-slate-200 border-dashed" />
                    <ReceiptRow 
                        label="Transaction Type" 
                        value="Debit" 
                    />
                    <ReceiptRow 
                        label="Channel" 
                        value="E-Banking / eSewa" 
                    />
                    <ReceiptRow 
                        label="Status" 
                        value="Success" 
                    />
                    <ReceiptRow 
                        label="Remarks" 
                        value={`Payment for adventure to ${payment.bookingId?.destinationName || 'Nepal'}`} 
                        isBold={false}
                    />
                </div>
            </div>

            <div className="text-center space-y-2">
                <div className="relative">
                    <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200"></div></div>
                    <div className="relative flex justify-center">
                        <span className="bg-white px-4 text-[9px] text-slate-400 font-medium tracking-tight">Thank you for using Nepal Hidden Gems !!</span>
                    </div>
                </div>
                
                <div className="text-[8px] text-slate-400 font-medium leading-tight">
                    <p>Kathmandu, Nepal | Tel: +977-1-4445151 | Email: support@nepalhiddegems.com</p>
                </div>
            </div>
            </div>

            {/* Action Buttons - Hidden in Print and PDF */}
            <div className="mt-6 print:hidden">
                <button 
                    onClick={handleDownloadPDF}
                    className="w-full py-3 bg-slate-900 text-white rounded-lg font-bold text-[10px] uppercase tracking-widest hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
                >
                    <FaDownload /> Download PDF
                </button>
            </div>
        </div>
    );
};

export default ReceiptCard;
