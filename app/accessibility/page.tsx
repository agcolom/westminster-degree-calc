"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function AccessibilityPage() {
  return (
    <main className="min-h-screen p-4 md:p-8 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-200 transition-colors">
      <Card className="max-w-3xl mx-auto shadow-lg bg-white dark:bg-slate-900">
        <CardHeader>
          <h1 className="text-2xl sm:text-4xl font-bold tracking-tight">Accessibility statement</h1>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-base leading-relaxed">
              This accessibility statement applies to the University of Westminster degree classification calculators.
            </p>
            <p className="text-base leading-relaxed">
              We are committed to making this tool accessible to as many people as possible. A full accessibility statement is currently being prepared and will be published here shortly.
            </p>
            <p className="text-base leading-relaxed">
              In the meantime, if you experience any accessibility issues or need this content in a different format, please contact <a href="mailto:A.Colom@westminster.ac.uk" className="text-blue-600 dark:text-blue-400 underline font-medium">Anne-Gaelle Colom</a>.
            </p>
            <p className="text-base leading-relaxed mt-4">
              <Link href="/" className="text-blue-600 dark:text-blue-400 underline font-medium">Back to undergraduate degree calculator</Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
