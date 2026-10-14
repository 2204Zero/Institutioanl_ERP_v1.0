import React, { useState, useMemo } from 'react';
import {
  Building2,
  Search,
  Plus,
  Edit2,
  CheckCircle,
  XCircle,
  Calendar,
  Users,
  Loader2,
  Trash2
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '../ui/table';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '../ui/dialog';
import {
  useRooms,
  useCreateRoom,
  useUpdateRoom,
  useActivateRoom,
  useDeactivateRoom,
  useDeleteRoom,
  type Room
} from '../../hooks/queries/useAcademics';
import { toast } from 'sonner';

interface RoomsTabProps {
  isAdmin: boolean;
}

export function RoomsTab({ isAdmin }: RoomsTabProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);

  // Create form state
  const [newName, setNewName] = useState('');
  const [newCapacity, setNewCapacity] = useState('60');

  // Edit form state
  const [editName, setEditName] = useState('');
  const [editCapacity, setEditCapacity] = useState('');

  const { data: rooms = [], isLoading, isError } = useRooms(true);
  const createRoomMutation = useCreateRoom();
  const updateRoomMutation = useUpdateRoom();
  const activateRoomMutation = useActivateRoom();
  const deactivateRoomMutation = useDeactivateRoom();
  const deleteRoomMutation = useDeleteRoom();

  const filteredRooms = useMemo(() => {
    return rooms.filter(r => {
      const term = searchTerm.toLowerCase();
      const name = (r.name || '').toLowerCase();
      const cap = String(r.capacity || '');
      return name.includes(term) || cap.includes(term);
    });
  }, [rooms, searchTerm]);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) {
      toast.error('Room name or number is required');
      return;
    }
    const cap = parseInt(newCapacity, 10);
    if (isNaN(cap) || cap <= 0) {
      toast.error('Capacity must be a positive number');
      return;
    }

    createRoomMutation.mutate(
      { name: newName.trim(), capacity: cap, isActive: true },
      {
        onSuccess: (created) => {
          toast.success(`Room "${created.name}" created successfully!`);
          setIsCreateOpen(false);
          setNewName('');
          setNewCapacity('60');
        },
        onError: (err: any) => {
          const msg = err.response?.data?.message || err.message || 'Failed to create room';
          toast.error(msg);
        }
      }
    );
  };

  const openEdit = (room: Room) => {
    setEditingRoom(room);
    setEditName(room.name);
    setEditCapacity(String(room.capacity));
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRoom) return;
    if (!editName.trim()) {
      toast.error('Room name or number is required');
      return;
    }
    const cap = parseInt(editCapacity, 10);
    if (isNaN(cap) || cap <= 0) {
      toast.error('Capacity must be a positive number');
      return;
    }

    updateRoomMutation.mutate(
      { id: editingRoom.id, data: { name: editName.trim(), capacity: cap } },
      {
        onSuccess: (updated) => {
          toast.success(`Room "${updated.name}" updated successfully!`);
          setEditingRoom(null);
        },
        onError: (err: any) => {
          const msg = err.response?.data?.message || err.message || 'Failed to update room';
          toast.error(msg);
        }
      }
    );
  };

  const handleToggleStatus = (room: Room) => {
    if (room.isActive) {
      deactivateRoomMutation.mutate(room.id, {
        onSuccess: () => toast.success(`Room "${room.name}" deactivated`),
        onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to deactivate room')
      });
    } else {
      activateRoomMutation.mutate(room.id, {
        onSuccess: () => toast.success(`Room "${room.name}" activated`),
        onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to activate room')
      });
    }
  };

  const handleDelete = (room: Room) => {
    if (room.timetableSlotCount && room.timetableSlotCount > 0) {
      toast.error(`Cannot delete room "${room.name}" because it is referenced by ${room.timetableSlotCount} timetable slots. Deactivate it instead.`);
      return;
    }
    if (!window.confirm(`Are you sure you want to permanently delete room "${room.name}"?`)) {
      return;
    }

    deleteRoomMutation.mutate(room.id, {
      onSuccess: () => toast.success(`Room "${room.name}" removed`),
      onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to delete room')
    });
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-slate-700" />
            Institutional Rooms & Facilities Management
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Browse lecture halls, seminar rooms, and labs. Rooms are synchronized directly with Timetable scheduling.
          </p>
        </div>

        {isAdmin && (
          <Button
            onClick={() => setIsCreateOpen(true)}
            className="bg-black text-white hover:bg-slate-800 rounded-full text-xs font-semibold px-4 h-9 flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            Add New Room
          </Button>
        )}
      </div>

      {/* Search and Summary Bar */}
      <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input
            type="text"
            placeholder="Search room by name or capacity..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 bg-white border-slate-200 text-xs h-9 rounded-lg"
          />
        </div>
        <div className="text-xs text-slate-500 font-medium">
          Showing <span className="font-bold text-slate-900">{filteredRooms.length}</span> of {rooms.length} facilities
        </div>
      </div>

      {/* Rooms Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead className="font-semibold px-6 py-3.5 text-xs">Room / Facility</TableHead>
              <TableHead className="font-semibold px-6 py-3.5 text-xs">Student Capacity</TableHead>
              <TableHead className="font-semibold px-6 py-3.5 text-xs">Timetable Reference</TableHead>
              <TableHead className="font-semibold px-6 py-3.5 text-xs">Operational Status</TableHead>
              {isAdmin && <TableHead className="text-right px-6 py-3.5 text-xs">Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={isAdmin ? 5 : 4} className="h-32 text-center text-slate-400">
                  <div className="flex justify-center items-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin text-slate-500" />
                    <span className="text-xs">Loading facilities...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : isError ? (
              <TableRow>
                <TableCell colSpan={isAdmin ? 5 : 4} className="h-32 text-center text-red-600 text-xs font-semibold">
                  Failed to load rooms. Please check backend connection.
                </TableCell>
              </TableRow>
            ) : filteredRooms.length === 0 ? (
              <TableRow>
                <TableCell colSpan={isAdmin ? 5 : 4} className="h-32 text-center text-slate-500 text-xs">
                  No rooms found matching "{searchTerm}".
                </TableCell>
              </TableRow>
            ) : (
              filteredRooms.map((room) => {
                const slotCount = room.timetableSlotCount ?? 0;
                return (
                  <TableRow key={room.id} className="hover:bg-slate-50/80 transition-colors">
                    <TableCell className="px-6 py-4 font-semibold text-slate-900 text-xs">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-slate-400" />
                        <span>{room.name}</span>
                        <span className="text-[10px] text-slate-400 font-mono">#{room.id}</span>
                      </div>
                    </TableCell>
                    <TableCell className="px-6 py-4 text-xs text-slate-700">
                      <div className="flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-slate-400" />
                        <span className="font-medium">{room.capacity} seats</span>
                      </div>
                    </TableCell>
                    <TableCell className="px-6 py-4 text-xs">
                      {slotCount > 0 ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                          <Calendar className="w-3 h-3" />
                          {slotCount} {slotCount === 1 ? 'Slot' : 'Slots'} Booked
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-500">
                          Available / Unscheduled
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="px-6 py-4 text-xs">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold ${
                        room.isActive ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-600 border border-slate-200'
                      }`}>
                        {room.isActive ? (
                          <><CheckCircle className="w-3 h-3 mr-1" /> ACTIVE</>
                        ) : (
                          <><XCircle className="w-3 h-3 mr-1" /> INACTIVE</>
                        )}
                      </span>
                    </TableCell>
                    {isAdmin && (
                      <TableCell className="text-right px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEdit(room)}
                            className="h-8 text-xs font-semibold px-2.5"
                          >
                            <Edit2 className="w-3.5 h-3.5 mr-1" />
                            Edit
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleToggleStatus(room)}
                            className="h-8 text-xs font-semibold px-2.5 text-slate-600 hover:text-slate-900"
                          >
                            {room.isActive ? 'Deactivate' : 'Activate'}
                          </Button>
                          {slotCount === 0 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(room)}
                              className="h-8 text-xs text-red-600 hover:text-red-800 hover:bg-red-50 px-2"
                              title="Delete Room"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Create Room Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="sm:max-w-md bg-white rounded-2xl shadow-xl p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-slate-700" />
              Create Room / Facility
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Add a new room or lecture hall to the institutional timetable pool.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreate} className="space-y-4 pt-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Room Name or Number *
              </label>
              <Input
                required
                placeholder="e.g. Room 304, LH-1, Physics Lab 2"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="text-xs bg-slate-50 border-slate-200"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Student Seating Capacity *
              </label>
              <Input
                required
                type="number"
                min="1"
                placeholder="60"
                value={newCapacity}
                onChange={(e) => setNewCapacity(e.target.value)}
                className="text-xs bg-slate-50 border-slate-200"
              />
            </div>

            <DialogFooter className="pt-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsCreateOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createRoomMutation.isPending}
                size="sm"
                className="bg-black text-white hover:bg-slate-800"
              >
                {createRoomMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-1" />
                ) : (
                  <Plus className="w-4 h-4 mr-1" />
                )}
                Create Room
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Room Dialog */}
      <Dialog open={!!editingRoom} onOpenChange={(open) => !open && setEditingRoom(null)}>
        <DialogContent className="sm:max-w-md bg-white rounded-2xl shadow-xl p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Edit2 className="w-4 h-4 text-slate-700" />
              Edit Room Details
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Modify room name or seating capacity for Record #{editingRoom?.id}.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleUpdate} className="space-y-4 pt-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Room Name or Number *
              </label>
              <Input
                required
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="text-xs bg-slate-50 border-slate-200"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Student Seating Capacity *
              </label>
              <Input
                required
                type="number"
                min="1"
                value={editCapacity}
                onChange={(e) => setEditCapacity(e.target.value)}
                className="text-xs bg-slate-50 border-slate-200"
              />
            </div>

            <DialogFooter className="pt-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setEditingRoom(null)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={updateRoomMutation.isPending}
                size="sm"
                className="bg-black text-white hover:bg-slate-800"
              >
                {updateRoomMutation.isPending && (
                  <Loader2 className="w-4 h-4 animate-spin mr-1" />
                )}
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
