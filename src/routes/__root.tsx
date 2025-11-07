import { useRef } from "react";
import { Outlet, createRootRoute } from "@tanstack/react-router";
import Header from "../components/header";
import NavBar from "../components/navBar";
import { NavBarProvider } from "../context/navBarContext";

const RootLayout = () => {
  const headerRef = useRef<HTMLElement>(null);
  const navBarRef = useRef<HTMLElement>(null);

  return (
    <div className="app-layout flex h-screen">
      <nav className="sidebar w-64 flex-shrink-0" role="navigation" aria-label="Main navigation">
        <NavBar ref={navBarRef} />
      </nav>

      <div className="main-content flex-1 flex flex-col overflow-hidden">
        <Header ref={headerRef} />
        <main
          className="content flex-1 overflow-auto px-6 py-4 bg-primary"
          role="main"
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export const Route = createRootRoute({
  component: () => {
    return (
      <NavBarProvider>
        <RootLayout />
      </NavBarProvider>
    );
  },
});
