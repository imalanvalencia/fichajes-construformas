import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UpperCasePipe, TitleCasePipe } from '@angular/common';
import { ButtonComponent } from '../../components/shared/button/button.component';
import { CardComponent } from '../../components/shared/card/card.component';
import { InputComponent } from '../../components/shared/input/input.component';
import { BadgeComponent } from '../../components/shared/badge/badge.component';
import { MetricCardComponent } from '../../components/shared/metric-card/metric-card.component';
import { TableComponent, TableColumn } from '../../components/shared/table/table.component';
import { SelectOrCreateComponent } from '../../components/shared/select-or-create/select-or-create.component';
import { LinkComponent } from '../../components/shared/link/link.component';

@Component({
  selector: 'app-design-system',
  standalone: true,
  imports: [
    FormsModule,
    UpperCasePipe,
    TitleCasePipe,
    ButtonComponent,
    CardComponent,
    InputComponent,
    BadgeComponent,
    MetricCardComponent,
    TableComponent,
    SelectOrCreateComponent,
    LinkComponent,
  ],
  template: `
    <div class="min-h-screen bg-background text-nero font-sans">

      <!-- Page Header -->
      <div class="px-12 pt-16 pb-8">
        <div class="font-mono text-xs font-medium uppercase tracking-wider text-steel mb-2">UI Reference</div>
        <h1 class="text-[64px] font-extrabold tracking-[-0.03em] leading-none text-nero">Design System</h1>
        <div class="w-full h-px bg-steel mt-8"></div>
      </div>

      <!-- Color Palette -->
      <section class="px-12 py-12">
        <div class="font-mono text-xs font-medium uppercase tracking-wider text-steel mb-8">Color Palette</div>
        @for (group of colorGroups; track group.name) {
          <div class="mb-8">
            <div class="font-mono text-[10px] font-medium uppercase tracking-wider text-steel mb-4">{{ group.name }}</div>
            <div class="flex flex-wrap gap-4">
              @for (swatch of group.swatches; track swatch.token) {
                <div class="flex flex-col items-start">
                  <div
                    class="w-16 h-16 border border-steel"
                    [style.background-color]="swatch.hex"
                  ></div>
                  <div class="mt-1.5 font-mono text-[10px] text-nero leading-tight">{{ swatch.token }}</div>
                  <div class="font-mono text-[10px] text-steel">{{ swatch.hex }}</div>
                </div>
              }
            </div>
          </div>
        }
      </section>

      <div class="px-12"><div class="w-full h-px bg-steel"></div></div>

      <!-- Typography Scale -->
      <section class="px-12 py-12">
        <div class="font-mono text-xs font-medium uppercase tracking-wider text-steel mb-8">Typography Scale</div>
        @for (type of typographyScale; track type.name) {
          <div class="mb-6 border-b border-steel pb-6 last:border-b-0">
            <div class="flex items-baseline gap-4 mb-2">
              <span class="font-mono text-[10px] font-medium uppercase tracking-wider text-steel w-40 shrink-0">{{ type.name }}</span>
              <span class="font-mono text-[10px] text-steel">{{ type.size }}px / {{ type.weight }}{{ type.font ? ' / ' + type.font : '' }}</span>
            </div>
            <div
              class="text-nero"
              [style.font-size.px]="type.size"
              [style.font-weight]="type.weight"
              [style.font-family]="type.font === 'mono' ? 'var(--font-mono)' : 'var(--font-sans)'"
            >
              Structural Precision
            </div>
          </div>
        }
      </section>

      <div class="px-12"><div class="w-full h-px bg-steel"></div></div>

      <!-- Buttons -->
      <section class="px-12 py-12">
        <div class="font-mono text-xs font-medium uppercase tracking-wider text-steel mb-8">Buttons</div>

        <!-- Standard variants -->
        <div class="mb-8">
          <div class="font-mono text-[10px] font-medium uppercase tracking-wider text-steel mb-4">Variants</div>
          <div class="flex flex-wrap items-center gap-4">
            @for (v of standardVariants; track v) {
              <app-button [variant]="v">Button</app-button>
            }
          </div>
        </div>

        <!-- Icon / FAB variants -->
        <div class="mb-8">
          <div class="font-mono text-[10px] font-medium uppercase tracking-wider text-steel mb-4">Icon &amp; FAB</div>
          <div class="flex flex-wrap items-center gap-4">
            <app-button variant="icon" icon="home"></app-button>
            <app-button variant="fab" icon="add">Fab</app-button>
            <app-button variant="miniFab" icon="add"></app-button>
            <app-button variant="fabExtended" icon="edit">Extended Fab</app-button>
          </div>
        </div>

        <!-- Sizes -->
        <div class="mb-8">
          <div class="font-mono text-[10px] font-medium uppercase tracking-wider text-steel mb-4">Sizes</div>
          <div class="flex flex-wrap items-center gap-4">
            @for (s of sizes; track s) {
              <app-button variant="filled" [size]="s">{{ s | uppercase }}</app-button>
            }
          </div>
        </div>

        <!-- Disabled -->
        <div class="mb-8">
          <div class="font-mono text-[10px] font-medium uppercase tracking-wider text-steel mb-4">Disabled</div>
          <div class="flex flex-wrap items-center gap-4">
            @for (v of standardVariants; track v) {
              <app-button [variant]="v" [disabled]="true">Disabled</app-button>
            }
          </div>
        </div>
      </section>

      <div class="px-12"><div class="w-full h-px bg-steel"></div></div>

      <!-- Cards -->
      <section class="px-12 py-12">
        <div class="font-mono text-xs font-medium uppercase tracking-wider text-steel mb-8">Cards</div>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <app-card></app-card>
          <app-card title="Project Alpha"></app-card>
          <app-card category="Budget" title="Q4 Forecast"></app-card>
          <app-card category="Invoice" title="INV-2024-001">
            <p class="text-sm text-nero">Card content goes here. This demonstrates content projection inside a card.</p>
          </app-card>
        </div>
      </section>

      <div class="px-12"><div class="w-full h-px bg-steel"></div></div>

      <!-- Inputs -->
      <section class="px-12 py-12">
        <div class="font-mono text-xs font-medium uppercase tracking-wider text-steel mb-8">Inputs</div>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl">
          <app-input label="Default Input" />
          <app-input label="With Error" errorMessage="This field is required" />
          <app-input label="Disabled" [disabled]="true" />
        </div>
      </section>

      <div class="px-12"><div class="w-full h-px bg-steel"></div></div>

      <!-- Badges -->
      <section class="px-12 py-12">
        <div class="font-mono text-xs font-medium uppercase tracking-wider text-steel mb-8">Badges</div>
        <div class="flex flex-wrap gap-3">
          @for (s of badgeStatuses; track s) {
            <app-badge [status]="s" />
          }
        </div>
      </section>

      <div class="px-12"><div class="w-full h-px bg-steel"></div></div>

      <!-- Metric Cards -->
      <section class="px-12 py-12">
        <div class="font-mono text-xs font-medium uppercase tracking-wider text-steel mb-8">Metric Cards</div>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <app-metric-card value="$1.2M" label="Total Revenue" />
          <app-metric-card value="47" label="Active Projects" />
          <app-metric-card value="12" label="Pending Invoices" />
        </div>
      </section>

      <div class="px-12"><div class="w-full h-px bg-steel"></div></div>

      <!-- Tables -->
      <section class="px-12 py-12">
        <div class="font-mono text-xs font-medium uppercase tracking-wider text-steel mb-8">Tables</div>
        <app-table [columns]="tableColumns" [data]="tableData" />
      </section>

      <div class="px-12"><div class="w-full h-px bg-steel"></div></div>

      <!-- Links -->
      <section class="px-12 py-12">
        <div class="font-mono text-xs font-medium uppercase tracking-wider text-steel mb-8">Links</div>
        <div class="flex flex-wrap items-center gap-4">
          @for (v of linkVariants; track v) {
            <app-link [route]="'/ui'" [variant]="v">{{ v | titlecase }}</app-link>
          }
          <app-link route="/ui" variant="icon" icon="home"></app-link>
        </div>
      </section>

      <div class="px-12"><div class="w-full h-px bg-steel"></div></div>

      <!-- SelectOrCreate -->
      <section class="px-12 py-12 pb-24">
        <div class="font-mono text-xs font-medium uppercase tracking-wider text-steel mb-8">Select or Create</div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-2xl">
          <app-select-or-create
            label="Project"
            placeholder="Select a project..."
            [items]="sampleItems"
            [value]="null"
          />
          <app-select-or-create
            label="Client"
            placeholder="Select a client..."
            [items]="sampleItems"
            [value]="1"
            [disabled]="true"
          />
        </div>
      </section>

    </div>
  `,
  styles: `
    :host { display: block; }
  `,
})
export class DesignSystem {
  readonly standardVariants = ['text', 'filled', 'elevated', 'outlined', 'tonal'] as const;
  readonly sizes = ['sm', 'md', 'lg'] as const;
  readonly linkVariants = ['text', 'filled', 'elevated', 'outlined', 'tonal', 'link'] as const;

