import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Trash2, Plus, Settings } from "lucide-react";
import { Badge } from "./ui/badge";

interface MerchantConfigProps {
  selectedMerchants: string[];
  onMerchantsChange: (merchantIds: string[]) => void;
}

interface MerchantInfo {
  id: string;
  name: string;
}

export function MerchantConfig({ selectedMerchants, onMerchantsChange }: MerchantConfigProps) {
  const [newMerchantId, setNewMerchantId] = useState("");
  const [newMerchantName, setNewMerchantName] = useState("");
  const [merchantNames, setMerchantNames] = useState<Record<string, string>>({
    // Pre-populate with some example merchants (you'll need to replace with actual IDs)
    "10001": "Example Electronics Store",
    "20002": "Example Fashion Retailer",
  });

  const addMerchant = () => {
    if (newMerchantId.trim() && newMerchantName.trim()) {
      const updatedMerchants = [...selectedMerchants, newMerchantId.trim()];
      const updatedNames = { ...merchantNames, [newMerchantId.trim()]: newMerchantName.trim() };
      
      onMerchantsChange(updatedMerchants);
      setMerchantNames(updatedNames);
      setNewMerchantId("");
      setNewMerchantName("");
    }
  };

  const removeMerchant = (merchantId: string) => {
    const updatedMerchants = selectedMerchants.filter(id => id !== merchantId);
    onMerchantsChange(updatedMerchants);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          <CardTitle>Merchant Configuration</CardTitle>
        </div>
        <CardDescription>
          Configure which specific merchants to monitor for sale items. Maximum 2 merchants recommended for focused tracking.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Selected Merchants */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Selected Merchants ({selectedMerchants.length}/2)</Label>
          {selectedMerchants.length === 0 ? (
            <p className="text-sm text-muted-foreground">No merchants selected. Add merchants below to start monitoring their sale items.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {selectedMerchants.map((merchantId) => (
                <Badge key={merchantId} variant="secondary" className="flex items-center gap-2 px-3 py-1">
                  <span className="font-mono text-xs">{merchantId}</span>
                  <span>-</span>
                  <span>{merchantNames[merchantId] || "Unknown Merchant"}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
                    onClick={() => removeMerchant(merchantId)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Add New Merchant */}
        {selectedMerchants.length < 2 && (
          <div className="space-y-3 p-4 border rounded-lg bg-muted/50">
            <Label className="text-sm font-medium">Add New Merchant</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="merchant-id" className="text-xs">Merchant ID</Label>
                <Input
                  id="merchant-id"
                  placeholder="e.g., 12345"
                  value={newMerchantId}
                  onChange={(e) => setNewMerchantId(e.target.value)}
                  className="font-mono"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="merchant-name" className="text-xs">Merchant Name</Label>
                <Input
                  id="merchant-name"
                  placeholder="e.g., Best Electronics Store"
                  value={newMerchantName}
                  onChange={(e) => setNewMerchantName(e.target.value)}
                />
              </div>
            </div>
            <Button 
              onClick={addMerchant} 
              className="w-full" 
              disabled={!newMerchantId.trim() || !newMerchantName.trim()}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Merchant
            </Button>
          </div>
        )}

        {/* Help Text */}
        <div className="text-xs text-muted-foreground space-y-1">
          <p><strong>How to find Merchant IDs:</strong></p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>Log into your AvantLink account</li>
            <li>Go to Tools → Link Locator</li>
            <li>Search for the merchant you want to track</li>
            <li>The Merchant ID will be shown in the merchant details</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}