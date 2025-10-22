"use client";

import { useState, useEffect } from "react";
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
  // Convert mark to hue:
  // 0 = red (0)
  // 40 = orange (30)
  // 70 = green (120)
  // 100 = blue (240)
  const hue = mark <= 40 
    ? mark * 0.75 // 0-40 maps to 0-30 (red to orange)
    : mark <= 70
      ? 30 + ((mark - 40) * 3) // 40-70 maps to 30-120 (orange to green)
      : 120 + ((mark - 70) * 4); // 70-100 maps to 120-240 (green to blue)
  const saturation = 60;
  const lightness = 65;
  return `border-[hsl(${hue}_${saturation}%_${lightness}%)]`;
};

const getGradeTextColor = (mark: number) => {
  const hue = mark <= 40 
    ? mark * 0.75 // 0-40 maps to 0-30 (red to orange)
    : mark <= 70
      ? 30 + ((mark - 40) * 3) // 40-70 maps to 30-120 (orange to green)
      : 120 + ((mark - 70) * 4); // 70-100 maps to 120-240 (green to blue)
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

    // Validate credit requirements
    if (totalCredits < 240) {
      setError(`Insufficient passing credits (${totalCredits}/240). You need 240 credits with marks of 40% or higher.`);
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

    // Find the lowest mark module(s)
    const allModules = [...level5ModulesReset, ...level6ModulesReset];
    const lowestMark = Math.min(...allModules.map(m => m.mark));
    const lowestModules = allModules.filter(m => m.mark === lowestMark);

    // Calculate how many credits we need to exclude
    const totalPassingCredits = allModules.reduce((sum, m) => sum + m.credits, 0);
    const creditsToExclude = totalPassingCredits - 220;

    // Determine which module to disregard or reduce credits
    let adjustedModules = [...level5ModulesReset, ...level6ModulesReset];
    let excludedModuleId = "";
    let excludedCredits = 0;
    
    if (lowestModules.length > 1) {
      // If multiple lowest marks, prefer to disregard Level 6
      const level6Lowest = lowestModules.find(m => level6ModulesReset.includes(m));
      if (level6Lowest) {
        if (creditsToExclude < level6Lowest.credits) {
          // Only exclude part of the module
          adjustedModules = adjustedModules.map(m => 
            m.id === level6Lowest.id ? { ...m, credits: level6Lowest.credits - creditsToExclude, isIncluded: true } : m
          );
          excludedCredits = creditsToExclude;
        } else {
          // Exclude the entire module
          adjustedModules = adjustedModules.filter(m => m.id !== level6Lowest.id);
          excludedModuleId = level6Lowest.id;
          excludedCredits = level6Lowest.credits;
        }
      } else {
        // If no Level 6 module, take the first Level 5 module
        const moduleToExclude = lowestModules[0];
        if (creditsToExclude < moduleToExclude.credits) {
          // Only exclude part of the module
          adjustedModules = adjustedModules.map(m => 
            m.id === moduleToExclude.id ? { ...m, credits: moduleToExclude.credits - creditsToExclude, isIncluded: true } : m
          );
          excludedCredits = creditsToExclude;
        } else {
          // Exclude the entire module
          adjustedModules = adjustedModules.filter(m => m.id !== moduleToExclude.id);
          excludedModuleId = moduleToExclude.id;
          excludedCredits = moduleToExclude.credits;
        }
      }
    } else if (lowestModules.length === 1) {
      const lowestModule = lowestModules[0];
      if (creditsToExclude < lowestModule.credits) {
        // Only exclude part of the module
        adjustedModules = adjustedModules.map(m => 
          m.id === lowestModule.id ? { ...m, credits: lowestModule.credits - creditsToExclude, isIncluded: true } : m
        );
        excludedCredits = creditsToExclude;
      } else {
        // Exclude the entire module
        adjustedModules = adjustedModules.filter(m => m.id !== lowestModule.id);
        excludedModuleId = lowestModule.id;
        excludedCredits = lowestModule.credits;
      }
    }

    // Mark included modules
    adjustedModules.forEach(module => {
      module.isIncluded = true;
    });

    // Update modules state with inclusion information
    setModules(prev => ({
      level5: prev.level5.map(m => ({
        ...m,
        isIncluded: m.id === excludedModuleId ? false : true,
        partiallyExcluded: m.id === (creditsToExclude < (lowestModules[0]?.credits || 0) ? lowestModules[0].id : null)
      })),
      level6: prev.level6.map(m => ({
        ...m,
        isIncluded: m.id === excludedModuleId ? false : true,
        partiallyExcluded: m.id === (creditsToExclude < (lowestModules[0]?.credits || 0) ? lowestModules[0].id : null)
      }))
    }));

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

    // Determine classification
    let classification = "";
    if (indicatorScore >= 70) classification = "First Class Honours (1st)";
    else if (indicatorScore >= 60) classification = "Second Class Honours Upper Division (2:1)";
    else if (indicatorScore >= 50) classification = "Second Class Honours Lower Division (2:2)";
    else if (indicatorScore >= 40) classification = "Third Class Honours (3rd)";
    else classification = "Fail";

    // Create detailed result message with more specific credit information
    const resultMessage = [
      `Indicator Score: ${indicatorScore}%`,
      `Classification: ${classification}`,
      `\nDetails:`,
      `Level 5 (Year 2) Average: ${(level5WeightedSum / level5TotalCredits).toFixed(2)}%`,
      `Level 6 (Year 3) Average: ${(level6WeightedSum / level6TotalCredits).toFixed(2)}%`,
      lowestModules.length > 0 ? `\nNote: ${
        excludedCredits < lowestModules[0].credits 
          ? `${excludedCredits} credits from the ${lowestModules[0].credits}-credit` 
          : 'The'
      } module with the lowest mark (${lowestMark}%) ${lowestModules.length > 1 ? '(multiple modules)' : ''} ${
        excludedCredits < lowestModules[0].credits 
          ? `are not included (${lowestModules[0].credits - excludedCredits} credits are included)` 
          : 'is not included'
      } in the best 220 credits used for your classification.` : ''
    ].join('\n');

    setResult(resultMessage);
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
          const validModules = Object.values(newModules).flat().filter(module => 
            module.mark !== "" && !isNaN(Number(module.mark)) && 
            module.credits !== "" && !isNaN(Number(module.credits)) &&
            Number(module.mark) >= 40
          );
          const totalCredits = validModules.reduce((sum, m) => sum + Number(m.credits), 0);
          
          // Calculate level 6 credits
          const level6Modules = newModules.level6.filter(module => 
            module.mark !== "" && !isNaN(Number(module.mark)) && 
            module.credits !== "" && !isNaN(Number(module.credits)) &&
            Number(module.mark) >= 40
          );
          const level6Credits = level6Modules.reduce((sum, m) => sum + Number(m.credits), 0);

          // Update error message if needed
          if (totalCredits < 240) {
            setError(`Insufficient passing credits (${totalCredits}/240). You need 240 credits with marks of 40% or higher.`);
            setResult(""); // Clear any previous result when credits are insufficient
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

  const renderCreditTotal = (level: "level5" | "level6") => {
    const validModules = modules[level].filter(module => 
      module.credits !== "" && !isNaN(Number(module.credits)) &&
      module.mark !== "" && !isNaN(Number(module.mark)) && Number(module.mark) >= 40
    );
    const totalCredits = validModules.reduce((sum, m) => sum + Number(m.credits), 0);
    const requiredCredits = level === "level6" ? 120 : "any";
    const isValid = level === "level6" ? totalCredits >= 120 : true;

    return (
      <div className={`text-sm font-medium ${isValid ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
        Total Credits: {totalCredits} {requiredCredits !== "any" && `/ ${requiredCredits}`}
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
                    className="[&_[role=slider]]:!bg-white dark:[&_[role=slider]]:!bg-slate-50 [&_.absolute.h-full]:!bg-current"
                    style={{ color: `hsl(${mark <= 40 
                      ? mark * 0.75
                      : mark <= 70
                        ? 30 + ((mark - 40) * 3)
                        : 120 + ((mark - 70) * 4)
                    } 70% 45%)` }}
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
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-4 top-4 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
          onClick={toggleTheme}
        >
          {theme === "light" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
        </Button>
        <CardHeader>
          <CardTitle className="text-4xl font-bold tracking-tight">Degree Classification Calculator</CardTitle>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="about">
              <AccordionTrigger className="text-lg">About</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4">
                  <p className="text-lg leading-relaxed">
                    Enter your module details for Level 5 and Level 6.
                    You need at least 240 credits in total, with a minimum of 120 credits at Level 6.
                    The best 220 credits will be used for the final calculation, with Level 5 weighted one-third and Level 6 weighted two-thirds.
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

            {error && (
              <div className="mt-4 p-4 bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-center font-medium">
                {error}
              </div>
            )}

            {result && !error && (
              <div className={`mt-4 p-4 rounded-lg text-center font-medium whitespace-pre-line ${
                result.includes("First Class") ? "bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400" :
                result.includes("Upper Division") ? "bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400" :
                result.includes("Lower Division") ? "bg-yellow-100 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400" :
                result.includes("Third Class") ? "bg-orange-100 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400" :
                "bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400"
              }`}>
                {result}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
