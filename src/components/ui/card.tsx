import React from "react";

interface CardProps {
  className?: string;
  children: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({ className = "", children }) => (
  <div className={`bg-card rounded-lg shadow-md ${className}`}>{children}</div>
);

export const CardHeader: React.FC<CardProps> = ({
  className = "",
  children,
}) => <div className={`px-6 py-4 ${className}`}>{children}</div>;

export const CardTitle: React.FC<CardProps> = ({
  className = "",
  children,
}) => <h3 className={`text-lg font-semibold ${className}`}>{children}</h3>;

export const CardDescription: React.FC<CardProps> = ({
  className = "",
  children,
}) => (
  <p className={`text-sm text-muted-foreground mt-1 ${className}`}>
    {children}
  </p>
);

export const CardContent: React.FC<CardProps> = ({
  className = "",
  children,
}) => <div className={`px-6 py-4 ${className}`}>{children}</div>;
