import * as React from 'react';
import * as LabelPrimitive from '@radix-ui/react-label';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const labelVariants = cva('text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70');

const Label = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root> & VariantProps<typeof labelVariants>
>(({ className, ...props }, ref) => <LabelPrimitive.Root ref={ref} className={cn(labelVariants(), className)} {...props} />);
Label.displayName = LabelPrimitive.Root.displayName;

export { Label };
export type { React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root> as LabelProps, VariantProps<typeof labelVariants> as LabelVariants };
File: src/components/ui/form.tsx
--- a/file:///c%3A/Users/Administrator/Desktop/EDUWELL%20FOLDER/vibe-c/src/components/ui/form.tsx
+++ b:file:///c%3A/Users/Administrator/Desktop/EDUWELL%20FOLDER/vibe-c/src/components/ui/form.tsx