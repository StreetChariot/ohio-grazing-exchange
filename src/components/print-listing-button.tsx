"use client";

import { Printer } from "lucide-react";
import { Button } from "@/components/ui/button";

export function PrintListingButton() {
  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className="print:hidden"
      onClick={() => window.print()}
    >
      <Printer className="size-4" />
      Print 8.5×11
    </Button>
  );
}
