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
import { Trash2, User, Check } from "lucide-react";
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

  return (
    <Card>
      <CardContent className="flex items-center p-4">
        <Checkbox
          checked={task.completed}
          onCheckedChange={(checked) => 
            updateTask.mutate({ completed: checked as boolean })
          }
          className="mr-4"
        />
        <span className={`flex-grow ${task.completed ? 'line-through text-muted-foreground' : ''}`}>
          {task.description}
        </span>
        <div className="flex items-center gap-2 ml-4">
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={open}
                className="w-[140px] justify-between"
              >
                {task.assignedTo || "Unassigned"}
                <User className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[140px] p-0">
              <Command>
                <CommandInput placeholder="Search member..." />
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
          <Button
            variant="ghost"
            size="icon"
            onClick={() => deleteTask.mutate()}
            disabled={deleteTask.isPending}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}