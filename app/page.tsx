"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Trash2, Moon, Sun } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface Module {
  name: string;
  credits: string;
  mark: string;
  id: string;
  isIncluded?: boolean;
  partiallyExcluded?: boolean;
}

interface YearModules {
  [key: string]: Module[];
}

// Create initial modules with deterministic IDs
const createInitialModules = (level: string, count: number): Module[] => 
  Array(count).fill(null).map((_, index) => ({
    name: "",
    credits: "20",
    mark: "0",
    id: `${level}-module-${index + 1}`
  }));

const getMarkColor = (mark: number) => {
  // 0-30: red to orange (hue 0 to 37.5) - bright orange at 30%
  // 30-40: orange to yellow (hue 37.5 to 60)
  // 40-50: yellow (hue 60)
  // 50-70: yellow to green (hue 60 to 120)
  // 70-100: green to blue (hue 120 to 240)
  const hue = mark <= 30
    ? mark * 1.25  // 0-30 maps to 0-37.5 (red to orange)
    : mark <= 40
      ? 37.5 + ((mark - 30) * 2.25)  // 30-40 maps to 37.5-60 (orange to yellow)
      : mark <= 50
        ? 60  // 40-50 stays at yellow
        : mark <= 70
          ? 60 + ((mark - 50) * 3)  // 50-70 maps to 60-120 (yellow to green)
          : 120 + ((mark - 70) * 4);  // 70-100 maps to 120-240 (green to blue)
  const saturation = 85;  // High saturation everywhere
  const lightness = 65;
  return `border-[hsl(${hue}_${saturation}%_${lightness}%)]`;
};

const getGradeTextColor = (mark: number) => {
  const hue = mark <= 40
    ? mark * 1.5
    : mark <= 50
      ? 60
      : mark <= 70
        ? 60 + ((mark - 50) * 3)
        : 120 + ((mark - 70) * 4);
  return `text-[hsl(${hue}_50%_35%)] dark:text-[hsl(${hue}_40%_65%)]`;
};

