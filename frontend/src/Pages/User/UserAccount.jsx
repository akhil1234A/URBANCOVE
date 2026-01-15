import { NavLink, Outlet } from 'react-router-dom';

const UserAccount = () => {
  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex min-h-screen gap-10 py-12">

          {/* Sidebar */}
          <aside className="w-72 shrink-0">
            <div
              className="
                h-full rounded-2xl
                bg-gradient-to-b from-[#F8F6F5] to-[#EFECEA]
                px-6 py-10
                border border-[#E5E2E0]
              "
            >
              <h2 className="mb-8 text-lg font-semibold text-gray-900">
                Account Menu
              </h2>

              <nav className="flex flex-col gap-2">
                {[
                  { label: 'Profile Details', path: 'profile' },
                  { label: 'Address Management', path: 'addresses' },
                  { label: 'Order History', path: 'orders' },
                ].map(({ label, path }) => (
                  <NavLink
                    key={path}
                    to={path}
                    className={({ isActive }) =>
                      `
                      group relative rounded-xl px-4 py-3 text-sm font-medium transition-all
                      ${isActive
                        ? 'bg-white text-[#7B1E1E] shadow-sm'
                        : 'text-gray-700 hover:bg-white/80'
                      }
                    `
                    }
                  >
                    {/* Active indicator */}
                    <span
                      className={`
                        absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r
                        ${window.location.pathname.includes(path)
                          ? 'bg-[#7B1E1E]'
                          : 'bg-transparent'
                        }
                      `}
                    />
                    {label}
                  </NavLink>
                ))}
              </nav>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            <div className="rounded-2xl bg-white border border-gray-200 px-10 py-12">
              <div className="mb-10 border-b border-gray-200 pb-6">
                <h1 className="text-3xl font-semibold text-gray-900">
                  Your Account
                </h1>
                <p className="mt-1 text-sm text-gray-500">
                  Manage your personal details and orders
                </p>
              </div>

              <div className="max-w-4xl">
                <Outlet />
              </div>
            </div>
          </main>

        </div>
      </div>
    </div>
  );
};

export default UserAccount;
