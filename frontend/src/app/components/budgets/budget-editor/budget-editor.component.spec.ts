import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, expect, it, beforeEach, vi } from 'vitest';
import { BudgetEditorComponent } from './budget-editor.component';

describe('BudgetEditorComponent', () => {
  let component: BudgetEditorComponent;
  let fixture: ComponentFixture<BudgetEditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BudgetEditorComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(BudgetEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('adds an item when description signal is set and addItem is called', () => {
    const onAddItem = vi.fn();
    component.onAddItem.subscribe(onAddItem);

    component.newItemDescription.set('Install door');
    component.addItem();

    expect(onAddItem).toHaveBeenCalledWith(
      expect.objectContaining({ description: 'Install door', quantity: 1 }),
    );
  });

  it('adds an item when Enter is pressed in the new item row', async () => {
    const onAddItem = vi.fn();
    component.onAddItem.subscribe(onAddItem);

    // Set the description via the signal (app-input writes through CVA)
    component.newItemDescription.set('Install door');
    fixture.detectChanges();
    await fixture.whenStable();

    // Find the app-input wrapper for the description field in the new item row
    const appInputs = fixture.nativeElement.querySelectorAll('app-input');
    let descriptionAppInput: HTMLElement | null = null;
    for (const ai of appInputs) {
      const input = ai.querySelector('input') as HTMLInputElement;
      if (input && input.placeholder === 'Nueva descripción *') {
        descriptionAppInput = ai;
        break;
      }
    }
    expect(descriptionAppInput).toBeTruthy();

    // Dispatch keydown.enter on the <app-input> host element where the binding is
    descriptionAppInput!.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));

    expect(onAddItem).toHaveBeenCalledWith(
      expect.objectContaining({ description: 'Install door', quantity: 1 }),
    );
  });

  it('defaults and clamps a new item quantity to one', () => {
    const onAddItem = vi.fn();
    component.onAddItem.subscribe(onAddItem);
    component.newItemDescription.set('Install door');

    expect(component.newItemQuantity()).toBe(1);

    component.newItemQuantity.set(-2);
    component.addItem();

    expect(onAddItem).toHaveBeenCalledWith(expect.objectContaining({ quantity: 1 }));
    expect(component.newItemQuantity()).toBe(1);
  });
});
