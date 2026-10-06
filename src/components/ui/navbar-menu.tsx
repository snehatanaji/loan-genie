import React from "react";
import { motion } from "framer-motion";
import { Link, LinkProps } from "react-router-dom";
import { cn } from "../../lib/utils";

const transition = {
  type: "spring",
  mass: 0.5,
  damping: 11.5,
  stiffness: 100,
  restDelta: 0.001,
  restSpeed: 0.001,
};

export const MenuItem = ({
  setActive,
  active,
  item,
  children,
}: {
  setActive: (item: string) => void;
  active: string | null;
  item: string;
  children?: React.ReactNode;
}) => {
  return (
    <div onMouseEnter={() => setActive(item)} className="relative">
      <motion.p
        transition={{ duration: 0.3 }}
        className="cursor-pointer text-white hover:opacity-[0.9] text-sm"
      >
        {item}
      </motion.p>
      {active !== null && (
        <motion.div
          initial={{ opacity: 0, scale: 0.85, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={transition}
        >
          {active === item && (
            <div className="absolute top-[calc(100%_+_0.8rem)] left-1/2 transform -translate-x-1/2 pt-2">
              <motion.div
                transition={transition}
                layoutId="active"
                className="bg-neutral-900 backdrop-blur-sm rounded-xl overflow-hidden border border-white/[0.2] shadow-xl"
              >
                <motion.div
                  layout
                  className="w-max h-full p-3"
                >
                  {children}
                </motion.div>
              </motion.div>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
};

export const Menu = ({
  setActive,
  children,
}: {
  setActive: (item: string | null) => void;
  children: React.ReactNode;
}) => {
  return (
    <nav
      onMouseLeave={() => setActive(null)}
      className="relative rounded-full border border-white/[0.2] bg-neutral-900 shadow-input flex items-center justify-between px-6 py-3 w-full max-w-3xl mx-auto"
    >
      {children}
    </nav>
  );
};

interface HoveredLinkProps extends LinkProps {
  children: React.ReactNode;
}

export const HoveredLink: React.FC<HoveredLinkProps> = ({ children, ...rest }) => {
  return (
    <Link
      {...rest}
      className="text-neutral-300 hover:text-white text-sm"
    >
      {children}
    </Link>
  );
};

interface NavButtonProps {
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
}

export const NavButton: React.FC<NavButtonProps> = ({ onClick, children, className }) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        "px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
        "bg-red-600 text-white hover:bg-red-700",
        className
      )}
    >
      {children}
    </button>
  );
}; 