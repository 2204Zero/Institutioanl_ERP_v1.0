import * as React from "react"
import { cn } from "../../lib/utils"
import { ChevronRight } from "lucide-react"
import { Link } from "react-router-dom"

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface PageFrameProps {
  breadcrumbs?: BreadcrumbItem[];
  title: string;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export function PageFrame({
  breadcrumbs,
  title,
  description,
  actions,
  children,
  className,
}: PageFrameProps) {
  return (
    <div className="flex flex-col flex-1 h-full w-full max-w-[1600px] mx-auto p-4 md:p-6 lg:p-8 space-y-6">
      
      {/* Header Section: Breadcrumbs + Title + Actions */}
      <div className="flex flex-col space-y-4 md:space-y-0 md:flex-row md:items-start md:justify-between">
        <div className="space-y-2">
          
          {/* Breadcrumbs */}
          {breadcrumbs && breadcrumbs.length > 0 && (
            <nav className="flex items-center space-x-1 text-sm text-muted-foreground">
              {breadcrumbs.map((item, index) => (
                <React.Fragment key={item.label}>
                  {item.href ? (
                    <Link to={item.href} className="hover:text-foreground transition-colors">
                      {item.label}
                    </Link>
                  ) : (
                    <span className="text-foreground font-medium">{item.label}</span>
                  )}
                  {index < breadcrumbs.length - 1 && (
                    <ChevronRight className="h-4 w-4 text-muted-foreground/50 mx-1" />
                  )}
                </React.Fragment>
              ))}
            </nav>
          )}

          {/* Title and Description */}
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              {title}
            </h1>
            {description && (
              <div className="text-sm text-slate-500 mt-1">{description}</div>
            )}
          </div>
        </div>

        {/* Actions (Buttons, Filters) */}
        {actions && (
          <div className="flex items-center space-x-3 self-start">
            {actions}
          </div>
        )}
      </div>

      {/* Main Content Area */}
      <div className={cn("flex-1", className)}>
        {children}
      </div>
    </div>
  )
}
