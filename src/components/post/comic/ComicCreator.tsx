
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle, LayoutGrid, Save } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ComicPanel, ComicPanelData } from './ComicPanel';
import { comicLayouts, PanelLayout } from './ComicLayoutTemplates';
import { toast } from 'sonner';

interface ComicCreatorProps {
  onSave: (panels: ComicPanelData[]) => void;
  onCancel: () => void;
}

const ComicCreator: React.FC<ComicCreatorProps> = ({ onSave, onCancel }) => {
  const [panels, setPanels] = useState<ComicPanelData[]>([]);
  const [editingPanelId, setEditingPanelId] = useState<string>('');
  const [selectedLayout, setSelectedLayout] = useState<PanelLayout | null>(null);
  const [activeTab, setActiveTab] = useState<string>('layout');
  
  const addPanel = () => {
    const newPanel: ComicPanelData = {
      id: `panel-${Date.now()}`,
      content: '',
      bubbles: []
    };
    setPanels([...panels, newPanel]);
    setEditingPanelId(newPanel.id);
  };
  
  const removePanel = (id: string) => {
    setPanels(panels.filter(panel => panel.id !== id));
  };
  
  const updatePanel = (updatedPanel: ComicPanelData) => {
    setPanels(panels.map(panel => 
      panel.id === updatedPanel.id ? updatedPanel : panel
    ));
  };
  
  const handleSaveComic = () => {
    if (panels.length === 0) {
      toast.error("Please add at least one panel before saving");
      return;
    }
    
    // Check if any panel is currently being edited
    if (editingPanelId) {
      toast.warning("Please save the panel you're currently editing first");
      return;
    }
    
    onSave(panels);
    toast.success("Comic saved successfully!");
  };
  
  const applyLayout = (layout: PanelLayout) => {
    setSelectedLayout(layout);
    
    // Create panels based on the selected layout
    const newPanels = layout.template.map((template, index) => ({
      id: template.id,
      content: '',
      bubbles: [],
      gridArea: template.gridArea
    }));
    
    setPanels(newPanels);
    
    // Automatically switch to Edit Panels tab after selecting a layout
    setActiveTab('custom');
    
    // Set the first panel to edit mode
    if (newPanels.length > 0) {
      setEditingPanelId(newPanels[0].id);
    }
  };
  
  return (
    <div className="bg-card p-6 rounded-xl border border-border">
      <h3 className="text-xl font-bold mb-4">Create Comic</h3>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList>
          <TabsTrigger value="layout" className="flex items-center gap-2">
            <LayoutGrid className="h-4 w-4" />
            Choose Layout
          </TabsTrigger>
          <TabsTrigger value="custom" disabled={panels.length === 0}>
            Edit Panels
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="layout" className="space-y-4 py-4">
          <p className="text-muted-foreground mb-4">
            Select a layout for your comic panels:
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {comicLayouts.map(layout => (
              <div 
                key={layout.id} 
                className={`cursor-pointer ${selectedLayout?.id === layout.id ? 'ring-2 ring-primary' : ''}`}
                onClick={() => applyLayout(layout)}
              >
                <div className="p-4 border rounded-lg hover:border-primary transition-colors">
                  <h4 className="font-medium mb-2">{layout.name}</h4>
                  
                  <div 
                    className="w-full aspect-[4/5] grid gap-2 bg-muted/30 border border-border"
                    style={{ 
                      display: 'grid',
                      gridTemplateRows: 'repeat(3, 1fr)',
                      gridTemplateColumns: 'repeat(2, 1fr)',
                    }}
                  >
                    {layout.template.map((panel) => (
                      <div
                        key={panel.id}
                        className="bg-muted/70"
                        style={{
                          gridArea: panel.gridArea
                        }}
                      />
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">{layout.description}</p>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="custom">
          {selectedLayout ? (
            <div 
              className="grid gap-4 mb-6 w-full" 
              style={{ 
                display: 'grid',
                gridTemplateRows: 'repeat(3, minmax(150px, auto))',
                gridTemplateColumns: 'repeat(2, 1fr)',
              }}
            >
              {panels.map(panel => (
                <ComicPanel
                  key={panel.id}
                  panel={panel}
                  onEdit={setEditingPanelId}
                  onUpdate={updatePanel}
                  onRemove={removePanel}
                  isEditing={editingPanelId === panel.id}
                />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 w-full gap-4 mb-6">
              {panels.map(panel => (
                <ComicPanel
                  key={panel.id}
                  panel={panel}
                  onEdit={setEditingPanelId}
                  onUpdate={updatePanel}
                  onRemove={removePanel}
                  isEditing={editingPanelId === panel.id}
                />
              ))}
            </div>
          )}
          
          <Button 
            variant="outline" 
            className="flex items-center justify-center gap-2"
            onClick={addPanel}
          >
            <PlusCircle className="w-5 h-5" />
            Add Panel
          </Button>
        </TabsContent>
      </Tabs>
      
      <div className="flex justify-end gap-2 mt-4">
        <Button variant="outline" onClick={onCancel}>Cancel</Button>
        <Button 
          className="bg-vice-purple hover:bg-vice-dark-purple"
          onClick={handleSaveComic}
          disabled={panels.length === 0}
        >
          <Save className="h-4 w-4 mr-2" />
          Save Comic
        </Button>
      </div>
    </div>
  );
};

export default ComicCreator;
