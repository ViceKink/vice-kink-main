
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';

const NotificationSettings = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Notification Preferences</CardTitle>
        <CardDescription>
          Decide what you want to be notified about
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>New Matches</Label>
            <p className="text-sm text-muted-foreground">
              Get notified when someone matches with you
            </p>
          </div>
          <Switch defaultChecked />
        </div>
        
        <Separator />
        
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>New Messages</Label>
            <p className="text-sm text-muted-foreground">
              Get notified when you receive a message
            </p>
          </div>
          <Switch defaultChecked />
        </div>
        
        <Separator />
        
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>Profile Likes</Label>
            <p className="text-sm text-muted-foreground">
              Get notified when someone likes your profile
            </p>
          </div>
          <Switch defaultChecked />
        </div>
        
        <Separator />
        
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>Marketing Emails</Label>
            <p className="text-sm text-muted-foreground">
              Receive emails about new features and offers
            </p>
          </div>
          <Switch />
        </div>
      </CardContent>
    </Card>
  );
};

export default NotificationSettings;