export default function Home() {
  const [modules, setModules] = useState<YearModules>({
    level5: createInitialModules("level5", 6),
    level6: createInitialModules("level6", 6)
  });
  const [result, setResult] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    // Check system preference on mount
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setTheme("dark");
      document.body.classList.add("dark");
    }
  }, []);

  const toggleTheme = () => {
    setTheme(current => {
      const newTheme = current === "light" ? "dark" : "light";
      if (newTheme === "dark") {
        document.body.classList.add("dark");
      } else {
        document.body.classList.remove("dark");
      }
      return newTheme;
    });
  };

  const handleRemoveModule = (level: "level5" | "level6", moduleId: string) => {
    setModules(prev => {
      const filtered = prev[level].filter(m => m.id !== moduleId);
      // Ensure IDs are sequential after removal
      const reindexed = filtered.map((module, index) => ({
        ...module,
        id: `${level}-module-${index + 1}`
      }));
      return {
        ...prev,
        [level]: reindexed
      };
    });
  };

  const handleAddModule = (level: "level5" | "level6") => {
    setModules(prev => ({
      ...prev,
      [level]: [
        ...prev[level],
        {
          name: "",
          credits: "20",
          mark: "0",
          id: `${level}-module-${prev[level].length + 1}`
        }
      ]
    }));
  };

  const calculateDegree = () => {
    setError("");
    
    // Get valid modules (with both marks and credits, and passing grade)
    const getValidModules = (yearModules: Module[]) => 
      yearModules.filter(module => 
        module.mark !== "" && !isNaN(Number(module.mark)) && 
        module.credits !== "" && !isNaN(Number(module.credits)) &&
        Number(module.mark) >= 40
      ).map(module => ({
        ...module,
        mark: Number(module.mark),
        credits: Number(module.credits)
      }));

    const level5Modules = getValidModules(modules.level5);
    const level6Modules = getValidModules(modules.level6);

    // Calculate total credits for each level (only counting passing modules)
    const level5Credits = level5Modules.reduce((sum, m) => sum + m.credits, 0);
    const level6Credits = level6Modules.reduce((sum, m) => sum + m.credits, 0);
    const totalCredits = level5Credits + level6Credits;

    // Validate credit requirements - must have at least 120 at each level
    if (level5Credits < 120 && level6Credits < 120) {
      setError(`Insufficient passing credits. Level 5: ${level5Credits}/120, Level 6: ${level6Credits}/120. You need at least 120 credits at each level with marks of 40% or higher.`);
      return;
    }
    if (level5Credits < 120) {
      setError(`Insufficient passing Level 5 credits (${level5Credits}/120). You need at least 120 credits at Level 5 with marks of 40% or higher.`);
      return;
    }
    if (level6Credits < 120) {
      setError(`Insufficient passing Level 6 credits (${level6Credits}/120). You need at least 120 credits at Level 6 with marks of 40% or higher.`);
      return;
    }

    if (level5Modules.length === 0 || level6Modules.length === 0) {
      setError("Please enter at least one passing module (40% or higher) with credits and mark for each level");
      return;
    }

    // Reset all modules' inclusion status
    const resetModules = (modules: ReturnType<typeof getValidModules>) => 
      modules.map(m => ({ ...m, isIncluded: false }));

    const level5ModulesReset = resetModules(level5Modules);
    const level6ModulesReset = resetModules(level6Modules);

    // Find lowest mark modules for each level
    const level5LowestMark = Math.min(...level5ModulesReset.map(m => m.mark));
    const level6LowestMark = Math.min(...level6ModulesReset.map(m => m.mark));
    
    const level5LowestModules = level5ModulesReset.filter(m => m.mark === level5LowestMark);
    const level6LowestModules = level6ModulesReset.filter(m => m.mark === level6LowestMark);

    // Calculate two provisional indicator scores
    const calculateProvisionalScore = (excludeLevel5: boolean) => {
      let adjustedModules = [...level5ModulesReset, ...level6ModulesReset];
      let excludedModuleId = "";
      let excludedCredits = 0;
      let excludedModuleName = "";
      let excludedModuleMark = 0;

      // Calculate total credits and determine what to exclude
      const totalPassingCredits = adjustedModules.reduce((sum, m) => sum + m.credits, 0);
      const creditsToExclude = totalPassingCredits - 220;

      if (excludeLevel5 && level5LowestModules.length > 0) {
        // Exclude lowest Level 5 module
        const moduleToExclude = level5LowestModules[0];
        excludedModuleName = moduleToExclude.name || `Level 5 module (${moduleToExclude.mark}%)`;
        excludedModuleMark = moduleToExclude.mark;
        
        if (creditsToExclude < moduleToExclude.credits) {
          // Only exclude part of the module, but if it's >20 credits, reduce to 20
          const creditsToReduce = Math.min(creditsToExclude, moduleToExclude.credits > 20 ? moduleToExclude.credits - 20 : creditsToExclude);
          adjustedModules = adjustedModules.map(m => 
            m.id === moduleToExclude.id ? { ...m, credits: moduleToExclude.credits - creditsToReduce, isIncluded: true } : m
          );
          excludedCredits = creditsToReduce;
        } else {
          // Exclude the entire module
          adjustedModules = adjustedModules.filter(m => m.id !== moduleToExclude.id);
          excludedModuleId = moduleToExclude.id;
          excludedCredits = moduleToExclude.credits;
        }
      } else if (!excludeLevel5 && level6LowestModules.length > 0) {
        // Exclude lowest Level 6 module
        const moduleToExclude = level6LowestModules[0];
        excludedModuleName = moduleToExclude.name || `Level 6 module (${moduleToExclude.mark}%)`;
        excludedModuleMark = moduleToExclude.mark;
        
        if (creditsToExclude < moduleToExclude.credits) {
          // Only exclude part of the module, but if it's >20 credits, reduce to 20
          const creditsToReduce = Math.min(creditsToExclude, moduleToExclude.credits > 20 ? moduleToExclude.credits - 20 : creditsToExclude);
          adjustedModules = adjustedModules.map(m => 
            m.id === moduleToExclude.id ? { ...m, credits: moduleToExclude.credits - creditsToReduce, isIncluded: true } : m
          );
          excludedCredits = creditsToReduce;
        } else {
          // Exclude the entire module
          adjustedModules = adjustedModules.filter(m => m.id !== moduleToExclude.id);
          excludedModuleId = moduleToExclude.id;
          excludedCredits = moduleToExclude.credits;
        }
      }

      // Mark included modules
      adjustedModules.forEach(module => {
        module.isIncluded = true;
      });

      // Calculate weighted averages using adjusted modules
      const adjustedLevel5 = adjustedModules.filter(m => level5ModulesReset.includes(m));
      const adjustedLevel6 = adjustedModules.filter(m => level6ModulesReset.includes(m));

      const level5TotalCredits = adjustedLevel5.reduce((sum, m) => sum + m.credits, 0);
      const level6TotalCredits = adjustedLevel6.reduce((sum, m) => sum + m.credits, 0);

      const level5WeightedSum = adjustedLevel5.reduce((sum, m) => 
        sum + (m.mark * m.credits), 0
      );
      const level6WeightedSum = adjustedLevel6.reduce((sum, m) => 
        sum + (m.mark * m.credits), 0
      );

      // Calculate indicator score using the formula
      const indicatorScore = Math.round(
        (1/3 * (level5WeightedSum / level5TotalCredits)) +
        (2/3 * (level6WeightedSum / level6TotalCredits))
      );

      return {
        indicatorScore,
        adjustedLevel5,
        adjustedLevel6,
        level5TotalCredits,
        level6TotalCredits,
        level5WeightedSum,
        level6WeightedSum,
        excludedModuleId,
        excludedCredits,
        excludedModuleName,
        excludedModuleMark
      };
    };

    // Calculate both provisional scores
    const provisional1 = calculateProvisionalScore(true);  // Exclude lowest Level 5
    const provisional2 = calculateProvisionalScore(false); // Exclude lowest Level 6

    // Choose the better result
    const bestResult = provisional1.indicatorScore >= provisional2.indicatorScore ? provisional1 : provisional2;
    const usedLevel5Exclusion = provisional1.indicatorScore >= provisional2.indicatorScore;

    // Update modules state with inclusion information from the best result
    setModules(prev => ({
      level5: prev.level5.map(m => ({
        ...m,
        isIncluded: m.id === bestResult.excludedModuleId ? false : true,
        partiallyExcluded: m.id === bestResult.excludedModuleId && bestResult.excludedCredits < (level5LowestModules[0]?.credits || level6LowestModules[0]?.credits || 0)
      })),
      level6: prev.level6.map(m => ({
        ...m,
        isIncluded: m.id === bestResult.excludedModuleId ? false : true,
        partiallyExcluded: m.id === bestResult.excludedModuleId && bestResult.excludedCredits < (level5LowestModules[0]?.credits || level6LowestModules[0]?.credits || 0)
      }))
    }));

    // Determine classification
    let classification = "";
    if (bestResult.indicatorScore >= 70) classification = "First Class Honours (1st)";
    else if (bestResult.indicatorScore >= 60) classification = "Second Class Honours Upper Division (2:1)";
    else if (bestResult.indicatorScore >= 50) classification = "Second Class Honours Lower Division (2:2)";
    else if (bestResult.indicatorScore >= 40) classification = "Third Class Honours (3rd)";
    else classification = "Fail";

    // Create detailed result message
    const resultMessage = [
      `Indicator Score: ${bestResult.indicatorScore}%`,
      `Classification: ${classification}`,
      `\nDetails:`,
      `Level 5 (Year 2) Average: ${(bestResult.level5WeightedSum / bestResult.level5TotalCredits).toFixed(2)}%`,
      `Level 6 (Year 3) Average: ${(bestResult.level6WeightedSum / bestResult.level6TotalCredits).toFixed(2)}%`,
      `\nCalculation Method:`,
      `Used ${usedLevel5Exclusion ? 'Level 5' : 'Level 6'} exclusion method (better result)`,
      `Provisional Score 1 (exclude L5): ${provisional1.indicatorScore}%`,
      `Provisional Score 2 (exclude L6): ${provisional2.indicatorScore}%`,
      bestResult.excludedModuleName ? `\nNote: ${bestResult.excludedCredits < (level5LowestModules[0]?.credits || level6LowestModules[0]?.credits || 0)
        ? `${bestResult.excludedCredits} credits from the ${bestResult.excludedModuleName} (${bestResult.excludedModuleMark}%) are not included`
        : `The ${bestResult.excludedModuleName} (${bestResult.excludedModuleMark}%) is not included`
      } in the best 220 credits used for your classification.` : '',
      `\nReminder: This assumes you have passed Level 4 (Year 1) with at least 120 credits at 40% or higher.`
    ].join('\n');

    setResult(resultMessage);

    // Track calculation event in Google Analytics
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'calculate_degree', {
        calculator_type: 'undergraduate',
        classification: classification
      });
    }
  };

  const handleModuleChange = (
    level: "level5" | "level6",
    index: number,
    field: keyof Module,
    value: string
  ) => {
    // Update modules state and get the new state immediately
    setModules(prev => {
      const newModules = {
        ...prev,
        [level]: prev[level].map((module, i) => 
          i === index ? { ...module, [field]: value } : module
        )
      };
      
      // If this is a mark or credits change and we've had a previous calculation
      if ((field === "mark" || field === "credits") && (result || error)) {
        // Schedule the validation and calculation to run after state update
        setTimeout(() => {
          // Get valid modules with the updated state
          const level5Modules = newModules.level5.filter(module =>
            module.mark !== "" && !isNaN(Number(module.mark)) &&
            module.credits !== "" && !isNaN(Number(module.credits)) &&
            Number(module.mark) >= 40
          );
          const level6Modules = newModules.level6.filter(module =>
            module.mark !== "" && !isNaN(Number(module.mark)) &&
            module.credits !== "" && !isNaN(Number(module.credits)) &&
            Number(module.mark) >= 40
          );
          const level5Credits = level5Modules.reduce((sum, m) => sum + Number(m.credits), 0);
          const level6Credits = level6Modules.reduce((sum, m) => sum + Number(m.credits), 0);

          // Update error message if needed
          if (level5Credits < 120 && level6Credits < 120) {
            setError(`Insufficient passing credits. Level 5: ${level5Credits}/120, Level 6: ${level6Credits}/120. You need at least 120 credits at each level with marks of 40% or higher.`);
            setResult(""); // Clear any previous result when credits are insufficient
          } else if (level5Credits < 120) {
            setError(`Insufficient passing Level 5 credits (${level5Credits}/120). You need at least 120 credits at Level 5 with marks of 40% or higher.`);
            setResult(""); // Clear any previous result when Level 5 credits are insufficient
          } else if (level6Credits < 120) {
            setError(`Insufficient passing Level 6 credits (${level6Credits}/120). You need at least 120 credits at Level 6 with marks of 40% or higher.`);
            setResult(""); // Clear any previous result when Level 6 credits are insufficient
          } else {
            setError(""); // Clear any previous error
            calculateDegree();
          }
        }, 0);
      }
      return newModules;
    });
  };

  const handleReset = () => {
    setModules({
      level5: createInitialModules("level5", 6),
      level6: createInitialModules("level6", 6)
    });
    setResult("");
    setError("");
  };

  const handleSave = () => {
    try {
      localStorage.setItem('ugModules', JSON.stringify(modules));
      alert('Your modules have been saved!');
    } catch (err) {
      alert('Failed to save modules. Please try again.');
    }
  };

  const handleLoad = () => {
    try {
      const saved = localStorage.getItem('ugModules');
      if (saved) {
        setModules(JSON.parse(saved));
        setResult("");
        setError("");
        alert('Your saved modules have been loaded!');
      } else {
        alert('No saved modules found.');
      }
    } catch (err) {
      alert('Failed to load modules. Please try again.');
    }
  };

  const renderCreditTotal = (level: "level5" | "level6") => {
    const validModules = modules[level].filter(module =>
      module.credits !== "" && !isNaN(Number(module.credits)) &&
      module.mark !== "" && !isNaN(Number(module.mark)) && Number(module.mark) >= 40
    );
    const totalCredits = validModules.reduce((sum, m) => sum + Number(m.credits), 0);
    const requiredCredits = 120;
    const isValid = totalCredits >= 120;

    return (
      <div className={`text-sm font-medium ${isValid ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
        Total Credits: {totalCredits} / {requiredCredits}
        {totalCredits > 0 && <span className="text-xs ml-1">(passing modules only)</span>}
      </div>
    );
  };

  const renderModuleInputs = (level: "level5" | "level6", title: string) => (
    <div className="space-y-4 flex-1">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold tracking-tight">{title.split(" - ")[0]}</h3>
        {renderCreditTotal(level)}
      </div>
      <div className="space-y-4">
        {modules[level].map((module, index) => {
          const mark = Number(module.mark || "0");
          const markColor = getMarkColor(mark);
          const textColor = getGradeTextColor(mark);
          
          return (
            <div 
              key={module.id} 
              className="p-3 border-2 rounded-lg relative transition-colors overflow-hidden"
              suppressHydrationWarning
            >
              {(module.isIncluded === false || module.partiallyExcluded) && (
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute top-1 left-1/2 -translate-x-1/2 bg-background/95 dark:bg-background/95 px-2 py-0.5 text-xs font-medium shadow-sm rounded-full">
                    {module.isIncluded === false ? 'Not included in best 220' : 'Partially not included in best 220'}
                  </div>
                </div>
              )}
              <div className={`${module.isIncluded === false ? "opacity-50" : module.partiallyExcluded ? "opacity-75" : ""}`}>
                <div className="flex justify-between items-start gap-2">
                  <div className="grid grid-cols-1 xs:grid-cols-[2fr,auto,auto] gap-2 flex-grow">
                    <div className="space-y-1">
                      <Label htmlFor={`${module.id}-name`} className={`text-sm font-medium ${textColor}`}>Module Name/Code</Label>
                      <Input
                        id={`${module.id}-name`}
                        value={module.name}
                        onChange={(e) => handleModuleChange(level, index, "name", e.target.value)}
                        placeholder="e.g., CS101"
                        className={`h-8 w-full min-w-[10ch] ${markColor}`}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor={`${module.id}-credits`} className={`text-sm font-medium ${textColor}`}>Credits</Label>
                      <Input
                        id={`${module.id}-credits`}
                        type="number"
                        min="0"
                        max="120"
                        step="20"
                        value={module.credits}
                        onChange={(e) => handleModuleChange(level, index, "credits", e.target.value)}
                        onBlur={() => {
                          // Recalculate when field loses focus to ensure final value is used
                          if (result || error) {
                            setTimeout(() => calculateDegree(), 0);
                          }
                        }}
                        placeholder="20"
                        className={`h-8 w-16 ${markColor}`}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor={`${module.id}-mark-input`} className={`text-sm font-medium ${textColor}`}>
                        Mark
                      </Label>
                      <Input
                        id={`${module.id}-mark-input`}
                        type="number"
                        min="0"
                        max="100"
                        step="0.1"
                        value={module.mark}
                        onChange={(e) => handleModuleChange(level, index, "mark", e.target.value)}
                        onBlur={() => {
                          // Recalculate when field loses focus to ensure final value is used
                          if (result || error) {
                            setTimeout(() => calculateDegree(), 0);
                          }
                        }}
                        className={`w-20 h-8 text-sm ${markColor}`}
                      />
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-gray-400 hover:text-red-600 dark:text-gray-600 dark:hover:text-red-400 h-8 w-8"
                    onClick={() => handleRemoveModule(level, module.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <div className="mt-2">
                  <Slider
                    id={`${module.id}-mark-slider`}
                    min={0}
                    max={100}
                    step={0.1}
                    value={[mark]}
                    onValueChange={(value) => {
                      handleModuleChange(level, index, "mark", value[0].toString());
                      // No need for explicit recalculation here as handleModuleChange will handle it
                    }}
                    onValueCommit={(value) => {
                      // Recalculate when slider is released to ensure final value is used
                      if (result || error) {
                        setTimeout(() => calculateDegree(), 0);
                      }
                    }}
                    className="[&_[role=slider]]:!bg-white dark:[&_[role=slider]]:!bg-slate-50 [&_.absolute.h-full]:!bg-current"
                    style={{ color: `hsl(${mark <= 30
                      ? mark * 1.25
                      : mark <= 40
                        ? 37.5 + ((mark - 30) * 2.25)
                        : mark <= 50
                          ? 60
                          : mark <= 70
                            ? 60 + ((mark - 50) * 3)
                            : 120 + ((mark - 70) * 4)
                    } 90% 45%)` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
        <Button 
          variant="outline" 
          className="w-full" 
          onClick={() => handleAddModule(level)}
        >
          Add Module
        </Button>
      </div>
    </div>
  );

  return (
    <main className="min-h-screen p-4 md:p-8 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-200 transition-colors" suppressHydrationWarning>
      <Card className="max-w-7xl mx-auto relative shadow-lg bg-white dark:bg-slate-900" suppressHydrationWarning>
        <div className="absolute right-4 top-4 flex gap-2">
          <Link href="/postgraduate">
            <Button variant="outline" size="sm" className="text-xs sm:text-sm">
              <span className="hidden xs:inline">Postgraduate </span>PG →
            </Button>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
            onClick={toggleTheme}
          >
            {theme === "light" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
          </Button>
        </div>
        <CardHeader>
          <CardTitle className="text-4xl font-bold tracking-tight">Undergraduate Degree Calculator</CardTitle>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="about">
              <AccordionTrigger className="text-lg">About</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4">
                  <p className="text-lg leading-relaxed">
                    Enter your module details for Level 5 (Year 2) and Level 6 (Year 3).
                    You need at least 120 credits at Level 5 and at least 120 credits at Level 6.
                    The calculator will determine the best 220 credits by calculating two provisional scores: one excluding the lowest Level 5 module, and one excluding the lowest Level 6 module. The higher score becomes your final classification, with Level 5 weighted one-third and Level 6 weighted two-thirds.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    <strong>Important:</strong> This calculator assumes you have already passed Level 4 (Year 1) with at least 120 credits at 40% or higher. Level 4 results do not count towards your final degree classification.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Developed by Anne-Gaelle Colom, University of Westminster
                  </p>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardHeader>
        <CardContent>
          <div className="space-y-8">
            <div className="flex flex-col lg:flex-row gap-8">
              {renderModuleInputs("level5", "Level 5 Modules")}
              {renderModuleInputs("level6", "Level 6 Modules")}
            </div>

            <div className="space-y-3">
              <div className="flex justify-center gap-4">
                <Button
                  onClick={calculateDegree}
                  className="w-full max-w-xs text-lg font-semibold"
                  variant="outline"
                  size="lg"
                >
                  Calculate Classification
                </Button>
                <Button
                  onClick={handleReset}
                  className="w-full max-w-xs text-lg font-semibold"
                  variant="outline"
                  size="lg"
                >
                  Reset All
                </Button>
              </div>
              <div className="flex justify-center gap-4">
                <Button
                  onClick={handleSave}
                  className="w-full max-w-xs"
                  variant="secondary"
                  size="sm"
                >
                  Save Progress
                </Button>
                <Button
                  onClick={handleLoad}
                  className="w-full max-w-xs"
                  variant="secondary"
                  size="sm"
                >
                  Load Saved
                </Button>
              </div>
            </div>

            {error && (
              <div className="mt-4 p-4 bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-center font-medium">
                {error}
              </div>
            )}

            {result && !error && (
              <div className="mt-4 space-y-3">
                <div className={`p-4 rounded-lg text-center font-medium whitespace-pre-line ${
                  result.includes("First Class") ? "bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400" :
                  result.includes("Upper Division") ? "bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400" :
                  result.includes("Lower Division") ? "bg-yellow-100 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400" :
                  result.includes("Third Class") ? "bg-orange-100 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400" :
                  "bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400"
                }`}>
                  {result}
                </div>
                <div className="flex justify-center">
                  <Button
                    onClick={() => window.print()}
                    variant="outline"
                    size="sm"
                    className="print:hidden"
                  >
                    Print / Save as PDF
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
