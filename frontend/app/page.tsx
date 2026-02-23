import { getIndexData } from "@/lib/data";
import Dashboard from "@/components/dashboard/Dashboard";

// Server Component: reads top 100 trending items at build time
export default function HomePage() {
  const data = getIndexData();
  return <Dashboard data={data} />;
}
