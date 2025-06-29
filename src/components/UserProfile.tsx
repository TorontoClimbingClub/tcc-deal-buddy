
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Phone, User, LogOut, Edit2, Check, X } from 'lucide-react';
import { usePhoneAuth } from '@/contexts/PhoneAuthContext';

export const UserProfile: React.FC = () => {
  const { user, logout, updateDisplayName } = usePhoneAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [newDisplayName, setNewDisplayName] = useState(user?.display_name || '');
  const [isUpdating, setIsUpdating] = useState(false);

  if (!user) return null;

  const handleUpdateDisplayName = async () => {
    setIsUpdating(true);
    const result = await updateDisplayName(newDisplayName);
    if (result.success) {
      setIsEditing(false);
    }
    setIsUpdating(false);
  };

  const handleCancelEdit = () => {
    setNewDisplayName(user.display_name || '');
    setIsEditing(false);
  };

  const formatPhoneNumber = (phone: string) => {
    if (phone.length === 10) {
      return `(${phone.slice(0, 3)}) ${phone.slice(3, 6)}-${phone.slice(6)}`;
    }
    return phone;
  };

  return (
    <Card className="w-full max-w-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <User className="h-5 w-5" />
          User Profile
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Phone className="h-4 w-4" />
            <span>Phone Number</span>
          </div>
          <Badge variant="secondary" className="font-mono">
            {formatPhoneNumber(user.phone_number)}
          </Badge>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <User className="h-4 w-4" />
            <span>Display Name</span>
          </div>
          {isEditing ? (
            <div className="flex gap-2">
              <Input
                value={newDisplayName}
                onChange={(e) => setNewDisplayName(e.target.value)}
                placeholder="Enter display name"
                className="flex-1"
              />
              <Button 
                size="sm" 
                variant="outline"
                onClick={handleUpdateDisplayName}
                disabled={isUpdating}
              >
                <Check className="h-4 w-4" />
              </Button>
              <Button 
                size="sm" 
                variant="outline"
                onClick={handleCancelEdit}
                disabled={isUpdating}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">
                {user.display_name || 'No display name set'}
              </span>
              <Button 
                size="sm" 
                variant="ghost"
                onClick={() => setIsEditing(true)}
              >
                <Edit2 className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>

        <div className="pt-2 border-t">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={logout}
            className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
