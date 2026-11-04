'use client';
import React, { useState, useEffect, useRef } from 'react';
import { useSiteData } from '@/lib/site-context';
import { submitEnquiry } from '@/lib/submitEnquiry';
import { TechnicalEnquiryData, HoseCategory } from '../../types';
import { 
  X, CheckCircle, AlertCircle, Wrench, Copy, Check, Send, 
  ShieldCheck, Calculator, Phone, Mail, ArrowRight 
} from 'lucide-react';

interface EnquiryModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialProductId?: string;
}

export const EnquiryModal: React.FC<EnquiryModalProps> = ({
  isOpen,
  onClose,
  initialProductId
}) => {
  const { products: PRODUCTS, company } = useSiteData();
  const contact = { phone: company.phone, email: company.emails[0] ?? '' };
  const dialogRef = useRef<HTMLDialogElement>(null);

  // Form State
  const [category, setCategory] = useState<HoseCategory | 'custom'>('hydraulic');
  const [productId, setProductId] = useState<string>(initialProductId || 'sae-100-r1');
  const [idSize, setIdSize] = useState<string>('1/2"');
  const [workingPressure, setWorkingPressure] = useState<string>('275');
  const [temperature, setTemperature] = useState<string>('-40°C to +100°C');
  const [lengthMeters, setLengthMeters] = useState<number>(100);
  const [fittingType, setFittingType] = useState<string>('BSP Female Swivel (60° Cone)');
  const [application, setApplication] = useState<string>('Heavy Earthmoving & Hydraulic Machinery');
  const [fullName, setFullName] = useState<string>('');
  const [companyName, setCompanyName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [location, setLocation] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  // UI state
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [rfqNumber, setRfqNumber] = useState<string>('');
  const [submitError, setSubmitError] = useState<string>('');

  // Sync initial product if passed
  useEffect(() => {
    if (initialProductId) {
      setProductId(initialProductId);
      const prod = PRODUCTS.find(p => p.id === initialProductId);
      if (prod) {
        setCategory(prod.category);
        setWorkingPressure((prod.maxPressureBar ?? 275).toString());
      }
    }
  }, [initialProductId]);

  // Dialog native control
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen) {
      if (!dialog.open) {
        dialog.showModal();
        setSubmitted(false);
        setErrors({});
      }
    } else {
      if (dialog.open) {
        dialog.close();
      }
    }
  }, [isOpen]);

  // Handle ESC or backdrop click
  const handleBackdropClick = (e: React.MouseEvent<HTMLDialogElement>) => {
    if (e.target === dialogRef.current) {
      onClose();
    }
  };

  // Instant calculated engineering specs
  const wpNum = parseFloat(workingPressure) || 0;
  const burstPressure = wpNum > 0 ? wpNum * 4 : 0;
  const estimatedBendRadius = idSize === '1/4"' ? 100 : idSize === '3/8"' ? 130 : idSize === '1/2"' ? 180 : idSize === '3/4"' ? 240 : 300;

  // Validation
  const validateForm = (): boolean => {
    const errs: Record<string, string> = {};
    if (!fullName.trim()) errs.fullName = 'Full name is required';
    if (!companyName.trim()) errs.companyName = 'Company name is required';
    if (!email.trim() || !email.includes('@')) errs.email = 'Valid corporate email is required';
    if (!phone.trim() || phone.length < 8) errs.phone = 'Valid contact phone number is required';
    if (!workingPressure.trim() || isNaN(Number(workingPressure))) errs.workingPressure = 'Specify valid working pressure';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Submission handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true);
    setSubmitError('');

    const result = await submitEnquiry({
      type: 'rfq',
      fullName, email, companyName, phone, location, notes,
      category, productSlug: productId, idSize, workingPressure, temperature,
      lengthMeters, fittingType, application,
    }, contact);

    setSubmitting(false);
    if (result.ok) {
      setRfqNumber(result.reference);
      setSubmitted(true);
    } else {
      setSubmitError(result.message);
    }
  };

  // Copy specs to clipboard
  const handleCopySpec = () => {
    const specSummary = `
[VAISHNO RUBBER / VEXTRA TECHNICAL RFQ SPECIFICATION]
Product: ${productId} (${category.toUpperCase()})
Bore Size (ID): ${idSize}
Working Pressure: ${workingPressure} BAR (Burst Margin: ${burstPressure} BAR - 4:1)
Operating Temp: ${temperature}
Length / Quantity: ${lengthMeters} Meters / Units
Fittings: ${fittingType}
Application: ${application}
Company: ${companyName}
Contact: ${fullName} (${email} / ${phone})
Location: ${location}
    `.trim();

    navigator.clipboard.writeText(specSummary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <dialog
      ref={dialogRef}
      onClick={handleBackdropClick}
      className="p-0 rounded-xl overflow-hidden shadow-2xl max-w-3xl w-full mx-4 my-auto backdrop:bg-slate-900/60 backdrop:backdrop-blur-sm"
    >
      <div className="bg-white max-h-[90vh] overflow-y-auto flex flex-col">
        {/* Header Bar */}
        <div className="bg-slate-900 text-white px-6 py-5 flex items-center justify-between border-b border-slate-800 sticky top-0 z-20">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="badge badge-accent">TECHNICAL RFQ DESK</span>
              <span className="font-mono text-xs text-slate-400">VEXTRA · VAISHNO RUBBER</span>
            </div>
            <h2 className="text-xl font-bold font-display text-white">
              Request Engineering Quote & Specification
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-md transition-colors"
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        {submitted ? (
          /* SUCCESS SCREEN */
          <div className="p-8 sm:p-12 text-center max-w-xl mx-auto">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-5">
              <CheckCircle size={36} />
            </div>
            <span className="badge badge-blue font-mono text-xs mb-2">
              RFQ RECORDED // {rfqNumber}
            </span>
            <h3 className="text-2xl font-bold text-slate-900 mt-2">
              Quotation Request Dispatched to Engineering Team
            </h3>
            <p className="text-sm text-slate-600 mt-3 leading-relaxed">
              Thank you, <strong className="text-slate-800">{fullName}</strong> ({companyName}). Our technical sales desk at Moradabad Works has received your enquiry. Our sales team will review it and get back to you.
            </p>

            {/* Spec summary badge card */}
            <div className="mt-6 p-4 bg-slate-50 border border-slate-200 rounded-lg text-left text-xs font-mono space-y-1.5 text-slate-700">
              <div><strong className="text-slate-900">RFQ Number:</strong> {rfqNumber}</div>
              <div><strong className="text-slate-900">Config:</strong> {idSize} ID, {workingPressure} BAR (Burst: {burstPressure} BAR)</div>
              <div><strong className="text-slate-900">Quantity:</strong> {lengthMeters} Meters // {fittingType}</div>
              <div><strong className="text-slate-900">Contact:</strong> {email} | {phone}</div>
            </div>

            <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={handleCopySpec}
                className="btn btn-secondary btn-sm w-full sm:w-auto"
              >
                {copied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                {copied ? 'Specification Copied!' : 'Copy Spec Summary'}
              </button>
              <button
                onClick={onClose}
                className="btn btn-primary btn-sm w-full sm:w-auto"
              >
                Done
              </button>
            </div>

            <div className="mt-8 pt-4 border-t border-slate-200 text-xs text-slate-500">
              For urgent requirements, contact direct desk: <br />
              <a href={`tel:${contact.phone.replace(/\s/g, '')}`} className="font-bold text-blue-600 hover:underline">{contact.phone}</a>{contact.email && <> &bull; <a href={`mailto:${contact.email}`} className="font-bold text-blue-600 hover:underline">{contact.email}</a></>}
            </div>
          </div>
        ) : (
          /* MULTI-SECTION FORM */
          <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
            {/* Engineering Calculator HUD */}
            <div className="bg-blue-50/60 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono font-bold text-blue-800 flex items-center gap-1.5 uppercase">
                  <Calculator size={14} />
                  Live Pressure Rating Calculation (4:1 Margin)
                </span>
                <span className="text-xs font-mono text-blue-600 font-semibold">SAE / DIN Verified</span>
              </div>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="bg-white p-2.5 rounded border border-blue-100">
                  <span className="text-[11px] text-slate-500 block">Working Pressure</span>
                  <span className="font-mono font-bold text-slate-900 text-sm">{wpNum} BAR</span>
                </div>
                <div className="bg-white p-2.5 rounded border border-blue-100">
                  <span className="text-[11px] text-slate-500 block">Burst Pressure</span>
                  <span className="font-mono font-bold text-orange-600 text-sm">{burstPressure} BAR</span>
                </div>
                <div className="bg-white p-2.5 rounded border border-blue-100">
                  <span className="text-[11px] text-slate-500 block">Min. Bend Radius</span>
                  <span className="font-mono font-bold text-slate-800 text-sm">~{estimatedBendRadius} mm</span>
                </div>
              </div>
            </div>

            {/* Step 1: Technical Hose Parameters */}
            <div>
              <h3 className="text-xs font-mono font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px]">1</span>
                Hose Technical Specifications
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Product Family */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Product Family</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as HoseCategory)}
                    className="w-full text-xs font-medium p-2.5 border border-slate-300 rounded bg-white focus:border-blue-600 focus:outline-none"
                  >
                    <option value="hydraulic">Hydraulic Hoses (SAE 100 R1, R2, SH33, Jack)</option>
                    <option value="industrial">Industrial Hoses (Steam, Rock Drill, LPG)</option>
                    <option value="automotive">Automotive Hoses (A/C, CNG, Governor)</option>
                    <option value="custom">Custom Assembly / Rubber-to-Metal</option>
                  </select>
                </div>

                {/* Specific Model */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Target Hose Model</label>
                  <select
                    value={productId}
                    onChange={(e) => {
                      setProductId(e.target.value);
                      const p = PRODUCTS.find(prod => prod.id === e.target.value);
                      if (p) setWorkingPressure(p.maxPressureBar?.toString() ?? '');
                    }}
                    className="w-full text-xs font-medium p-2.5 border border-slate-300 rounded bg-white focus:border-blue-600 focus:outline-none"
                  >
                    {PRODUCTS.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>

                {/* Internal Diameter */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Inside Diameter (ID)</label>
                  <select
                    value={idSize}
                    onChange={(e) => setIdSize(e.target.value)}
                    className="w-full text-xs font-mono p-2.5 border border-slate-300 rounded bg-white focus:border-blue-600 focus:outline-none"
                  >
                    <option value='1/4"'>1/4" (6.4 mm - DN6)</option>
                    <option value='3/8"'>3/8" (9.5 mm - DN10)</option>
                    <option value='1/2"'>1/2" (12.7 mm - DN12)</option>
                    <option value='3/4"'>3/4" (19.0 mm - DN19)</option>
                    <option value='1"'>1" (25.4 mm - DN25)</option>
                    <option value='1-1/4"'>1-1/4" (31.8 mm - DN31)</option>
                    <option value='1-1/2"'>1-1/2" (38.1 mm - DN38)</option>
                    <option value='2"'>2" (50.8 mm - DN51)</option>
                  </select>
                </div>

                {/* Working Pressure Bar */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Working Pressure (BAR)</label>
                  <input
                    type="number"
                    value={workingPressure}
                    onChange={(e) => setWorkingPressure(e.target.value)}
                    placeholder="e.g. 275"
                    className={`w-full text-xs font-mono p-2.5 border rounded bg-white focus:outline-none ${
                      errors.workingPressure ? 'border-red-500 bg-red-50' : 'border-slate-300 focus:border-blue-600'
                    }`}
                  />
                  {errors.workingPressure && <span className="text-[11px] text-red-600 mt-0.5 block">{errors.workingPressure}</span>}
                </div>

                {/* Quantity */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Required Quantity (Meters / Assemblies)</label>
                  <input
                    type="number"
                    min="1"
                    value={lengthMeters}
                    onChange={(e) => setLengthMeters(parseInt(e.target.value) || 1)}
                    className="w-full text-xs font-mono p-2.5 border border-slate-300 rounded bg-white focus:border-blue-600 focus:outline-none"
                  />
                </div>

                {/* Fitting Type */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">End Fitting / Coupling</label>
                  <select
                    value={fittingType}
                    onChange={(e) => setFittingType(e.target.value)}
                    className="w-full text-xs font-medium p-2.5 border border-slate-300 rounded bg-white focus:border-blue-600 focus:outline-none"
                  >
                    <option value="BSP Female Swivel (60° Cone)">BSP Female Swivel (60° Cone)</option>
                    <option value="BSP Male Fixed">BSP Male Fixed</option>
                    <option value="JIC 37° Female Swivel">JIC 37° Female Swivel</option>
                    <option value="NPT Male Thread">NPT Male Thread</option>
                    <option value="Metric Heavy / Light Series">Metric Heavy / Light Series</option>
                    <option value="SAE Flange Code 61/62">SAE Flange Code 61/62</option>
                    <option value="Bare Hose (No Fittings)">Bare Hose (No Fittings)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Step 2: Commercial & Procurement Contacts */}
            <div className="pt-2 border-t border-slate-200">
              <h3 className="text-xs font-mono font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px]">2</span>
                Procurement & Delivery Information
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Rajesh Kumar"
                    className={`w-full text-xs p-2.5 border rounded bg-white focus:outline-none ${
                      errors.fullName ? 'border-red-500 bg-red-50' : 'border-slate-300 focus:border-blue-600'
                    }`}
                  />
                  {errors.fullName && <span className="text-[11px] text-red-600 mt-0.5 block">{errors.fullName}</span>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Company / Organization *</label>
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="e.g. Bharat Heavy Machinery Ltd."
                    className={`w-full text-xs p-2.5 border rounded bg-white focus:outline-none ${
                      errors.companyName ? 'border-red-500 bg-red-50' : 'border-slate-300 focus:border-blue-600'
                    }`}
                  />
                  {errors.companyName && <span className="text-[11px] text-red-600 mt-0.5 block">{errors.companyName}</span>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Corporate Email Address *</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. rajesh@company.com"
                    className={`w-full text-xs p-2.5 border rounded bg-white focus:outline-none ${
                      errors.email ? 'border-red-500 bg-red-50' : 'border-slate-300 focus:border-blue-600'
                    }`}
                  />
                  {errors.email && <span className="text-[11px] text-red-600 mt-0.5 block">{errors.email}</span>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Direct Phone / Mobile *</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. +91 98102 94483"
                    className={`w-full text-xs font-mono p-2.5 border rounded bg-white focus:outline-none ${
                      errors.phone ? 'border-red-500 bg-red-50' : 'border-slate-300 focus:border-blue-600'
                    }`}
                  />
                  {errors.phone && <span className="text-[11px] text-red-600 mt-0.5 block">{errors.phone}</span>}
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Project Delivery Location / City</label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Moradabad, Haridwar, Delhi NCR, or Global"
                    className="w-full text-xs p-2.5 border border-slate-300 rounded bg-white focus:border-blue-600 focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Additional Technical Requirements / Application Notes</label>
                  <textarea
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Specify special fluid media, high impulse requirements, pulse test standards, or crimping drawings..."
                    className="w-full text-xs p-2.5 border border-slate-300 rounded bg-white focus:border-blue-600 focus:outline-none resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Bottom Action Footer */}
            <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-xs text-slate-500 flex items-center gap-1.5">
                <ShieldCheck size={16} className="text-blue-600 flex-shrink-0" />
                <span>Direct submission to Vaishno Rubber Works (Moradabad, India)</span>
              </div>

              {submitError && (
                <p role="alert" className="w-full text-xs font-semibold text-red-600">{submitError}</p>
              )}
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={onClose}
                  className="btn btn-secondary btn-sm flex-1 sm:flex-initial"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn btn-primary btn-sm flex-1 sm:flex-initial"
                >
                  {submitting ? (
                    <span className="flex items-center gap-2">
                      <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Computing & Sending...
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5">
                      <Send size={14} />
                      Submit Technical RFQ
                    </span>
                  )}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </dialog>
  );
};
