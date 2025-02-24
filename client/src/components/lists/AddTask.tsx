import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { Plus, Check, User } from "lucide-react";
import { cn } from "@/lib/utils";

interface AddTaskProps {
  listId: number;
}

export default function AddTask({ listId }: AddTaskProps) {
  const [open, setOpen] = useState(false);
  const [assigneeOpen, setAssigneeOpen] = useState(false);
  const [description, setDescription] = useState("");
  const [assignedTo, setAssignedTo] = useState("");
  const { toast } = useToast();

  const createTask = useMutation({
    mutationFn: async () => {
      await apiRequest('POST', `/api/lists/${listId}/tasks`, {
        description,
        assignedTo: assignedTo || null
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/lists/${listId}/tasks`] });
      toast({ description: "Task added successfully" });
      setOpen(false);
      setDescription("");
      setAssignedTo("");
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (description.trim()) {
      createTask.mutate();
    }
  };

  const { data: users = [] } = useQuery({
    queryKey: ['/api/users'],
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Task
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Task</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            placeholder="Task description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <Popover open={assigneeOpen} onOpenChange={setAssigneeOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={assigneeOpen}
                className="w-full justify-between"
              >
                {assignedTo || "Select assignee"}
                <User className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-0">
              <Command>
                <CommandInput placeholder="Search member..." />
                <CommandEmpty>No member found.</CommandEmpty>
                <CommandGroup>
                  {users.map((user) => (
                    <CommandItem
                      key={user.id}
                      value={user.username}
                      onSelect={(currentValue) => {
                        setAssignedTo(currentValue);
                        setAssigneeOpen(false);
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          assignedTo === user.username ? "opacity-100" : "opacity-0"
                        )}
                      />
                      {user.username}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </Command>
            </PopoverContent>
          </Popover>
          <Button
            type="submit"
            className="w-full"
            disabled={createTask.isPending || !description.trim()}
          >
            Add Task
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}