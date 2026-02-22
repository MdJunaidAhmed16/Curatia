import { getLatestData } from "@/lib/data";
import Dashboard from "@/components/dashboard/Dashboard";

// Server Component: reads data at build time, passes to the client Dashboard
export default function HomePage() {
  const data = getLatestData();
  return <Dashboard data={data} />;
}
