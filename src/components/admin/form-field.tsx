import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

export function FormField({
  label,
  hint,
  error,
  children,
  className = "",
}: {
  label: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <Label className="text-xs text-muted-foreground uppercase tracking-wider">{label}</Label>
      {children}
      {error ? (
        <p className="text-xs text-destructive">{error}</p>
      ) : hint ? (
        <p className="text-xs text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  );
}

export function ValidatedInput({
  error,
  className,
  onBlur,
  ...props
}: React.ComponentProps<typeof Input> & { error?: string }) {
  return (
    <Input
      {...props}
      onBlur={onBlur}
      aria-invalid={!!error}
      className={cn(error && "border-destructive focus-visible:ring-destructive", className)}
    />
  );
}

export function ValidatedTextarea({
  error,
  className,
  ...props
}: React.ComponentProps<typeof Textarea> & { error?: string }) {
  return (
    <Textarea
      {...props}
      aria-invalid={!!error}
      className={cn(error && "border-destructive focus-visible:ring-destructive", className)}
    />
  );
}