  readonly badgeStatuses = [
    'ACTIVE', 'APPROVED', 'PENDING', 'INACTIVE', 'DRAFT', 'SENT', 'ISSUED',
    'PLANNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'REJECTED', 'EXPIRED',
    'SUPERSEDED', 'PAID', 'OVERDUE', 'ADMIN', 'OPERATOR', 'MANAGER',
  ];

  readonly sampleItems = [
    { id: 1, name: 'Project Alpha' },
    { id: 2, name: 'Project Beta' },
    { id: 3, name: 'Project Gamma' },
  ];

  readonly tableColumns: TableColumn[] = [
    { key: 'id', label: 'ID', width: '80px' },
    { key: 'name', label: 'Name' },
    { key: 'status', label: 'Status', width: '120px' },
    { key: 'value', label: 'Value', width: '120px' },
  ];

  readonly tableData = [
    { id: '001', name: 'Structural Analysis', status: 'COMPLETED', value: '$24,500' },
    { id: '002', name: 'Foundation Work', status: 'IN_PROGRESS', value: '$18,200' },
    { id: '003', name: 'Electrical Systems', status: 'PENDING', value: '$31,000' },
    { id: '004', name: 'Plumbing Install', status: 'DRAFT', value: '$12,800' },
  ];

  readonly colorGroups = [
    {
      name: 'Brand',
      swatches: [
        { token: 'nero', hex: '#1C1C1D' },
        { token: 'construction-red', hex: '#E22D2D' },
        { token: 'cement', hex: '#E1E5E7' },
        { token: 'steel', hex: '#ACB4B6' },
      ],
    },
    {
      name: 'Primary',
      swatches: [
        { token: 'primary', hex: '#010101' },
        { token: 'on-primary', hex: '#ffffff' },
        { token: 'primary-container', hex: '#1c1c1d' },
        { token: 'on-primary-container', hex: '#858485' },
        { token: 'inverse-primary', hex: '#c8c6c7' },
      ],
    },
    {
      name: 'Secondary',
      swatches: [
        { token: 'secondary', hex: '#bb0416' },
        { token: 'on-secondary', hex: '#ffffff' },
        { token: 'secondary-container', hex: '#df2b2b' },
        { token: 'on-secondary-container', hex: '#fffbff' },
      ],
    },
    {
      name: 'Tertiary',
      swatches: [
        { token: 'tertiary', hex: '#000202' },
        { token: 'on-tertiary', hex: '#ffffff' },
        { token: 'tertiary-container', hex: '#181d1f' },
        { token: 'on-tertiary-container', hex: '#808587' },
      ],
    },
    {
      name: 'Error',
      swatches: [
        { token: 'error', hex: '#ba1a1a' },
        { token: 'on-error', hex: '#ffffff' },
        { token: 'error-container', hex: '#ffdad6' },
        { token: 'on-error-container', hex: '#93000a' },
      ],
    },
    {
      name: 'Surface',
      swatches: [
        { token: 'surface', hex: '#f3fbfd' },
        { token: 'on-surface', hex: '#151d1f' },
        { token: 'on-surface-variant', hex: '#46474a' },
        { token: 'surface-dim', hex: '#d3dbdd' },
        { token: 'surface-bright', hex: '#f3fbfd' },
        { token: 'surface-container-lowest', hex: '#ffffff' },
        { token: 'surface-container-low', hex: '#edf5f7' },
        { token: 'surface-container', hex: '#e7eff1' },
        { token: 'surface-container-high', hex: '#e2eaec' },
        { token: 'surface-container-highest', hex: '#dce4e6' },
        { token: 'surface-variant', hex: '#dce4e6' },
        { token: 'surface-tint', hex: '#5f5e5f' },
      ],
    },
    {
      name: 'Outline',
      swatches: [
        { token: 'outline', hex: '#76777b' },
        { token: 'outline-variant', hex: '#c6c6ca' },
      ],
    },
    {
      name: 'Background',
      swatches: [
        { token: 'background', hex: '#f3fbfd' },
        { token: 'on-background', hex: '#151d1f' },
      ],
    },
  ];

  readonly typographyScale = [
    { name: 'headline-xl', size: 64, weight: 800, font: null },
    { name: 'headline-lg', size: 40, weight: 700, font: null },
    { name: 'headline-lg-mobile', size: 32, weight: 700, font: null },
    { name: 'headline-md', size: 24, weight: 700, font: null },
    { name: 'metric-display', size: 48, weight: 800, font: null },
    { name: 'body-lg', size: 18, weight: 400, font: null },
    { name: 'body-md', size: 16, weight: 400, font: null },
    { name: 'label-mono', size: 12, weight: 500, font: 'mono' },
    { name: 'label-mono-sm', size: 10, weight: 500, font: 'mono' },
  ];
}
