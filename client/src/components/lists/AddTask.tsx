import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { Plus } from "lucide-react";

interface AddTaskProps {
  listId: number;
}

export default function AddTask({ listId }: AddTaskProps) {
  const [open, setOpen] = useState(false);
  const [description, setDescription] = useState("");
  const [assignedTo, setAssignedTo] = useState("");
  const { toast } = useToast();

  const createTask = useMutation({
    mutationFn: async () => {
      await apiRequest('POST', `/api/lists/${listId}/tasks`, {
        description,
        assignedTo: assignedTo.trim() || null
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
          <Input
            placeholder="Assign to (optional)"
            value={assignedTo}
            onChange={(e) => setAssignedTo(e.target.value)}
          />
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
