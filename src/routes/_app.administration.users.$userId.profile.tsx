import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/nexus/page-header";
import { Panel, EmptyState } from "@/components/nexus/primitives";
import { ProfileWorkspace } from "@/components/admin/users/profiles-page";
import { useAdminUserData } from "@/components/admin/users/use-admin-user-data";

export const Route = createFileRoute("/_app/administration/users/$userId/profile")({
  head: () => ({
    meta: [
      { title: "User Profile — Administration — DPC POS" },
      {
        name: "description",
        content: "Edit a single account's profile, access and security.",
      },
      { property: "og:title", content: "User Profile — DPC POS" },
    ],
  }),
  component: UserProfilePage,
});

function UserProfilePage() {
  const { userId } = Route.useParams();
  const { users, loading, reload } = useAdminUserData();
  const user = users.find((u) => String(u.id) === userId);

  if (loading && !user) {
    return (
      <div className="space-y-5 p-4 sm:p-6">
        <Panel>
          <EmptyState title="Loading…" description="Fetching the account from the connector." />
        </Panel>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="space-y-5 p-4 sm:p-6">
        <PageHeader
          title="User not found"
          description="This account does not exist or was deleted."
        />
        <Panel>
          <EmptyState title="No such account" description="Check the URL and try again." />
        </Panel>
      </div>
    );
  }

  return (
    <div className="space-y-5 p-4 sm:p-6">
      <PageHeader
        title={user.display_name}
        description={`${user.username} · managing profile, access and security.`}
      />
      <ProfileWorkspace user={user} onChanged={() => reload()} />
    </div>
  );
}
