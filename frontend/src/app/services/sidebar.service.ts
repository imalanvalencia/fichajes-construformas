import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class SidebarService {
  readonly visible = signal(true);

  hide(): void {
    this.visible.set(false);
  }

  show(): void {
    this.visible.set(true);
  }

  toggle(): void {
    this.visible.update((v) => !v);
  }
}
