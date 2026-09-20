import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { TextareaComponent } from './textarea.component';

describe('TextareaComponent', () => {
  let component: TextareaComponent;
  let fixture: ComponentFixture<TextareaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TextareaComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TextareaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('value binding', () => {
    it('should display the initial value', () => {
      component.value.set('hello');
      fixture.detectChanges();
      const textarea = fixture.nativeElement.querySelector('textarea');
      expect(textarea.value).toBe('hello');
    });

    it('should emit value changes on input', () => {
      const textarea = fixture.nativeElement.querySelector('textarea');
      textarea.value = 'new content';
      textarea.dispatchEvent(new Event('input'));
      expect(component.value()).toBe('new content');
    });
  });

  describe('rows attribute', () => {
    it('should set rows attribute', () => {
      fixture.componentRef.setInput('rows', 8);
      fixture.detectChanges();
      const textarea = fixture.nativeElement.querySelector('textarea');
      expect(textarea.getAttribute('rows')).toBe('8');
    });

    it('should default to 4 rows', () => {
      fixture.detectChanges();
      const textarea = fixture.nativeElement.querySelector('textarea');
      expect(textarea.getAttribute('rows')).toBe('4');
    });
  });

  describe('disabled state', () => {
    it('should disable the textarea when disabled is true', () => {
      fixture.componentRef.setInput('disabled', true);
      fixture.detectChanges();
      const textarea = fixture.nativeElement.querySelector('textarea');
      expect(textarea.disabled).toBe(true);
    });

    it('should enable the textarea when disabled is false', () => {
      fixture.componentRef.setInput('disabled', false);
      fixture.detectChanges();
      const textarea = fixture.nativeElement.querySelector('textarea');
      expect(textarea.disabled).toBe(false);
    });
  });

  describe('label association', () => {
    it('should associate label with textarea via for attribute', () => {
      fixture.componentRef.setInput('label', 'Description');
      fixture.detectChanges();
      const label = fixture.nativeElement.querySelector('label');
      const textarea = fixture.nativeElement.querySelector('textarea');
      expect(label.getAttribute('for')).toBe(textarea.id);
    });

    it('should display the label text', () => {
      fixture.componentRef.setInput('label', 'Description');
      fixture.detectChanges();
      const label = fixture.nativeElement.querySelector('label');
      expect(label.textContent?.trim()).toBe('Description');
    });
  });

  describe('help text association', () => {
    it('should show help text when no error', () => {
      fixture.componentRef.setInput('helpText', 'Enter description');
      fixture.detectChanges();
      const helpEl = fixture.nativeElement.querySelector('[id$="-help"]');
      expect(helpEl?.textContent?.trim()).toBe('Enter description');
    });

    it('should point aria-describedby to help text element', () => {
      fixture.componentRef.setInput('helpText', 'Help text');
      fixture.detectChanges();
      const textarea = fixture.nativeElement.querySelector('textarea');
      const helpId = textarea.getAttribute('aria-describedby');
      const helpEl = fixture.nativeElement.querySelector(`#${helpId}`);
      expect(helpEl?.textContent?.trim()).toBe('Help text');
    });
  });

  describe('error display', () => {
    it('should show error text when errorMessage is set', () => {
      fixture.componentRef.setInput('errorMessage', 'Required field');
      fixture.detectChanges();
      const errorEl = fixture.nativeElement.querySelector('[id$="-error"]');
      expect(errorEl?.textContent?.trim()).toBe('Required field');
    });

    it('should hide help text when error is present', () => {
      fixture.componentRef.setInput('helpText', 'Help');
      fixture.componentRef.setInput('errorMessage', 'Error');
      fixture.detectChanges();
      const helpEl = fixture.nativeElement.querySelector('[id$="-help"]');
      expect(helpEl).toBeNull();
    });

    it('should set aria-invalid when error is present', () => {
      fixture.componentRef.setInput('errorMessage', 'Error');
      fixture.detectChanges();
      const textarea = fixture.nativeElement.querySelector('textarea');
      expect(textarea.getAttribute('aria-invalid')).toBe('true');
    });
  });

  describe('accessibility', () => {
    it('should set aria-required when required is true', () => {
      fixture.componentRef.setInput('required', true);
      fixture.detectChanges();
      const textarea = fixture.nativeElement.querySelector('textarea');
      expect(textarea.getAttribute('aria-required')).toBe('true');
    });

    it('should not set aria-required when required is false', () => {
      fixture.componentRef.setInput('required', false);
      fixture.detectChanges();
      const textarea = fixture.nativeElement.querySelector('textarea');
      expect(textarea.getAttribute('aria-required')).toBeNull();
    });

    it('should set placeholder attribute', () => {
      fixture.componentRef.setInput('placeholder', 'Type here...');
      fixture.detectChanges();
      const textarea = fixture.nativeElement.querySelector('textarea');
      expect(textarea.getAttribute('placeholder')).toBe('Type here...');
    });
  });

  describe('CVA integration', () => {
    it('should implement writeValue', () => {
      component.writeValue('test content');
      expect(component.value()).toBe('test content');
    });

    it('should implement registerOnChange', () => {
      let changedValue = '';
      component.registerOnChange((val: string) => changedValue = val);
      component.value.set('changed');
      component.onInput({ target: { value: 'changed' } } as any);
      expect(changedValue).toBe('changed');
    });

    it('should implement registerOnTouched', () => {
      let touched = false;
      component.registerOnTouched(() => touched = true);
      const textarea = fixture.nativeElement.querySelector('textarea');
      textarea.dispatchEvent(new Event('blur'));
      expect(touched).toBe(true);
    });
  });
});
