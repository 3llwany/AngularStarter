import { DOCUMENT } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { ThemeService } from './theme.service';

describe('ThemeService', () => {
  let doc: Document;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    doc = TestBed.inject(DOCUMENT);
    doc.cookie = 'moz_role=; Path=/; Max-Age=0';
    doc.documentElement.removeAttribute('data-role');
  });

  it('defaults to "student" and sets data-role on <html> when no cookie exists', () => {
    const service = TestBed.inject(ThemeService);
    expect(service.currentRole()).toBe('student');
    expect(doc.documentElement.getAttribute('data-role')).toBe('student');
  });

  it('updates currentRole signal, <html data-role>, and moz_role cookie on setRole', () => {
    const service = TestBed.inject(ThemeService);
    service.setRole('teacher');

    expect(service.currentRole()).toBe('teacher');
    expect(doc.documentElement.getAttribute('data-role')).toBe('teacher');
    expect(doc.cookie).toContain('moz_role=teacher');
  });

  it('reads a valid role from the moz_role cookie on startup', () => {
    doc.cookie = 'moz_role=partner; Path=/';
    const service = TestBed.inject(ThemeService);

    expect(service.currentRole()).toBe('partner');
    expect(doc.documentElement.getAttribute('data-role')).toBe('partner');
  });

  it('falls back to "student" when cookie or setRole value is invalid', () => {
    doc.cookie = 'moz_role=unknown_role; Path=/';
    const service = TestBed.inject(ThemeService);

    expect(service.currentRole()).toBe('student');

    service.setRole('parent');
    expect(service.currentRole()).toBe('parent');

    service.setRole('invalid');
    expect(service.currentRole()).toBe('student');
    expect(doc.documentElement.getAttribute('data-role')).toBe('student');
  });
});
