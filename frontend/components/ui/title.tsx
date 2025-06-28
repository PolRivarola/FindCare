import { ReactNode } from "react";

type PageTitleProps = {
  children: ReactNode;
  className?: string;
};

export default function PageTitle({ children, className = "" }: PageTitleProps) {
  return (
    <h1 className={`text-3xl font-bold text-blue-600 mb-6 ${className}`}>
      {children}
    </h1>
  );
}
