import { ReactNode } from "react";

type PageTitleProps = {
  children: ReactNode;
  className?: string;
};

export default function PageTitle({ children, className = "" }: PageTitleProps) {
  return (
    <h1 className={`text-2xl md:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-4 md:mb-6 ${className}`}>
      {children}
    </h1>
  );
}
