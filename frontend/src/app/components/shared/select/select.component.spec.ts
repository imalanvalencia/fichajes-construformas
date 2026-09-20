import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { SelectComponent, SelectOption } from './select.component';

describe('SelectComponent', () => {
  let component: SelectComponent<string>;
  let fixture: ComponentFixture<SelectComponent<string>>;

  const testOptions: SelectOption[] = [
    { value: 'opt1', label: 'Option 1' },
    { value: 'opt2', label: 'Option 2' },
    { value: 'opt3', label: 'Option 3' },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SelectComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SelectComponent<string>);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('options', testOptions);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('option selection', () => {
    it('should render all options', () => {
      const options = fixture.nativeElement.querySelectorAll('option');
      // No placeholder by default (empty string), so just the options
      expect(options.length).toBe(testOptions.length);
    });

    it('should display option labels', () => {
      const options = fixture.nativeElement.querySelectorAll('option');
      expect(options[0].textContent?.trim()).toBe('Option 1');
      expect(options[1].textContent?.trim()).toBe('Option 2');
    });

    it('should select a value on change', () => {
      const select = fixture.nativeElement.querySelector('select');
      select.value = 'opt2';
      select.dispatchEvent(new Event('change'));
      expect(component.value()).toBe('opt2');
    });
  });

  describe('disabled prevents change', () => {
    it('should disable the select when disabled is true', () => {
      fixture.componentRef.setInput('disabled', true);
      fixture.detectChanges();
      const select = fixture.nativeElement.querySelector('select');
      expect(select.disabled).toBe(true);
    });
  });

  describe('label association', () => {
    it('should associate label with select via for attribute', () => {
      fixture.componentRef.setInput('label', 'Category');
      fixture.detectChanges();
      const label = fixture.nativeElement.querySelector('label');
      const select = fixture.nativeElement.querySelector('select');
      expect(label.getAttribute('for')).toBe(select.id);
    });

    it('should display the label text', () => {
      fixture.componentRef.setInput('label', 'Category');
      fixture.detectChanges();
      const label = fixture.nativeElement.querySelector('label');
      expect(label.textContent?.trim()).toBe('Category');
    });
  });

  describe('placeholder', () => {
    it('should show placeholder as first option when set', () => {
      fixture.componentRef.setInput('placeholder', 'Select an option');
      fixture.detectChanges();
      const options = fixture.nativeElement.querySelectorAll('option');
      expect(options.length).toBe(testOptions.length + 1);
      expect(options[0].textContent?.trim()).toBe('Select an option');
      expect(options[0].disabled).toBe(true);
    });

    it('should not render placeholder option when empty', () => {
      fixture.componentRef.setInput('placeholder', '');
      fixture.detectChanges();
      const options = fixture.nativeElement.querySelectorAll('option');
      expect(options.length).toBe(testOptions.length);
    });
  });

  describe('accessibility', () => {
    it('should set aria-required when required is true', () => {
      fixture.componentRef.setInput('required', true);
      fixture.detectChanges();
      const select = fixture.nativeElement.querySelector('select');
      expect(select.getAttribute('aria-required')).toBe('true');
    });

    it('should set aria-invalid when errorMessage is set', () => {
      fixture.componentRef.setInput('errorMessage', 'Error');
      fixture.detectChanges();
      const select = fixture.nativeElement.querySelector('select');
      expect(select.getAttribute('aria-invalid')).toBe('true');
    });

    it('should point aria-describedby to help text', () => {
      fixture.componentRef.setInput('helpText', 'Help text');
      fixture.detectChanges();
      const select = fixture.nativeElement.querySelector('select');
      const helpId = select.getAttribute('aria-describedby');
      const helpEl = fixture.nativeElement.querySelector(`#${helpId}`);
      expect(helpEl?.textContent?.trim()).toBe('Help text');
    });

    it('should point aria-describedby to error when both help and error exist', () => {
      fixture.componentRef.setInput('helpText', 'Help');
      fixture.componentRef.setInput('errorMessage', 'Error');
      fixture.detectChanges();
      const select = fixture.nativeElement.querySelector('select');
      const describedId = select.getAttribute('aria-describedby');
      const describedEl = fixture.nativeElement.querySelector(`#${describedId}`);
      expect(describedEl?.textContent?.trim()).toBe('Error');
    });
  });

  describe('CVA integration', () => {
    it('should implement writeValue', () => {
      component.writeValue('opt2');
      expect(component.value()).toBe('opt2');
    });

    it('should implement registerOnChange', () => {
      let changedValue = '';
      component.registerOnChange((val: string) => changedValue = val);
      component.value.set('opt3');
      component.onSelect({ target: { value: 'opt3' } } as any);
      expect(changedValue).toBe('opt3');
    });
  });
});
