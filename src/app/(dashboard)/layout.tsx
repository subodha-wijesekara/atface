import Sidebar from "@/components/Sidebar";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex h-full w-full">
            <Sidebar />
            <main className="flex-1 h-full overflow-y-auto overflow-x-hidden relative scroll-smooth p-6 lg:p-10">
                {/* Add a subtle top fade/gradient if needed for aesthetic, or keep clean */}
                {children}
            </main>
        </div>
    );
}
