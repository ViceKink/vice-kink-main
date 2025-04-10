
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/auth';
import { supabase } from '@/integrations/supabase/client';
import ProfileTag from '@/components/ui/ProfileTag';
import { Check, Plus, X, Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface Vice {
  id: string;
  name: string;
}

interface Kink {
  id: string;
  name: string;
}

interface VicesKinksManagerProps {
  mode: 'vices' | 'kinks';
  userData: any;
  updateField: (field: string, value: any) => void;
}

const VicesKinksManager = ({ mode, userData, updateField }: VicesKinksManagerProps) => {
  const [items, setItems] = useState<(Vice | Kink)[]>([]);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  
  const MAX_ITEMS = 5;

  useEffect(() => {
    const fetchItems = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from(mode)
          .select('*')
          .order('name');
          
        if (error) throw error;
        setItems(data || []);

        // Set initially selected items based on user profile
        const userItems = mode === 'vices' ? userData.vices : userData.kinks;
        if (userItems && userItems.length > 0) {
          setSelectedItems(userItems);
        }
      } catch (error) {
        console.error(`Error fetching ${mode}:`, error);
        toast.error(`Could not load ${mode}. Please try again.`);
      } finally {
        setLoading(false);
      }
    };
    
    fetchItems();
  }, [mode, userData]);

  const handleItemToggle = (itemName: string) => {
    setSelectedItems(prev => {
      let newItems;
      
      if (prev.includes(itemName)) {
        // Remove the item if it's already selected
        newItems = prev.filter(item => item !== itemName);
      } else {
        // Add the item only if we haven't reached the max
        if (prev.length >= MAX_ITEMS) {
          toast.error(`You can only select up to ${MAX_ITEMS} ${mode}.`);
          return prev;
        }
        newItems = [...prev, itemName];
      }
      
      // Update parent component state immediately
      const fieldName = mode === 'vices' ? 'vices' : 'kinks';
      updateField(fieldName, newItems);
      
      return newItems;
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-6">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">
          Select all that apply to you. This information will be visible on your profile.
        </p>
        <span className="text-sm font-medium">
          {selectedItems.length}/{MAX_ITEMS}
        </span>
      </div>
      
      {selectedItems.length >= MAX_ITEMS && (
        <div className="flex items-center gap-1 text-amber-500 text-sm">
          <AlertCircle className="h-4 w-4" />
          <span>Maximum of {MAX_ITEMS} {mode} reached.</span>
        </div>
      )}
      
      <div className="flex flex-wrap gap-2 mt-4">
        {items.map((item) => {
          const isSelected = selectedItems.includes(item.name);
          return (
            <button
              key={item.id}
              className="group relative"
              onClick={() => handleItemToggle(item.name)}
              disabled={!isSelected && selectedItems.length >= MAX_ITEMS}
            >
              <ProfileTag 
                label={item.name}
                type={mode === 'vices' ? 'vice' : 'kink'}
                isActive={isSelected}
              />
              {isSelected && (
                <span className="absolute -top-1.5 -right-1.5 h-4 w-4 flex items-center justify-center rounded-full bg-foreground/10">
                  <X className="h-3 w-3" />
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default VicesKinksManager;
