import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useDeleteRecipeMutation } from "../data/recipes.slice";

interface DeleteRecipeModalProps {
  isOpen: boolean;
  onClose: () => void;
  recipeName: string;
  recipeId: number;
}

const DeleteRecipeModal = ({
  isOpen,
  onClose,
  recipeName,
  recipeId
}: DeleteRecipeModalProps) => {
  const [deleteRecipe, { isLoading }] = useDeleteRecipeMutation();

  const handleDelete = async () => {
    try {
      await deleteRecipe({
        recipe_name: recipeName
      }).unwrap();
      toast.success("Recipe deleted successfully");
      onClose();
    } catch (error) {
      console.error("Error deleting recipe:", error);
      toast.error("Failed to delete recipe");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Recipe</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete the recipe "{recipeName}"? This
            action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete Recipe"
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteRecipeModal;
