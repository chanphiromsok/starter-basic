import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_auth/apps/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/apps"!</div>
}
