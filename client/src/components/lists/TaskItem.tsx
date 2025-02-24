import { useMutation, useQuery } from "@tanstack/react-query";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Trash2, User, Check, Edit2 } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useState } from "react";
import type { Task } from "@shared/schema";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface TaskItemProps {
  task: Task;
}

export default function TaskItem({ task }: TaskItemProps) {
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [description, setDescription] = useState(task.description);
  const [notes, setNotes] = useState(task.notes || "");
  const [urgency, setUrgency] = useState(task.urgency || "medium");
  const [importance, setImportance] = useState(task.importance || "medium");
  const { toast } = useToast();

  const { data: users = [], isLoading, error } = useQuery({
    queryKey: ['/api/users'],
  });

  const updateTask = useMutation({
    mutationFn: async (data: Partial<Task>) => {
      const res = await apiRequest('PATCH', `/api/tasks/${task.id}`, data);
      if (!res.ok) {
        throw new Error('Failed to update task');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/lists/${task.listId}/tasks`] });
      toast({ description: "Task updated successfully" });
      setEditOpen(false);
    },
    onError: (error: Error) => {
      toast({ 
        variant: "destructive",
        description: error.message 
      });
    }
  });

  const deleteTask = useMutation({
    mutationFn: async () => {
      await apiRequest('DELETE', `/api/tasks/${task.id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/lists/${task.listId}/tasks`] });
      toast({ description: "Task deleted successfully" });
    }
  });

  const handleEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (description.trim()) {
      updateTask.mutate({ description, notes, urgency, importance });
    }
  };

  const getPriorityColor = (level: string) => {
    switch (level) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <Card>
      <CardContent className="flex items-center p-4 gap-4">
        <Checkbox
          checked={task.completed}
          onCheckedChange={(checked) => 
            updateTask.mutate({ completed: checked as boolean })
          }
          className="h-6 w-6"
        />
        <div className="flex-grow">
          <div className="flex items-center gap-2 mb-1">
            <span className={cn(
              "block text-base",
              task.completed && "line-through text-muted-foreground"
            )}>
              {task.description}
            </span>
            <Dialog open={editOpen} onOpenChange={setEditOpen}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-6 w-6">
                  <Edit2 className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Edit Task</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleEdit} className="space-y-4">
                  <Input
                    placeholder="Task description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                  <Textarea
                    placeholder="Add notes (optional)"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="min-h-[100px]"
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Urgency</label>
                      <Select value={urgency} onValueChange={setUrgency}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select urgency" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Importance</label>
                      <Select value={importance} onValueChange={setImportance}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select importance" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full"
                    disabled={updateTask.isPending || !description.trim()}
                  >
                    Update Task
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
          {task.notes && (
            <p className="text-sm text-muted-foreground mb-2">
              {task.notes}
            </p>
          )}
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="secondary" className={cn("text-white", getPriorityColor(task.urgency))}>
              Urgency: {task.urgency}
            </Badge>
            <Badge variant="secondary" className={cn("text-white", getPriorityColor(task.importance))}>
              Importance: {task.importance}
            </Badge>
          </div>
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={open}
                className="h-9 w-full justify-between mt-2"
              >
                {task.assignedTo || "Unassigned"}
                <User className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-0">
              <Command>
                <CommandInput placeholder="Search member..." className="h-9" />
                <CommandEmpty>No member found.</CommandEmpty>
                <CommandGroup>
                  {users.map((user) => (
                    <CommandItem
                      key={user.id}
                      value={user.username}
                      onSelect={(currentValue) => {
                        updateTask.mutate({ 
                          assignedTo: currentValue === task.assignedTo ? null : currentValue 
                        });
                        setOpen(false);
                      }}
                      className="py-3"
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          task.assignedTo === user.username ? "opacity-100" : "opacity-0"
                        )}
                      />
                      {user.username}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </Command>
            </PopoverContent>
          </Popover>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => deleteTask.mutate()}
          disabled={deleteTask.isPending}
          className="h-10 w-10 flex-shrink-0"
        >
          <Trash2 className="h-5 w-5" />
        </Button>
      </CardContent>
    </Card>
  );
}