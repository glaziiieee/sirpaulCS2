import { forwardRef } from "react";

const Header = forwardRef<HTMLElement>((_props, ref) => {
  return (
    <header
      ref={ref}
      className="flex justify-center items-center px-8 py-4 bg-secondary border-b border-accent"
    >
      <h1 className="text-2xl md:text-3xl font-inter text-white font-bold text-center">
        Filipino Emigration Dashboard
      </h1>
    </header>
  );
});

Header.displayName = "Header";

export default Header;
