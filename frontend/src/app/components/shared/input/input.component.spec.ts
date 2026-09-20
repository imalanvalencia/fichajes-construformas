import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { InputComponent } from './input.component';

describe('InputComponent', () => {
  let component: InputComponent<string>;
  let fixture: ComponentFixture<InputComponent<string>>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InputComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(InputComponent<string>);
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
      const input = fixture.nativeElement.querySelector('input');
      expect(input.value).toBe('hello');
    });

    it('should emit value changes on input', () => {
      const input = fixture.nativeElement.querySelector('input');
      input.value = 'new value';
      input.dispatchEvent(new Event('input'));
      expect(component.value()).toBe('new value');
    });
  });

  describe('disabled state', () => {
    it('should disable the input when disabled is true', () => {
      fixture.componentRef.setInput('disabled', true);
      fixture.detectChanges();
      const input = fixture.nativeElement.querySelector('input');
      expect(input.disabled).toBe(true);
    });

    it('should enable the input when disabled is false', () => {
      fixture.componentRef.setInput('disabled', false);
      fixture.detectChanges();
      const input = fixture.nativeElement.querySelector('input');
      expect(input.disabled).toBe(false);
    });
  });

  describe('required validation', () => {
    it('should set aria-required when required is true', () => {
      fixture.componentRef.setInput('required', true);
      fixture.detectChanges();
      const input = fixture.nativeElement.querySelector('input');
      expect(input.getAttribute('aria-required')).toBe('true');
    });

    it('should not set aria-required when required is false', () => {
      fixture.componentRef.setInput('required', false);
      fixture.detectChanges();
      const input = fixture.nativeElement.querySelector('input');
      expect(input.getAttribute('aria-required')).toBeNull();
    });
  });

  describe('label association', () => {
    it('should associate label with input via for attribute', () => {
      fixture.componentRef.setInput('label', 'Email');
      fixture.detectChanges();
      const label = fixture.nativeElement.querySelector('label');
      const input = fixture.nativeElement.querySelector('input');
      expect(label.getAttribute('for')).toBe(input.id);
    });

    it('should display the label text', () => {
      fixture.componentRef.setInput('label', 'Email');
      fixture.detectChanges();
      const label = fixture.nativeElement.querySelector('label');
      expect(label.textContent?.trim()).toBe('Email');
    });
  });

  describe('aria-describedby', () => {
    it('should point to help text element when helpText is set', () => {
      fixture.componentRef.setInput('helpText', 'Enter your email');
      fixture.detectChanges();
      const input = fixture.nativeElement.querySelector('input');
      const helpText = fixture.nativeElement.querySelector(`#${input.getAttribute('aria-describedby')}`);
      expect(helpText).toBeTruthy();
      expect(helpText?.textContent?.trim()).toBe('Enter your email');
    });

    it('should point to error element when errorMessage is set', () => {
      fixture.componentRef.setInput('errorMessage', 'Required field');
      fixture.detectChanges();
      const input = fixture.nativeElement.querySelector('input');
      const errorText = fixture.nativeElement.querySelector(`#${input.getAttribute('aria-describedby')}`);
      expect(errorText).toBeTruthy();
      expect(errorText?.textContent?.trim()).toBe('Required field');
    });

    it('should prefer error over help text when both are set', () => {
      fixture.componentRef.setInput('helpText', 'Help text');
      fixture.componentRef.setInput('errorMessage', 'Error text');
      fixture.detectChanges();
      const input = fixture.nativeElement.querySelector('input');
      const describedBy = input.getAttribute('aria-describedby');
      const errorElement = fixture.nativeElement.querySelector(`#${describedBy}`);
      expect(errorElement?.textContent?.trim()).toBe('Error text');
    });
  });

  describe('aria-invalid', () => {
    it('should set aria-invalid when errorMessage is present', () => {
      fixture.componentRef.setInput('errorMessage', 'Invalid');
      fixture.detectChanges();
      const input = fixture.nativeElement.querySelector('input');
      expect(input.getAttribute('aria-invalid')).toBe('true');
    });

    it('should not set aria-invalid when no errorMessage', () => {
      fixture.componentRef.setInput('errorMessage', '');
      fixture.detectChanges();
      const input = fixture.nativeElement.querySelector('input');
      expect(input.getAttribute('aria-invalid')).toBeNull();
    });
  });

  describe('help and error text display', () => {
    it('should show help text when no error', () => {
      fixture.componentRef.setInput('helpText', 'This is help');
      fixture.detectChanges();
      const helpEl = fixture.nativeElement.querySelector('[id$="-help"]');
      expect(helpEl?.textContent?.trim()).toBe('This is help');
    });

    it('should show error text when error is set', () => {
      fixture.componentRef.setInput('errorMessage', 'This is error');
      fixture.detectChanges();
      const errorEl = fixture.nativeElement.querySelector('[id$="-error"]');
      expect(errorEl?.textContent?.trim()).toBe('This is error');
    });

    it('should hide help text when error is present', () => {
      fixture.componentRef.setInput('helpText', 'Help');
      fixture.componentRef.setInput('errorMessage', 'Error');
      fixture.detectChanges();
      const helpEl = fixture.nativeElement.querySelector('[id$="-help"]');
      expect(helpEl).toBeNull();
    });
  });

  describe('custom id', () => {
    it('should use provided id', () => {
      fixture.componentRef.setInput('id', 'custom-id');
      fixture.detectChanges();
      const input = fixture.nativeElement.querySelector('input');
      expect(input.id).toBe('custom-id');
    });

    it('should use auto-generated id when not provided', () => {
      fixture.detectChanges();
      const input = fixture.nativeElement.querySelector('input');
      expect(input.id).toMatch(/^app-input-\d+$/);
    });
  });

  describe('CVA integration', () => {
    it('should implement writeValue', () => {
      component.writeValue('test-value');
      expect(component.value()).toBe('test-value');
    });

    it('should implement registerOnChange', () => {
      let changeValue = '';
      component.registerOnChange((val: string) => changeValue = val);
      component.value.set('changed');
      component.onInput({ target: { value: 'changed' } } as any);
      expect(changeValue).toBe('changed');
    });

    it('should implement registerOnTouched', () => {
      let touched = false;
      component.registerOnTouched(() => touched = true);
      const input = fixture.nativeElement.querySelector('input');
      input.dispatchEvent(new Event('blur'));
      expect(touched).toBe(true);
    });
  });
});
