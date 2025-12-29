import { PageHeader } from "@/components/ui/page-header";
import { useMemo } from "react";
import MeasurementState from "../dashboard/components/measurement-state";
import SchedulerActions from "../dashboard/components/scheduler-actions";
import { useGetAllRecipesQuery } from "./data/recipes.slice";
import RecipeList from "./recipe-list";

const MethodPage = () => {
  const { data: allRecipes } = useGetAllRecipesQuery();

  // Filter recipes with duration < 0 for manual jobs
  const manualRecipes = useMemo(() => {
    if (!allRecipes) return [];
    return allRecipes;
    // return allRecipes.filter((recipe: ApiRecipe) => recipe.duration <= 0);
  }, [allRecipes]);

  // if (isLoading)
  //   return (
  //     <div className="flex flex-col h-full overflow-hidden">
  //       <PageHeader pageName="Method" />
  //       <main className="flex flex-col gap-6 mx-auto px-8 md:px-12 py-3 w-full max-w-8xl h-full overflow-y-auto">
  //         <div className="flex justify-center items-center p-40">
  //           <Spinner size="8" />
  //         </div>
  //       </main>
  //     </div>
  //   );
  // if (error) return <div>Error checking scheduler health</div>;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <PageHeader pageName="Method" />
      <main className="flex flex-col gap-6 mx-auto px-8 md:px-12 py-3 w-full max-w-8xl h-full overflow-y-auto">
        {/* Current Run Section */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold dark:text-white text-neutral-900">
            Current Run
          </h2>
          <div className="gap-4 grid grid-cols-4">
            <div className="col-span-3">
              <MeasurementState />
            </div>
            <div className="col-span-1">
              <SchedulerActions allRecipes={manualRecipes} />
            </div>
          </div>
        </div>

        {/* Recipe Library Section */}
        <div className="space-y-4">
          <RecipeList />
        </div>
      </main>
    </div>
  );
};

export default MethodPage;
