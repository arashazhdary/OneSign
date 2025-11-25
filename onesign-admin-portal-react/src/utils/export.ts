import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

export interface ExportColumn {
  header: string;
  key: string;
  width?: number;
}

export interface ExportOptions {
  filename: string;
  title?: string;
  columns: ExportColumn[];
  data: Record<string, any>[];
}

/**
 * Export data to PDF
 */
export const exportToPDF = (options: ExportOptions) => {
  const { filename, title, columns, data } = options;

  const doc = new jsPDF();

  // Add title if provided
  if (title) {
    doc.setFontSize(18);
    doc.text(title, 14, 20);
  }

  // Prepare table data
  const headers = columns.map((col) => col.header);
  const body = data.map((row) => columns.map((col) => row[col.key] || ''));

  // Add table
  autoTable(doc, {
    head: [headers],
    body: body,
    startY: title ? 30 : 20,
    styles: {
      fontSize: 10,
      cellPadding: 3,
    },
    headStyles: {
      fillColor: [59, 130, 246], // primary-500
      textColor: [255, 255, 255],
      fontStyle: 'bold',
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252], // slate-50
    },
  });

  // Save the PDF
  doc.save(`${filename}.pdf`);
};

/**
 * Export data to Excel
 */
export const exportToExcel = (options: ExportOptions) => {
  const { filename, title, columns, data } = options;

  // Prepare worksheet data
  const headers = columns.map((col) => col.header);
  const rows = data.map((row) => columns.map((col) => row[col.key] || ''));

  // Create worksheet
  const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);

  // Set column widths
  const colWidths = columns.map((col) => ({ wch: col.width || 20 }));
  ws['!cols'] = colWidths;

  // Create workbook
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, title || 'Data');

  // Generate Excel file
  const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });

  // Save the file
  saveAs(blob, `${filename}.xlsx`);
};

/**
 * Export data to CSV
 */
export const exportToCSV = (options: ExportOptions) => {
  const { filename, columns, data } = options;

  // Prepare CSV content
  const headers = columns.map((col) => col.header).join(',');
  const rows = data.map((row) =>
    columns
      .map((col) => {
        const value = row[col.key] || '';
        // Escape values containing commas or quotes
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      })
      .join(',')
  );

  const csv = [headers, ...rows].join('\n');

  // Create blob and download
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  saveAs(blob, `${filename}.csv`);
};

/**
 * Export data in the specified format
 */
export const exportData = (format: 'pdf' | 'excel' | 'csv', options: ExportOptions) => {
  switch (format) {
    case 'pdf':
      exportToPDF(options);
      break;
    case 'excel':
      exportToExcel(options);
      break;
    case 'csv':
      exportToCSV(options);
      break;
    default:
      throw new Error(`Unsupported export format: ${format}`);
  }
};

/**
 * Print current page
 */
export const printPage = () => {
  window.print();
};
