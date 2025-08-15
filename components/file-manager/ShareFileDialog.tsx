'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Share2, Users, Mail } from 'lucide-react';

interface TenantMember {
  id: string;
  email: string;
  name: string;
  tenantType: string;
}

interface ShareFileDialogProps {
  fileId: number;
  fileName: string;
  onShare: (fileId: number, email: string) => Promise<void>;
  trigger?: React.ReactNode;
}

export function ShareFileDialog({
  fileId,
  fileName,
  onShare,
  trigger,
}: ShareFileDialogProps) {
  const [open, setOpen] = useState(false);
  const [members, setMembers] = useState<TenantMember[]>([]);
  const [loading, setLoading] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [customEmail, setCustomEmail] = useState('');
  const [selectedMember, setSelectedMember] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      fetchTenantMembers();
    }
  }, [open]);

  const fetchTenantMembers = async () => {
    setLoading(true);
    try {
      console.log('Fetching tenant members...');
      const response = await fetch('/api/users/tenant-members');
      console.log('Response status:', response.status);
      if (response.ok) {
        const data = await response.json();
        console.log('Tenant members data:', data);
        setMembers(data.members || []);
      } else {
        const errorData = await response.json();
        console.error('Failed to fetch tenant members:', errorData);
        toast.error('Failed to load team members');
      }
    } catch (error) {
      console.error('Error fetching tenant members:', error);
      toast.error('Failed to load team members');
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    const emailToShare = selectedMember
      ? members.find((m) => m.id === selectedMember)?.email
      : customEmail;

    if (!emailToShare) {
      toast.error('Please select a team member or enter an email address');
      return;
    }

    setSharing(true);
    try {
      await onShare(fileId, emailToShare);
      toast.success(`File shared with ${emailToShare}`);
      setOpen(false);
      setSelectedMember(null);
      setCustomEmail('');
    } catch (error) {
      console.error('Failed to share file:', error);
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to share file';
      toast.error(errorMessage);
    } finally {
      setSharing(false);
    }
  };

  const handleMemberSelect = (memberId: string) => {
    setSelectedMember(memberId);
    setCustomEmail(''); // Clear custom email when selecting a member
  };

  const handleCustomEmailChange = (email: string) => {
    setCustomEmail(email);
    setSelectedMember(null); // Clear selected member when typing custom email
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <Share2 className="size-4 mr-2" />
            Share
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share &quot;{fileName}&quot;</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {/* Team Members Section */}
          {loading ? (
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Users className="size-4" />
                Team Members
              </Label>
              <div className="max-h-40 overflow-y-auto space-y-2 border rounded-md p-2">
                <div className="text-center text-muted-foreground py-4">
                  Loading team members...
                </div>
              </div>
            </div>
          ) : members.length > 0 ? (
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Users className="size-4" />
                Team Members ({members.length})
              </Label>
              <div className="max-h-40 overflow-y-auto space-y-2 border rounded-md p-2">
                {members.map((member) => (
                  <div
                    key={member.id}
                    role="button"
                    tabIndex={0}
                    className={`flex items-center justify-between p-2 rounded-md cursor-pointer transition-colors ${
                      selectedMember === member.id
                        ? 'bg-primary/10 border border-primary/20'
                        : 'hover:bg-muted'
                    }`}
                    onClick={() => handleMemberSelect(member.id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleMemberSelect(member.id);
                      }
                    }}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{member.name}</div>
                      <div className="text-sm text-muted-foreground truncate">
                        {member.email}
                      </div>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {member.tenantType}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Users className="size-4" />
                Team Members
              </Label>
              <div className="max-h-40 overflow-y-auto space-y-2 border rounded-md p-2">
                <div className="text-center text-muted-foreground py-4">
                  No team members found
                </div>
              </div>
            </div>
          )}

          {/* Custom Email Section */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Mail className="size-4" />
              Or enter email address
            </Label>
            <Input
              type="email"
              placeholder="Enter email address"
              value={customEmail}
              onChange={(e) => handleCustomEmailChange(e.target.value)}
              className={selectedMember ? 'opacity-50' : ''}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={sharing}
            >
              Cancel
            </Button>
            <Button
              onClick={handleShare}
              disabled={sharing || (!selectedMember && !customEmail)}
            >
              {sharing ? 'Sharing...' : 'Share File'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
