import { FencelineLogo } from "@/components/fenceline-logo";
import AuthLogin from "./auth";

const LoginPage = () => {
  return (
    <div className="bg-neutral-900 min-h-screen items-center justify-items-center py-32 px-20   font-[family-name:var(--font-inter)]">
      <main className="max-w-sm mx-auto flex flex-col gap-8 row-start-2 items-center  justify-center">
        <FencelineLogo />
        <AuthLogin />
        <p className="text-xs text-neutral-500 text-center mx-auto">
          Authorized users only. Copyright &copy; 2025 Picarro, Inc. All rights reserved.
        </p>
      </main>
    </div>
  );
};

export default LoginPage;
