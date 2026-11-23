import { isPlatformBrowser } from '@angular/common';
import { inject, PLATFORM_ID, Service } from '@angular/core';

export interface Base64FileResult {
  readonly base64: string;
  readonly extension: string;
  readonly name: string;
  readonly size: number;
}

/**
 * Universal SSR-safe file operations service.
 * Handles file reading, Base64 conversion, and browser-safe file downloading.
 */
@Service()
export class FileService {
  private readonly platformId = inject(PLATFORM_ID);

  /**
   * Converts a browser `File` or `Blob` into a Base64 string data URL.
   */
  fileToBase64(file: File): Promise<Base64FileResult> {
    if (!file) {
      return Promise.reject(new Error('No file provided to fileToBase64.'));
    }

    return new Promise<Base64FileResult>((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (event) => {
        const base64 = (event.target?.result as string) || '';
        const nameParts = file.name.split('.');
        const extension = nameParts.length > 1 ? `.${nameParts.pop()?.toLowerCase()}` : '';

        resolve({
          base64,
          extension,
          name: file.name,
          size: file.size,
        });
      };

      reader.onerror = (error) => {
        reject(error);
      };

      reader.readAsDataURL(file);
    });
  }

  /**
   * Safely downloads a file in the browser environment.
   * Gracefully ignores execution under SSR.
   */
  downloadFile(content: Blob | string, filename = 'download'): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    let url: string;
    let shouldRevoke = false;

    if (typeof content === 'string') {
      url = content;
    } else {
      url = URL.createObjectURL(content);
      shouldRevoke = true;
    }

    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename;
    anchor.style.display = 'none';
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);

    if (shouldRevoke) {
      URL.revokeObjectURL(url);
    }
  }
}

