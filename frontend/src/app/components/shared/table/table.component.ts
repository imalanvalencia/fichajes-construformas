import { Component, input } from '@angular/core';

export interface TableColumn {
  key: string;
  label: string;
  width?: string;
}

@Component({
  selector: 'app-table',
  standalone: true,
  template: `
    <div class="border border-steel overflow-x-auto">
      <table class="w-full border-collapse">
        <thead>
          <tr class="bg-surface-container">
            @for (col of columns(); track col.key) {
              <th
                class="font-mono text-xs font-medium uppercase tracking-wider text-steel px-4 py-3 text-left border-b border-steel"
                [style.width]="col.width"
              >
                {{ col.label }}
              </th>
            }
          </tr>
        </thead>
        <tbody>
          @for (row of data(); track row; let i = $index) {
            <tr class="border-b border-steel last:border-b-0">
              @for (col of columns(); track col.key) {
                <td class="font-sans text-sm text-nero px-4 py-3">
                  {{ row[col.key] }}
                </td>
              }
            </tr>
          }
          @if (data().length === 0) {
            <tr>
              <td
                [attr.colspan]="columns().length"
                class="font-mono text-xs text-steel text-center py-8"
              >
                No data available
              </td>
            </tr>
          }
        </tbody>
      </table>
    </div>
  `,
  styles: `:host { display: block; }`
})
export class TableComponent {
  columns = input<TableColumn[]>([]);
  data = input<Record<string, any>[]>([]);
}
