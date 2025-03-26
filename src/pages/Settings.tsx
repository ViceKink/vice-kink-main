import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Shield, Bell, CreditCard, LogOut, Gem, AlertCircle } from 'lucide-react';
import { useAuth } from '@/context/auth';
import { toast } from 'sonner';

const Settings = () => {
  const { user, logout } = useAuth();
  const [adCoins, setAdCoins] = useState(50); // Mock ad coins balance
  
  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Logged out successfully");
    } catch (error) {
      toast.error("Failed to log out");
      console.error(error);
    }
  };
  
  return (
    <div className="container mx-auto px-4 max-w-4xl pt-20 pb-24 md:pb-10">
      <h1 className="text-2xl md:text-3xl font-bold mb-6">Settings</h1>
      
      <Tabs defaultValue="account" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="privacy">Privacy</TabsTrigger>
          <TabsTrigger value="billing">AdCoins</TabsTrigger>
        </TabsList>
        
        <TabsContent value="account" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
              <CardDescription>
                Manage your account details and preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" defaultValue={user?.name} />
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="username">Username</Label>
                    <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">Read only</span>
                  </div>
                  <div className="relative">
                    <Input
                      id="username"
                      value={user?.username || ''}
                      disabled
                      className="bg-muted pr-10"
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <AlertCircle className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Username cannot be changed.</p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label htmlFor="email">Email</Label>
                  <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">Read only</span>
                </div>
                <div className="relative">
                  <Input
                    id="email"
                    value={user?.email || ''}
                    disabled
                    className="bg-muted pr-10"
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <AlertCircle className="h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-1">Email cannot be changed and will not be included in profile updates.</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="language">Language</Label>
                <Select defaultValue="en">
                  <SelectTrigger id="language">
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="es">Spanish</SelectItem>
                    <SelectItem value="fr">French</SelectItem>
                    <SelectItem value="de">German</SelectItem>
                    <SelectItem value="hi">Hindi</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline">Cancel</Button>
              <Button>Save Changes</Button>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Delete Account</CardTitle>
              <CardDescription>
                Permanently delete your account and all of your content
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Once you delete your account, there is no going back. Please be certain.
              </p>
            </CardContent>
            <CardFooter>
              <Button variant="destructive">Delete Account</Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Log Out</CardTitle>
              <CardDescription>
                Sign out of your account on this device
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <LogOut className="h-4 w-4" />
                You'll need to log back in to access your account
              </p>
            </CardContent>
            <CardFooter>
              <Button variant="outline" onClick={handleLogout}>
                Log Out
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="notifications" className="space-y-6">
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
        </TabsContent>
        
        <TabsContent value="privacy" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-vice-purple" />
                <CardTitle>Privacy Settings</CardTitle>
              </div>
              <CardDescription>
                Manage how your information is shared and displayed
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Profile Visibility</Label>
                  <p className="text-sm text-muted-foreground">
                    Control who can see your profile
                  </p>
                </div>
                <Select defaultValue="everyone">
                  <SelectTrigger className="w-[160px]">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="everyone">Everyone</SelectItem>
                    <SelectItem value="matches">Matches Only</SelectItem>
                    <SelectItem value="nobody">Hidden</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Online Status</Label>
                  <p className="text-sm text-muted-foreground">
                    Show when you're active on the platform
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Incognito Browsing</Label>
                  <p className="text-sm text-muted-foreground">
                    Browse profiles without them knowing
                  </p>
                </div>
                <Switch />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Blocked Users</CardTitle>
              <CardDescription>
                Manage users you've blocked from contacting you
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                You haven't blocked any users yet
              </p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="billing" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Gem className="h-5 w-5 text-yellow-500" />
                <CardTitle>AdCoins</CardTitle>
              </div>
              <CardDescription>
                Purchase and manage your AdCoins
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-vice-purple/10 to-vice-dark-purple/10 rounded-lg">
                <div>
                  <h3 className="font-medium">Current Balance</h3>
                  <p className="text-sm text-muted-foreground">Your available AdCoins</p>
                </div>
                <div className="text-2xl font-bold flex items-center gap-1">
                  <Gem className="h-5 w-5 text-yellow-500" />
                  {adCoins}
                </div>
              </div>
              
              <div>
                <h3 className="font-medium mb-3">Purchase AdCoins</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="hover:shadow-md transition-shadow cursor-pointer border-2 hover:border-vice-purple">
                    <CardContent className="p-4 flex flex-col items-center">
                      <Gem className="h-8 w-8 text-yellow-500 mb-2" />
                      <p className="text-lg font-bold mb-1">100 AdCoins</p>
                      <p className="text-sm text-muted-foreground mb-3">Basic Package</p>
                      <p className="text-lg font-semibold">$4.99</p>
                    </CardContent>
                  </Card>
                  
                  <Card className="hover:shadow-md transition-shadow cursor-pointer border-2 hover:border-vice-purple relative">
                    <div className="absolute -top-2 right-0 left-0 mx-auto w-fit bg-vice-purple text-white px-2 py-0.5 rounded-full text-xs font-medium">
                      POPULAR
                    </div>
                    <CardContent className="p-4 flex flex-col items-center">
                      <Gem className="h-8 w-8 text-yellow-500 mb-2" />
                      <p className="text-lg font-bold mb-1">500 AdCoins</p>
                      <p className="text-sm text-muted-foreground mb-3">Premium Package</p>
                      <p className="text-lg font-semibold">$19.99</p>
                    </CardContent>
                  </Card>
                  
                  <Card className="hover:shadow-md transition-shadow cursor-pointer border-2 hover:border-vice-purple">
                    <CardContent className="p-4 flex flex-col items-center">
                      <Gem className="h-8 w-8 text-yellow-500 mb-2" />
                      <p className="text-lg font-bold mb-1">1200 AdCoins</p>
                      <p className="text-sm text-muted-foreground mb-3">Ultimate Package</p>
                      <p className="text-lg font-semibold">$39.99</p>
                    </CardContent>
                  </Card>
                </div>
              </div>
              
              <div>
                <h3 className="font-medium mb-3">What can you do with AdCoins?</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-accent/50 p-4 rounded-lg">
                    <h4 className="font-medium mb-1">Boost Your Profile</h4>
                    <p className="text-sm text-muted-foreground">
                      Get more visibility in search results for 30 minutes (50 AdCoins)
                    </p>
                  </div>
                  
                  <div className="bg-accent/50 p-4 rounded-lg">
                    <h4 className="font-medium mb-1">See Who Likes You</h4>
                    <p className="text-sm text-muted-foreground">
                      View profiles of users who liked you (30 AdCoins per view)
                    </p>
                  </div>
                  
                  <div className="bg-accent/50 p-4 rounded-lg">
                    <h4 className="font-medium mb-1">Super Likes</h4>
                    <p className="text-sm text-muted-foreground">
                      Stand out from the crowd with a Super Like (20 AdCoins)
                    </p>
                  </div>
                  
                  <div className="bg-accent/50 p-4 rounded-lg">
                    <h4 className="font-medium mb-1">Rewind</h4>
                    <p className="text-sm text-muted-foreground">
                      Go back to profiles you accidentally passed (15 AdCoins)
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full">Purchase AdCoins</Button>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-vice-purple" />
                <CardTitle>Payment Methods</CardTitle>
              </div>
              <CardDescription>
                Manage your payment methods
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline">Add Payment Method</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
