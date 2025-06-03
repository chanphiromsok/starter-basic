import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/apps")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div>
      Hello "/apps/routes"! <Outlet />
    </div>
  );
}
