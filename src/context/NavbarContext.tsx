
import { createContext, useContext, useState, type Dispatch, type ReactNode, type SetStateAction } from "react";
import type { User } from "../types";

export type NavbarData = {
  onLogin?: VoidFunction;
  onRegister?: VoidFunction;
  user?: User | null;
  cartCount?: number;
  onProfileClick?: VoidFunction;
};

interface NavbarContextType {
  navbarData: NavbarData;
  setNavbarData: Dispatch<SetStateAction<NavbarData>>;
}

export const NavbarContext = createContext<NavbarContextType | undefined>(undefined);

type NavbarProviderProps = {
  children: ReactNode;
};

export default function NavbarProvider({ children }: NavbarProviderProps) {
  const [navbarData, setNavbarData] = useState<NavbarData>({});

  return (
    <NavbarContext.Provider value={{ navbarData, setNavbarData }}>
      {children}
    </NavbarContext.Provider>
  );
}

export const useNavbar = () => {
  const context = useContext(NavbarContext);

  if (!context) {
    throw new Error("useNavbar must be used within NavbarProvider");
  }

  return context;
};