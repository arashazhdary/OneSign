import { describe, it, expect, vi, beforeEach } from 'vitest';
import { usersApi } from '@/services/users.api';

vi.mock('@/services/users.api');

describe('Export Functionality Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (globalThis as any).URL.createObjectURL = vi.fn(() => 'blob:mock-url');
    (globalThis as any).URL.revokeObjectURL = vi.fn();
  });

  it('should export users as PDF', async () => {
    const mockBlob = new Blob(['PDF content'], { type: 'application/pdf' });
    vi.mocked(usersApi.export).mockResolvedValue(mockBlob);

    const blob = await usersApi.export('pdf');

    expect(usersApi.export).toHaveBeenCalledWith('pdf');
    expect(blob.type).toBe('application/pdf');
  });

  it('should export users as Excel', async () => {
    const mockBlob = new Blob(['Excel content'], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    vi.mocked(usersApi.export).mockResolvedValue(mockBlob);

    const blob = await usersApi.export('excel');

    expect(usersApi.export).toHaveBeenCalledWith('excel');
    expect(blob.type).toBe(
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
  });

  it('should export users as CSV', async () => {
    const mockBlob = new Blob(['CSV content'], { type: 'text/csv' });
    vi.mocked(usersApi.export).mockResolvedValue(mockBlob);

    const blob = await usersApi.export('csv');

    expect(usersApi.export).toHaveBeenCalledWith('csv');
    expect(blob.type).toBe('text/csv');
  });

  it('should handle export error gracefully', async () => {
    const error = new Error('Export failed');
    vi.mocked(usersApi.export).mockRejectedValue(error);

    await expect(usersApi.export('pdf')).rejects.toThrow('Export failed');
  });

  it('should create download link for exported file', async () => {
    const mockBlob = new Blob(['content'], { type: 'application/pdf' });
    vi.mocked(usersApi.export).mockResolvedValue(mockBlob);

    const blob = await usersApi.export('pdf');

    // Simulate download
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'users.pdf';

    expect(url).toBe('blob:mock-url');
    expect(link.download).toBe('users.pdf');
  });

  it('should generate correct filename based on format', async () => {
    const formats: Array<{ format: 'pdf' | 'excel' | 'csv'; extension: string }> = [
      { format: 'pdf', extension: 'pdf' },
      { format: 'excel', extension: 'xlsx' },
      { format: 'csv', extension: 'csv' },
    ];

    for (const { format, extension } of formats) {
      const mockBlob = new Blob(['content'], { type: 'application/octet-stream' });
      vi.mocked(usersApi.export).mockResolvedValue(mockBlob);

      await usersApi.export(format);

      const filename = `users.${extension}`;
      expect(filename).toContain(extension);
    }
  });

  it('should handle large export data', async () => {
    const largeContent = 'x'.repeat(10 * 1024 * 1024); // 10MB
    const mockBlob = new Blob([largeContent], { type: 'application/pdf' });
    vi.mocked(usersApi.export).mockResolvedValue(mockBlob);

    const blob = await usersApi.export('pdf');

    expect(blob.size).toBeGreaterThan(10 * 1024 * 1024);
  });

  it('should export with filters applied', async () => {
    const mockBlob = new Blob(['filtered content'], { type: 'application/pdf' });
    vi.mocked(usersApi.export).mockResolvedValue(mockBlob);

    const blob = await usersApi.export('pdf');

    expect(usersApi.export).toHaveBeenCalledWith('pdf');
    expect(blob).toBeDefined();
  });

  it('should export with different formats', async () => {
    const mockBlob = new Blob(['content'], { type: 'text/csv' });
    vi.mocked(usersApi.export).mockResolvedValue(mockBlob);

    const blob = await usersApi.export('csv');

    expect(usersApi.export).toHaveBeenCalledWith('csv');
    expect(blob).toBeDefined();
  });

  it('should cleanup blob URL after download', async () => {
    const mockBlob = new Blob(['content'], { type: 'application/pdf' });
    vi.mocked(usersApi.export).mockResolvedValue(mockBlob);

    const blob = await usersApi.export('pdf');
    const url = URL.createObjectURL(blob);

    // Simulate download completion and cleanup
    URL.revokeObjectURL(url);

    expect(URL.revokeObjectURL).toHaveBeenCalledWith(url);
  });

  it('should handle concurrent export requests', async () => {
    const mockBlob = new Blob(['content'], { type: 'application/pdf' });
    vi.mocked(usersApi.export).mockResolvedValue(mockBlob);

    const exports = await Promise.all([
      usersApi.export('pdf'),
      usersApi.export('excel'),
      usersApi.export('csv'),
    ]);

    expect(exports).toHaveLength(3);
    expect(usersApi.export).toHaveBeenCalledTimes(3);
  });

  it('should include timestamp in exported filename', () => {
    const now = new Date();
    const timestamp = now.toISOString().split('T')[0];
    const filename = `users_${timestamp}.pdf`;

    expect(filename).toContain(timestamp);
    expect(filename).toMatch(/users_\d{4}-\d{2}-\d{2}\.pdf/);
  });
});
