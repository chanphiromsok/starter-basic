import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/apps/$appId')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/apps/$appId"!</div>
}
