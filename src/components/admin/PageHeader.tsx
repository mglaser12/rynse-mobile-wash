
import React from 'react';

interface PageHeaderProps {
  heading: string;
  text?: string;
}

export function PageHeader({ heading, text }: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-2 pb-6">
      <h1 className="text-3xl font-bold">{heading}</h1>
      {text && <p className="text-muted-foreground">{text}</p>}
    </div>
  );
}
