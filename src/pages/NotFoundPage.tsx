import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Link } from "react-router";

const NotFoundPage = () => (
  <div className="flex items-center justify-center min-h-screen bg-background px-4">
    <Card className="max-w-lg w-full p-8 flex flex-col items-center shadow-xl  dark:border-neutral-700 bg-white dark:bg-neutral-900">
      <CardTitle className="text-5xl font-bold text-primary mb-2">
        404
      </CardTitle>
      <div className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-2 text-center">
        Page Not Found
      </div>
      <CardContent className="text-center text-gray-500 dark:text-gray-400 mb-6 p-0">
        The page you are looking for does not exist or has been moved.
      </CardContent>
      <Link
        to="/"
        className="inline-block mt-2 px-6 py-2 rounded-lg bg-primary-700 text-primary-foreground font-medium shadow hover:bg-primary/90 transition-colors"
      >
        Go to Home
      </Link>
    </Card>
  </div>
);

export default NotFoundPage;
