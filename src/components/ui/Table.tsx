import React from "react";
import { cn } from "@/lib/utils";

export interface TableProps extends React.TableHTMLAttributes<HTMLTableElement> {
  ariaLabel?: string;
}

export function Table({ className, ariaLabel = "Data Table", ...props }: TableProps) {
  return (
    <div className="w-full overflow-x-auto rounded-2xl border border-gray-200 shadow-academic-subtle bg-white">
      <table aria-label={ariaLabel} className={cn("w-full text-left text-xs border-collapse", className)} {...props} />
    </div>
  );
}

export function TableHeader({ className, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) {
  return <thead className={cn("bg-thofnaa-navy-50 text-thofnaa-navy uppercase font-mono text-[10px] tracking-wider border-b border-gray-200", className)} {...props} />;
}

export function TableBody({ className, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) {
  return <tbody className={cn("divide-y divide-gray-100 bg-white", className)} {...props} />;
}

export function TableRow({ className, ...props }: React.HTMLAttributes<HTMLTableRowElement>) {
  return <tr className={cn("hover:bg-gray-50/80 transition-colors focus-within:bg-gray-50", className)} {...props} />;
}

export function TableHead({ className, ...props }: React.ThHTMLAttributes<HTMLTableCellElement>) {
  return <th className={cn("py-3.5 px-4 font-bold text-thofnaa-navy", className)} {...props} />;
}

export function TableCell({ className, ...props }: React.TdHTMLAttributes<HTMLTableCellElement>) {
  return <td className={cn("py-3.5 px-4 text-thofnaa-charcoal align-middle", className)} {...props} />;
}
