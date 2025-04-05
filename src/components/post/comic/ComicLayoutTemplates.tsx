
import React from 'react';

// Types for panel layout
export interface PanelLayout {
  id: string;
  name: string;
  description: string;
  template: PanelTemplate[];
}

export interface PanelTemplate {
  id: string;
  gridArea: string;
  aspectRatio?: number;
}

// Predefined layout templates
export const comicLayouts: PanelLayout[] = [
  {
    id: 'vertical-stack',
    name: 'Vertical Story',
    description: 'A vertical sequence of panels',
    template: [
      { id: 'panel-1', gridArea: '1 / 1 / 2 / 3', aspectRatio: 16/9 },
      { id: 'panel-2', gridArea: '2 / 1 / 3 / 3', aspectRatio: 16/9 },
      { id: 'panel-3', gridArea: '3 / 1 / 4 / 3', aspectRatio: 16/9 },
      { id: 'panel-4', gridArea: '4 / 1 / 5 / 3', aspectRatio: 16/9 },
    ]
  },
  {
    id: 'grid-layout',
    name: 'Grid Layout',
    description: 'A combination of panels in grid format',
    template: [
      { id: 'panel-1', gridArea: '1 / 1 / 2 / 3', aspectRatio: 16/9 },
      { id: 'panel-2', gridArea: '2 / 1 / 3 / 2', aspectRatio: 1 },
      { id: 'panel-3', gridArea: '2 / 2 / 3 / 3', aspectRatio: 1 },
      { id: 'panel-4', gridArea: '3 / 1 / 4 / 3', aspectRatio: 16/9 },
    ]
  },
  {
    id: 'mixed-panels',
    name: 'Mixed Panels',
    description: 'A varied layout with different sized panels',
    template: [
      { id: 'panel-1', gridArea: '1 / 1 / 3 / 2', aspectRatio: 2/3 },
      { id: 'panel-2', gridArea: '1 / 2 / 2 / 3', aspectRatio: 3/2 },
      { id: 'panel-3', gridArea: '2 / 2 / 3 / 3', aspectRatio: 3/2 },
      { id: 'panel-4', gridArea: '3 / 1 / 4 / 3', aspectRatio: 16/9 },
    ]
  },
];

// Component to preview the layout
export const LayoutPreview: React.FC<{ layout: PanelLayout }> = ({ layout }) => {
  return (
    <div className="border border-muted-foreground rounded-md p-2 hover:border-primary transition-colors">
      <p className="text-sm font-medium mb-2">{layout.name}</p>
      <div 
        className="grid grid-cols-2 gap-1 w-full aspect-[3/4] bg-muted/50"
        style={{ 
          display: 'grid',
          gridTemplateRows: 'repeat(3, 1fr)',
          gridTemplateColumns: 'repeat(2, 1fr)',
        }}
      >
        {layout.template.map((panel) => (
          <div
            key={panel.id}
            className="bg-muted border border-dashed border-muted-foreground/50"
            style={{
              gridArea: panel.gridArea,
              aspectRatio: panel.aspectRatio
            }}
          />
        ))}
      </div>
    </div>
  );
};
