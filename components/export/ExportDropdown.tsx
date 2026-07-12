"use client";

import React, { useState, useRef, useEffect } from "react";
import { Download, FileText, Clipboard, ChevronDown, Loader2 } from "lucide-react";
import { toast } from "sonner";
import jsPDF from "jspdf";
import domtoimage from "dom-to-image-more";
import DOMPurify from "isomorphic-dompurify";
import { AgentStateData } from "../../types";
import { PDFReportView } from "./PDFReportView";

interface ExportDropdownProps {
  markdownContent: string;
  reportRef: React.RefObject<HTMLDivElement | null>;
  companyName: string;
  resultData: AgentStateData;
}

export function ExportDropdown({ markdownContent, reportRef, companyName, resultData }: ExportDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isExportingPDF, setIsExportingPDF] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const pdfContainerRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(markdownContent);
      toast.success("Report copied successfully.");
      setIsOpen(false);
    } catch (err) {
      toast.error("Failed to copy report.");
    }
  };

  const handleDownloadMD = () => {
    try {
      const cleanMarkdown = DOMPurify.sanitize(markdownContent);
      const blob = new Blob([cleanMarkdown], { type: "text/markdown" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${companyName.replace(/\s+/g, "_")}_Investment_Report.md`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("Markdown downloaded.");
      setIsOpen(false);
    } catch (err) {
      toast.error("Failed to download Markdown.");
    }
  };

  const handleDownloadPDF = async () => {
    if (!pdfContainerRef.current) {
      toast.error("PDF generation context is not loaded.");
      return;
    }
    setIsExportingPDF(true);
    setIsOpen(false);

    try {
      const pageElements = pdfContainerRef.current.querySelectorAll(".pdf-page");
      if (pageElements.length === 0) {
        throw new Error("No PDF pages found in DOM template.");
      }

      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = 210; // A4 width in mm
      const pdfHeight = 297; // A4 height in mm

      for (let i = 0; i < pageElements.length; i++) {
        const pageEl = pageElements[i] as HTMLElement;

        // Capture page as PNG at high resolution (3x scale for clarity)
        const scale = 3;
        const imgData = await domtoimage.toPng(pageEl, {
          bgcolor: "#ffffff",
          width: 794 * scale,
          height: 1123 * scale,
          style: {
            transform: `scale(${scale})`,
            transformOrigin: "top left"
          }
        });

        if (i > 0) {
          pdf.addPage();
        }

        pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      }

      pdf.save(`${companyName.replace(/\s+/g, "_")}_Investment_Report.pdf`);
      toast.success("PDF downloaded successfully.");
    } catch (err) {
      console.error("PDF generation error:", err);
      toast.error("Failed to generate PDF.");
    } finally {
      setIsExportingPDF(false);
    }
  };

  return (
    <div ref={dropdownRef} className="relative inline-block text-left">
      <div>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          disabled={isExportingPDF}
          className="inline-flex items-center justify-center w-full rounded-xl border border-slate-800 bg-slate-900 px-4 py-2.5 text-sm font-semibold text-slate-200 hover:text-white shadow-sm hover:bg-slate-800 transition-all cursor-pointer disabled:opacity-50"
        >
          {isExportingPDF ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin text-indigo-400" />
              Exporting...
            </>
          ) : (
            <>
              Export Report
              <ChevronDown className="ml-2 h-4 w-4 text-slate-500" />
            </>
          )}
        </button>
      </div>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 origin-top-right rounded-2xl bg-slate-950/95 border border-slate-800 shadow-2xl backdrop-blur-xl ring-1 ring-black ring-opacity-5 focus:outline-none z-50 overflow-hidden">
          <div className="py-1">
            <button
              onClick={handleCopy}
              className="flex w-full items-center px-4 py-3 text-sm text-slate-300 hover:bg-slate-900/60 hover:text-white transition-colors text-left"
            >
              <Clipboard className="mr-3 h-4 w-4 text-slate-500" />
              Copy Markdown
            </button>
            <button
              onClick={handleDownloadMD}
              className="flex w-full items-center px-4 py-3 text-sm text-slate-300 hover:bg-slate-900/60 hover:text-white transition-colors text-left"
            >
              <FileText className="mr-3 h-4 w-4 text-slate-500" />
              Download Markdown
            </button>
            <button
              onClick={handleDownloadPDF}
              className="flex w-full items-center px-4 py-3 text-sm text-slate-300 hover:bg-slate-900/60 hover:text-white transition-colors text-left"
            >
              <Download className="mr-3 h-4 w-4 text-slate-500" />
              Download PDF
            </button>
          </div>
        </div>
      )}

      {/* Render the high resolution PDF template offscreen */}
      {resultData && (
        <PDFReportView ref={pdfContainerRef} data={resultData} />
      )}
    </div>
  );
}
