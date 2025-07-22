import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Link } from "react-router";

const NotFoundPage = () => (
  <div className="flex justify-center items-center bg-background px-4 min-h-screen">
    <Card className="flex flex-col items-center bg-white dark:bg-neutral-900 shadow-xl p-8 dark:border-neutral-700 w-full max-w-lg">
      <CardTitle className="mb-2 font-bold text-primary text-5xl">
        404
      </CardTitle>
      <div className="mb-2 font-semibold text-gray-700 dark:text-gray-200 text-xl text-center">
        Page Not Found
      </div>
      <CardContent className="mb-6 p-0 text-gray-500 dark:text-gray-400 text-center">
        The page you are looking for does not exist or has been moved.
      </CardContent>
      <Link
        to="/"
        className="inline-block bg-primary-600 hover:bg-primary/90 shadow mt-2 px-6 py-2 rounded-lg font-medium text-primary-foreground transition-colors"
      >
        Go to Home
      </Link>
    </Card>
  </div>
);

export default NotFoundPage;
