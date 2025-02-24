import { useQuery, useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, Edit2 } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import CreateList from "@/components/lists/CreateList";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import type { List } from "@shared/schema";

export default function Lists() {
  const { toast } = useToast();
  const [editingList, setEditingList] = useState<List | null>(null);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");

  const { data: lists, isLoading } = useQuery<List[]>({ 
    queryKey: ['/api/lists']
  });

  const deleteList = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest('DELETE', `/api/lists/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/lists'] });
      toast({ description: "List deleted successfully" });
    }
  });

  const updateList = useMutation({
    mutationFn: async (list: List) => {
      await apiRequest('PATCH', `/api/lists/${list.id}`, {
        name: editName,
        description: editDescription
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/lists'] });
      toast({ description: "List updated successfully" });
      setEditingList(null);
    }
  });

  const handleEdit = (list: List) => {
    setEditingList(list);
    setEditName(list.name);
    setEditDescription(list.description || "");
  };

  if (isLoading) {
    return <div className="flex justify-center p-8">Loading lists...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-lg">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Family Lists</h1>
        <CreateList />
      </div>

      <div className="space-y-4">
        {lists?.map((list) => (
          <Card 
            key={list.id} 
            className="transition-colors hover:bg-accent"
          >
            <Link href={`/lists/${list.id}`}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xl font-semibold">
                  {list.name}
                </CardTitle>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={(e) => {
                      e.preventDefault();
                      handleEdit(list);
                    }}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={(e) => {
                      e.preventDefault();
                      deleteList.mutate(list.id);
                    }}
                    disabled={deleteList.isPending}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {list.description || "No description provided"}
                </p>
              </CardContent>
            </Link>
          </Card>
        ))}
      </div>

      <Dialog open={editingList !== null} onOpenChange={(open) => !open && setEditingList(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit List</DialogTitle>
          </DialogHeader>
          <form onSubmit={(e) => {
            e.preventDefault();
            if (editingList && editName.trim()) {
              updateList.mutate(editingList);
            }
          }} className="space-y-4">
            <Input
              placeholder="List name"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
            />
            <Textarea
              placeholder="List description (optional)"
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              className="min-h-[100px]"
            />
            <Button 
              type="submit" 
              className="w-full"
              disabled={updateList.isPending || !editName.trim()}
            >
              Update List
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}