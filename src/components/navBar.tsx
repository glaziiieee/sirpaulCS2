import { forwardRef } from "react";
import {
  AiFillDashboard,
  AiOutlineBarChart,
  AiOutlinePieChart,
  AiOutlineLineChart,
  AiOutlineAreaChart,
  AiOutlineDotChart,
  AiOutlineUpload,
  AiOutlineGlobal,
} from "react-icons/ai";
import { MdRadar, MdAccountTree } from "react-icons/md";
import { Link } from "@tanstack/react-router";

const navigationItems = [
  {
    name: "Dashboard",
    icon: <AiFillDashboard className="text-primary text-xl" />,
    path: "/",
  },
  {
    name: "Geographic",
    icon: <AiOutlineGlobal className="text-primary text-xl" />,
    path: "/geographic",
  },
  {
    name: "Comparison",
    icon: <AiOutlineBarChart className="text-primary text-xl" />,
    path: "/comparison",
  },
  {
    name: "Composition",
    icon: <AiOutlinePieChart className="text-primary text-xl" />,
    path: "/composition",
  },
  {
    name: "Trends",
    icon: <AiOutlineLineChart className="text-primary text-xl" />,
    path: "/trends",
  },
  {
    name: "Distribution",
    icon: <AiOutlineAreaChart className="text-primary text-xl" />,
    path: "/distribution",
  },
  {
    name: "Relationships",
    icon: <AiOutlineDotChart className="text-primary text-xl" />,
    path: "/relationships",
  },
  {
    name: "Ranking",
    icon: <MdRadar className="text-primary text-xl" />,
    path: "/radar",
  },
  {
    name: "Flow/Process",
    icon: <MdAccountTree className="text-primary text-xl" />,
    path: "/parallel",
  },
  {
    name: "Upload Data",
    icon: <AiOutlineUpload className="text-primary text-xl" />,
    path: "/upload",
  },
];

const NavBar = forwardRef<HTMLElement>((_props, ref) => {
  return (
    <nav
      ref={ref}
      className="fixed top-0 left-0 bottom-0 z-50 bg-secondary border-r-2 border-accent shadow-lg w-64 overflow-y-auto"
    >
      <div className="flex flex-col gap-2 py-4">
        {navigationItems.map((item) => (
          <Link
            key={item.name}
            to={item.path}
            className="flex items-center gap-3 px-6 py-3 hover:bg-highlight-1/20 transition-colors hover:cursor-pointer duration-300 ease-in-out"
          >
            {item.icon}
            <span className="text-[#333333] text-sm font-medium whitespace-nowrap">{item.name}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
});

NavBar.displayName = "NavBar";

export default NavBar;
