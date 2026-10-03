import { Trash2, Users } from "lucide-react";
import type { PaginationMeta } from "../../types";
import Pagination from "../Pagination";
import { Button } from "../ui/Button";
import { EmptyState } from "../ui/EmptyState";
import { ChipGroup, ResultMeta, SearchField } from "../ui/FilterBar";
import { PageHeader } from "../ui/PageHeader";
import { Panel } from "../ui/Panel";
import { Select } from "../ui/Select";
import { humanize, formatDate } from "../../lib/format";
import type { AdminUser } from "./types";
import { roleStyles } from "./types";

const roleFilters = [
  { value: "all", label: "All roles" },
  { value: "admin", label: "Admins" },
  { value: "vendor", label: "Vendors" },
  { value: "customer", label: "Customers" },
];

const assignableRoles = [
  { value: "customer", label: "Customer" },
  { value: "vendor", label: "Vendor" },
  { value: "admin", label: "Admin" },
];

export default function AdminUsers({
  users,
  pagination,
  search,
  roleFilter,
  currentAdminId,
  onSearchChange,
  onRoleFilterChange,
  onPageChange,
  onRoleChange,
  onDelete,
}: {
  users: AdminUser[];
  pagination: PaginationMeta | null;
  search: string;
  roleFilter: string;
  currentAdminId?: string;
  onSearchChange: (value: string) => void;
  onRoleFilterChange: (value: string) => void;
  onPageChange: (page: number) => void;
  onRoleChange: (userId: string, role: string) => void;
  onDelete: (userId: string, userName: string) => void;
}) {
  const total = pagination?.total ?? users.length;
  const filtered = Boolean(search) || roleFilter !== "all";

  return (
    <div className="space-y-5">
      <PageHeader
        titleAs="h2"
        title="User management"
        description="View roles, promote accounts and remove users across the platform."
      />

      <Panel className="p-4 sm:p-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start">
          <SearchField
            value={search}
            onChange={onSearchChange}
            ariaLabel="Search users"
            placeholder="Search by name or email"
          />
          <ChipGroup
            className="pb-0"
            ariaLabel="Filter users by role"
            options={roleFilters}
            value={roleFilter}
            onChange={onRoleFilterChange}
          />
        </div>
        <ResultMeta
          className="mt-4 border-t border-line pt-3"
          shown={users.length}
          total={total}
          noun="users"
          onClear={
            filtered
              ? () => {
                  onSearchChange("");
                  onRoleFilterChange("all");
                }
              : undefined
          }
        />
      </Panel>

      <Panel>
        {users.length === 0 ? (
          <EmptyState
            icon={Users}
            title={total === 0 ? "No users yet" : "No users match your search"}
            direction={
              total === 0
                ? "Registered users will appear here."
                : "Try adjusting your search or role filter."
            }
            action={
              filtered ? (
                <Button
                  variant="outline"
                  onClick={() => {
                    onSearchChange("");
                    onRoleFilterChange("all");
                  }}
                >
                  Clear filters
                </Button>
              ) : undefined
            }
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-paper-2/60 text-ink-2">
                  <tr>
                    <th scope="col" className="px-5 py-3 font-medium">
                      User
                    </th>
                    <th scope="col" className="px-5 py-3 font-medium">
                      Role
                    </th>
                    <th scope="col" className="px-5 py-3 font-medium">
                      Provider
                    </th>
                    <th scope="col" className="px-5 py-3 font-medium">
                      Joined
                    </th>
                    <th scope="col" className="px-5 py-3 text-right font-medium">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {users.map((user) => {
                    const isSelf = user.id === currentAdminId;
                    const isAdmin = user.userRole === "admin";

                    return (
                      <tr
                        key={user.id}
                        className="transition-colors hover:bg-paper-2/40"
                      >
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-3">
                            <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-pine-soft text-sm font-semibold text-pine">
                              {user.userName?.[0]?.toUpperCase() ?? "?"}
                            </span>
                            <div className="min-w-0">
                              <p className="flex items-center gap-2 font-medium text-ink">
                                <span className="truncate">{user.userName}</span>
                                {isSelf && (
                                  <span className="rounded-full bg-marigold-soft px-2 py-0.5 text-xs font-medium text-amber">
                                    You
                                  </span>
                                )}
                              </p>
                              <p className="truncate text-xs text-muted">
                                {user.userEmail}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3">
                          <span
                            className={`inline-block rounded-full px-2.5 py-1 text-xs font-medium ${
                              roleStyles[user.userRole] ?? "bg-paper-2 text-ink-2"
                            }`}
                          >
                            {humanize(user.userRole)}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-ink-2">
                          {humanize(user.provider) || "Local"}
                        </td>
                        <td className="px-5 py-3 text-muted">
                          {formatDate(user.createdAt)}
                        </td>
                        <td className="px-5 py-3">
                          <div className="flex items-center justify-end gap-2">
                            <Select
                              ariaLabel={`Change role for ${user.userName}`}
                              className="h-9 w-36 text-sm"
                              value={user.userRole}
                              disabled={isSelf}
                              options={assignableRoles}
                              onValueChange={(role) => onRoleChange(user.id, role)}
                            />
                            <Button
                              size="icon"
                              variant="danger"
                              disabled={isAdmin}
                              title={
                                isAdmin
                                  ? "Admin accounts cannot be deleted"
                                  : `Delete ${user.userName}`
                              }
                              aria-label={`Delete ${user.userName}`}
                              onClick={() => onDelete(user.id, user.userName)}
                            >
                              <Trash2 aria-hidden className="size-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {pagination && <Pagination pagination={pagination} onPageChange={onPageChange} />}
          </>
        )}
      </Panel>
    </div>
  );
}
