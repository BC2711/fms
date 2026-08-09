import { PageGenerator } from '@/framework/generators/PageGenerator'

/** Backwards-compatible entry point backed by the shared generated page. */
export function AccountsListPage() {
  return <PageGenerator pageKey="accounts" />
}
