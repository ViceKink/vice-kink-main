
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import ProfileTag from '@/components/ui/ProfileTag';
import { Check, Plus, Loader2 } from 'lucide-react';

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
}

const VicesKinksManager = ({ mode }: VicesKinksManagerProps) => {
  const { user, updateUserVices, updateUserKinks } = useAuth();
  const [items, setItems] = useState<(Vice | Kink)[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

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
        if (user) {
          const userItems = mode === 'vices' ? user.vices : user.kinks;
          if (userItems && userItems.length > 0) {
            // Find IDs for the items that match names in user profile
            const matchingIds = data
              ?.filter(item => userItems.includes(item.name))
              .map(item => item.id) || [];
            setSelectedIds(matchingIds);
          }
        }
      } catch (error) {
        console.error(`Error fetching ${mode}:`, error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchItems();
  }, [mode, user]);

  const handleItemToggle = (id: string) => {
    setSelectedIds(prev => {
      if (prev.includes(id)) {
        return prev.filter(itemId => itemId !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (mode === 'vices') {
        await updateUserVices(selectedIds);
      } else {
        await updateUserKinks(selectedIds);
      }
    } catch (error) {
      console.error(`Error updating ${mode}:`, error);
    } finally {
      setSaving(false);
    }
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
      <h3 className="text-lg font-semibold">
        Manage your {mode === 'vices' ? 'vices' : 'kinks'}
      </h3>
      <p className="text-sm text-muted-foreground">
        Select all that apply to you. This information will be visible on your profile.
      </p>
      
      <div className="flex flex-wrap gap-2 mt-4">
        {items.map((item) => (
          <button
            key={item.id}
            className="group relative"
            onClick={() => handleItemToggle(item.id)}
          >
            <ProfileTag 
              label={item.name}
              type={mode === 'vices' ? 'vice' : 'kink'}
              isActive={selectedIds.includes(item.id)}
              className="pr-6"
            />
            {selectedIds.includes(item.id) ? (
              <span className="absolute right-1 top-1/2 transform -translate-y-1/2 h-4 w-4 flex items-center justify-center rounded-full bg-foreground/10">
                <Check className="h-3 w-3" />
              </span>
            ) : (
              <span className="absolute right-1 top-1/2 transform -translate-y-1/2 h-4 w-4 flex items-center justify-center rounded-full bg-foreground/5 group-hover:bg-foreground/10">
                <Plus className="h-3 w-3" />
              </span>
            )}
          </button>
        ))}
      </div>
      
      <div className="flex justify-end pt-4">
        <Button 
          disabled={saving}
          onClick={handleSave}
          className="bg-vice-purple hover:bg-vice-dark-purple"
        >
          {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save {mode === 'vices' ? 'Vices' : 'Kinks'}
        </Button>
      </div>
    </div>
  );
};

export default VicesKinksManager;
