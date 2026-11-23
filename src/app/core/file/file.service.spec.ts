import { PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FileService } from './file.service';

describe('FileService', () => {
  let service: FileService;

  describe('in Browser environment', () => {
    beforeEach(() => {
      TestBed.configureTestingModule({
        providers: [FileService, { provide: PLATFORM_ID, useValue: 'browser' }],
      });
      service = TestBed.inject(FileService);
    });

    it('converts a File to Base64 result', async () => {
      const blob = new Blob(['hello world'], { type: 'text/plain' });
      const file = new File([blob], 'test-document.txt', { type: 'text/plain' });

      const result = await service.fileToBase64(file);

      expect(result.name).toBe('test-document.txt');
      expect(result.extension).toBe('.txt');
      expect(result.base64).toContain('data:text/plain;base64');
      expect(result.size).toBe(11);
    });

    it('rejects when file is undefined', async () => {
      await expect(service.fileToBase64(null as unknown as File)).rejects.toThrow(
        'No file provided to fileToBase64.',
      );
    });

    it('creates an anchor and triggers download without throwing', () => {
      const clickSpy = vi
        .spyOn(HTMLAnchorElement.prototype, 'click')
        .mockImplementation(() => undefined);

      service.downloadFile('https://api.mozakrety.com/files/sample.pdf', 'sample.pdf');

      expect(clickSpy).toHaveBeenCalled();
      clickSpy.mockRestore();
    });
  });

  describe('in Server (SSR) environment', () => {
    beforeEach(() => {
      TestBed.configureTestingModule({
        providers: [FileService, { provide: PLATFORM_ID, useValue: 'server' }],
      });
      service = TestBed.inject(FileService);
    });

    it('safely no-ops downloadFile on server without accessing document', () => {
      expect(() => {
        service.downloadFile('https://api.mozakrety.com/file.pdf', 'file.pdf');
      }).not.toThrow();
    });
  });
});
