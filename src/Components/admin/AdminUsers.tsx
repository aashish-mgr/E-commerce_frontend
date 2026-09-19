import type { AdminUser } from "./types";
import { roleStyles } from "./types";
import type { PaginationMeta } from "../../types";
import Pagination from "../Pagination";

const roleFilters = ["all", "admin", "vendor", "customer"];

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

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-gray-900">User Management</h2>
        <p className="text-sm text-gray-500 mt-0.5">
          View, change roles, and remove users across the platform
        </p>
      </div>

      <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-gray-100">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all duration-200 bg-gray-50 focus:bg-white"
            />
            {search && (
              <button
                onClick={() => onSearchChange("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
            {roleFilters.map((r) => (
              <button
                key={r}
                onClick={() => onRoleFilterChange(r)}
                className={`text-xs px-3.5 py-2 rounded-lg font-medium transition-all duration-200 whitespace-nowrap capitalize flex-shrink-0 ${
                  roleFilter === r
                    ? "bg-gray-900 text-white shadow-sm"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
          <span>
            Showing <span className="font-semibold text-gray-700">{users.length}</span> of{" "}
            <span className="font-semibold text-gray-700">{total}</span> users
          </span>
          {(search || roleFilter !== "all") && (
            <button
              onClick={() => {
                onSearchChange("");
                onRoleFilterChange("all");
              }}
              className="text-indigo-600 hover:text-indigo-700 font-medium"
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {users.length === 0 ? (
          <div className="py-20 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-2xl flex items-center justify-center">
              <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" className="text-gray-400">
                <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </div>
            <p className="text-lg font-semibold text-gray-700">
              {total === 0 ? "No users yet" : "No users match your search"}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              {total === 0 ? "Registered users will appear here" : "Try adjusting your search or filter"}
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-500 border-b border-gray-100 bg-gray-50/50">
                    <th className="px-5 py-3 font-medium">User</th>
                    <th className="px-5 py-3 font-medium">Role</th>
                    <th className="px-5 py-3 font-medium">Provider</th>
                    <th className="px-5 py-3 font-medium">Joined</th>
                    <th className="px-5 py-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => {
                    const isSelf = user.id === currentAdminId;
                    return (
                      <tr key={user.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <span className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-sm font-semibold flex-shrink-0">
                              {user.userName?.[0]?.toUpperCase() ?? "?"}
                            </span>
                            <div className="min-w-0">
                              <p className="font-medium text-gray-900 text-sm flex items-center gap-1.5">
                                {user.userName}
                                {isSelf && (
                                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-indigo-50 text-indigo-600 font-medium">
                                    you
                                  </span>
                                )}
                              </p>
                              <p className="text-xs text-gray-500 truncate max-w-[200px]">
                                {user.userEmail}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3.5">
                          <span
                            className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium capitalize ${roleStyles[user.userRole] ?? "bg-gray-100 text-gray-600"}`}
                          >
                            {user.userRole}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-gray-600 capitalize">
                          {user.provider ?? "local"}
                        </td>
                        <td className="px-5 py-3.5 text-gray-500">
                          {new Date(user.createdAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="flex gap-1.5 items-center">
                            <select
                              value={user.userRole}
                              disabled={isSelf}
                              onChange={(e) => onRoleChange(user.id, e.target.value)}
                              className="border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-100 bg-white disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                              {["customer", "vendor", "admin"].map((r) => (
                                <option key={r} value={r}>
                                  {r}
                                </option>
                              ))}
                            </select>
                            <button
                              onClick={() => onDelete(user.id, user.userName)}
                              disabled={user.userRole === "admin"}
                              className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                              title={user.userRole === "admin" ? "Admin accounts cannot be deleted" : "Delete user"}
                            >
                              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                              </svg>
                            </button>
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
      </div>
    </div>
  );
}