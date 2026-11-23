import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideTranslateService, TranslatePipe } from '@ngx-translate/core';
import { beforeEach, describe, expect, it } from 'vitest';
import { AppDialog } from './dialog';

@Component({
  imports: [AppDialog, TranslatePipe],
  template: `
    <app-dialog [(visible)]="visible" header="common.app_name">
      <div id="test-body">{{ 'common.app_name' | translate }}</div>
      <div dialogFooter id="test-footer">{{ 'common.actions.confirm' | translate }}</div>
    </app-dialog>
  `,
})
class TestHostComponent {
  readonly visible = signal(true);
}

describe('AppDialog', () => {
  let hostFixture: ComponentFixture<TestHostComponent>;
  let hostComp: TestHostComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
      providers: [provideTranslateService()],
    }).compileComponents();

    hostFixture = TestBed.createComponent(TestHostComponent);
    hostComp = hostFixture.componentInstance;
    hostComp.visible.set(false);
    hostFixture.detectChanges();
    await hostFixture.whenStable();
  });

  it('renders projected body and footer content when toggled from false to true', async () => {
    hostComp.visible.set(true);
    hostFixture.detectChanges();
    await hostFixture.whenStable();

    const bodyEl = document.querySelector('#test-body');
    const footerEl = document.querySelector('#test-footer');
    expect(bodyEl).toBeTruthy();
    expect(footerEl).toBeTruthy();
  });
});
