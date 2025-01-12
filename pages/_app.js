import "../styles/globals.css";
import { useRouter } from "next/router";
import Sidebar from "../components/Sidebar";

function MyApp({ Component, pageProps }) {
  const router = useRouter();

  // Define an array of paths where you want to show the sidebar
  const adminDashboardPaths = ["/dashboard", "/"];

  // Check if the current path is included in the adminDashboardPaths array
  const showSidebar = adminDashboardPaths.includes(router.pathname);

  return (
    <div>
      {showSidebar && <Sidebar />}
      <Component {...pageProps} />
    </div>
  );
}

export default MyApp;
