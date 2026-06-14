import React, { useState, useEffect, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { useAddProjectMemberMutation } from '../../services/api/projectTasksApi';
import { useGetAllUsersQuery } from '../../services/api/userApi';
import { toast } from 'sonner';

const AddMemberModal = ({ open, onOpenChange, projectId }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const wrapperRef = useRef(null);

  const [addMember, { isLoading: isAdding }] = useAddProjectMemberMutation();

  // ✅ FIXED: safe API mapping
  const { data: usersData, isLoading: isUsersLoading } =
    useGetAllUsersQuery(
      { search: searchTerm },
      { skip: !open || (searchTerm || '').length < 2 }
    );

  // ✅ FIXED: correct response handling (your API returns {users: []})
  const users = usersData?.users ?? [];

  // reset on close
  useEffect(() => {
    if (!open) {
      setSearchTerm('');
      setSelectedUser(null);
      setDropdownOpen(false);
    }
  }, [open]);

  // close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectUser = (user) => {
    setSelectedUser(user);
    setSearchTerm(user.username || user.name || '');
    setDropdownOpen(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedUser) {
      toast.error('Please select a user');
      return;
    }

    try {
      await addMember({
        projectId,
        user_id: selectedUser.id,
      }).unwrap();

      toast.success(`${selectedUser.username || selectedUser.name} added successfully!`);
      onOpenChange(false);
    } catch (err) {
      toast.error('Failed to add member');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-zinc-900 border-zinc-800 text-white">
        <DialogHeader>
          <DialogTitle>Add Member</DialogTitle>
          <DialogDescription>
            Search and select a user to add to the project
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">

          {/* SEARCH + DROPDOWN */}
          <div className="relative" ref={wrapperRef}>
            <label className="text-sm font-medium">Search User</label>

            <Input
              placeholder="Type username or email..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setDropdownOpen(true);
                setSelectedUser(null);
              }}
              onFocus={() => setDropdownOpen(true)}
              className="bg-zinc-950 border-zinc-700 mt-2"
            />

            {/* DROPDOWN */}
            {dropdownOpen && (searchTerm || '').length >= 2 && (
              <div className="absolute z-50 w-full mt-1 max-h-60 overflow-auto rounded-lg border border-zinc-800 bg-zinc-950 shadow-lg">

                {isUsersLoading ? (
                  <p className="p-3 text-zinc-400">Searching...</p>
                ) : users?.length === 0 ? (
                  <p className="p-3 text-zinc-400">No users found</p>
                ) : (
                  users.map((user) => (
                    <div
                      key={user.id}
                      onClick={() => handleSelectUser(user)}
                      className="flex items-center gap-3 p-3 hover:bg-zinc-800 cursor-pointer"
                    >
                      <div className="w-9 h-9 bg-zinc-700 rounded-full flex items-center justify-center overflow-hidden">
                        {user.avatar_url ? (
                          <img
                            src={user.avatar_url}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          (user.username || user.name || '?')
                            .charAt(0)
                            .toUpperCase()
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">
                          {user.username || user.name}
                        </p>
                        <p className="text-sm text-zinc-400 truncate">
                          {user.email}
                        </p>
                      </div>

                      {selectedUser?.id === user.id && (
                        <Badge variant="secondary">Selected</Badge>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* SELECTED USER */}
          {selectedUser && (
            <div className="p-3 bg-zinc-950 border border-zinc-700 rounded-lg">
              <p className="text-sm text-zinc-400 mb-2">Selected User:</p>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-zinc-700 rounded-full flex items-center justify-center overflow-hidden">
                  {selectedUser.avatar_url ? (
                    <img
                      src={selectedUser.avatar_url}
                      className="w-full h-full object-cover"
                      alt=""
                    />
                  ) : (
                    (selectedUser.username || selectedUser.name)
                      ?.charAt(0)
                      .toUpperCase()
                  )}
                </div>

                <div>
                  <p className="font-medium">
                    {selectedUser.username || selectedUser.name}
                  </p>
                  <p className="text-sm text-zinc-400">
                    {selectedUser.email}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* FOOTER */}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isAdding}
            >
              Cancel
            </Button>

            <Button type="submit" disabled={isAdding || !selectedUser}>
              {isAdding ? 'Adding...' : 'Add to Project'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddMemberModal;