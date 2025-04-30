import { signOut } from "@/auth";

export default function Page() {
  return (
    <form
      action={async () => {
        "use server";
        await signOut({ redirectTo: "/" });
      }}
    >
      <button className="flex h-[48px] grow items-center justify-center gap-2 rounded-md bg-red-500 p-3 text-sm font-medium text-white hover:bg-red-600 md:flex-none md:justify-start md:p-2 md:px-3">
        <div className="hidden md:block">Cerrar Sesion</div>
      </button>
    </form>
  );
}
