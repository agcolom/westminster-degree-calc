"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Module {
  name: string;
  credits: string;
  mark: string;
  level: string;
  id: string;
}

const awardTypes = {
  pgcert: {
    label: "Postgraduate Certificate (PgCert)",
    minCredits: 60,
    maxLevel6: 20,
    totalLevel7: 60,
    integrated: false
  },
  pgdip: {
    label: "Postgraduate Diploma (PgDip)",
    minCredits: 120,
    maxLevel6: 20,
    totalLevel7: 120,
    integrated: false
  },
  mfa: {
    label: "Master of Fine Arts (MFA)",
    minCredits: 240,
    maxLevel6: 0,
    totalLevel7: 240,
    integrated: false
  },
  mres: {
    label: "Master by Research (MRes)",
    minCredits: 180,
    maxLevel6: 20,
    totalLevel7: 180,
    integrated: false
  },
  erasmus: {
    label: "Erasmus Mundus Master's",
    minCredits: 240,
    maxLevel6: 20,
    totalLevel7: 240,
    integrated: false
  },
  masters: {
    label: "Master's Degree (MA, MSc, MBA, LLM, MArch, MMus)",
    minCredits: 180,
    maxLevel6: 20,
    totalLevel7: 180,
    integrated: false
  },
  integrated: {
    label: "Integrated Masters (MEng, MLaw, MSci)",
    minCredits: 240,
    maxLevel6: 120,
    totalLevel7: 120,
    integrated: true
  },
};

type AwardTypeKey = keyof typeof awardTypes;

const getMarkColor = (mark: number) => {
  // 0-40: red to orange (hue 0 to 37.5) - bright orange at 40%
  // 40-50: orange to yellow (hue 37.5 to 60)
  // 50-55: yellow (hue 60)
  // 55-70: yellow to green (hue 60 to 120)
  // 70-100: green to blue (hue 120 to 240)
  const hue = mark <= 40
    ? mark * 0.9375  // 0-40 maps to 0-37.5 (red to orange)
    : mark <= 50
      ? 37.5 + ((mark - 40) * 2.25)  // 40-50 maps to 37.5-60 (orange to yellow)
      : mark <= 55
        ? 60  // 50-55 stays at yellow
        : mark <= 70
          ? 60 + ((mark - 55) * 4)  // 55-70 maps to 60-120 (yellow to green)
          : 120 + ((mark - 70) * 4);  // 70-100 maps to 120-240 (green to blue)
  const saturation = 85;
  const lightness = 65;
  return `border-[hsl(${hue}_${saturation}%_${lightness}%)]`;
};

const getGradeTextColor = (mark: number) => {
  const hue = mark <= 40
    ? mark * 0.9375
    : mark <= 50
      ? 37.5 + ((mark - 40) * 2.25)
      : mark <= 55
        ? 60
        : mark <= 70
          ? 60 + ((mark - 55) * 4)
          : 120 + ((mark - 70) * 4);
  return `text-[hsl(${hue}_50%_35%)] dark:text-[hsl(${hue}_40%_65%)]`;
};

const createInitialModules = (awardType: AwardTypeKey): Module[] => {
  const award = awardTypes[awardType];
  if (award.integrated) {
    // For integrated masters, create 6 modules for each level (120 credits each)
    const level6Modules = Array(6).fill(null).map((_, index) => ({
      name: "",
      credits: "20",
      mark: "0",
      level: "6",
      id: `module-${index + 1}`
    }));
    const level7Modules = Array(6).fill(null).map((_, index) => ({
      name: "",
      credits: "20",
      mark: "0",
      level: "7",
      id: `module-${index + 7}`
    }));
    return [...level6Modules, ...level7Modules];
  } else {
    // Start with appropriate number of modules for each award type
    let numModules = 3; // Default for PgCert (60 credits)
    if (awardType === 'pgdip') {
      numModules = 6; // 120 credits
    } else if (awardType === 'masters') {
      numModules = 7; // 180 credits (typically includes large project)
    } else if (awardType === 'mres') {
      numModules = 5; // 180 credits (research-focused with large dissertation)
    } else if (awardType === 'mfa') {
      numModules = 6; // 240 credits (includes large portfolio/practice modules)
    } else if (awardType === 'erasmus') {
      numModules = 7; // 240 credits
    }

    return Array(numModules).fill(null).map((_, index) => ({
      name: "",
      credits: "20",
      mark: "0",
      level: "7",
      id: `module-${index + 1}`
    }));
  }
};

export default function PostgraduatePage() {
  const [mounted, setMounted] = useState(false);
  const [selectedAward, setSelectedAward] = useState<AwardTypeKey>("masters");
  const [modules, setModules] = useState<Module[]>(createInitialModules("masters"));
  const [result, setResult] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    setMounted(true);
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setTheme("dark");
      document.body.classList.add("dark");
    }
  }, []);

  // Removed automatic module reset on award change to allow proper Load functionality

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

  const handleAddModule = (level?: string) => {
    const newLevel = level || (awardTypes[selectedAward].integrated ? "6" : "7");
    setModules([
      ...modules,
      {
        name: "",
        credits: "20",
        mark: "0",
        level: newLevel,
        id: `module-${modules.length + 1}`
      }
    ]);
  };

  const handleRemoveModule = (moduleId: string) => {
    setModules(modules.filter(m => m.id !== moduleId));
  };

  const handleModuleChange = (
    index: number,
    field: keyof Module,
    value: string
  ) => {
    setModules(modules.map((module, i) =>
      i === index ? { ...module, [field]: value } : module
    ));

    // If this is a mark or credits change and we've had a previous calculation
    if ((field === "mark" || field === "credits") && (result || error)) {
      // Schedule the recalculation to run after state update
      setTimeout(() => {
        calculateDegree();
      }, 0);
    }
  };

  const calculateDegree = () => {
    setError("");
    const award = awardTypes[selectedAward];

    // Get valid modules (with marks and credits)
    const validModules = modules.filter(module =>
      module.mark !== "" && !isNaN(Number(module.mark)) &&
      module.credits !== "" && !isNaN(Number(module.credits))
    ).map(module => ({
      ...module,
      mark: Number(module.mark),
      credits: Number(module.credits)
    }));

    if (validModules.length === 0) {
      setError("Please enter at least one module with credits and mark");
      return;
    }

    // Split by level
    const level6Modules = validModules.filter(m => m.level === "6");
    const level7Modules = validModules.filter(m => m.level === "7");

    // Get passing modules only (40% for L6, 50% for L7)
    const level6Passing = level6Modules.filter(m => m.mark >= 40);
    const level7Passing = level7Modules.filter(m => m.mark >= 50);

    // Calculate credits from passing modules only
    const level6Credits = level6Passing.reduce((sum, m) => sum + m.credits, 0);
    const level7Credits = level7Passing.reduce((sum, m) => sum + m.credits, 0);
    const totalCredits = level6Credits + level7Credits;

    const allPassed = level6Modules.length === level6Passing.length && level7Modules.length === level7Passing.length;

    // Validate credit requirements with better error messages
    if (award.integrated) {
      // For Integrated Masters, both levels have strict minimum requirements
      if (level6Credits < award.maxLevel6 && level7Credits < award.totalLevel7) {
        setError(`Insufficient passing credits. Level 6: ${level6Credits}/${award.maxLevel6}, Level 7: ${level7Credits}/${award.totalLevel7}. You need at least ${award.maxLevel6} credits at Level 6 (40%+) and ${award.totalLevel7} credits at Level 7 (50%+).`);
        return;
      }
      if (level6Credits < award.maxLevel6) {
        setError(`Insufficient passing Level 6 credits (${level6Credits}/${award.maxLevel6}). You need at least ${award.maxLevel6} credits at Level 6 with marks of 40% or higher.`);
        return;
      }
      if (level7Credits < award.totalLevel7) {
        setError(`Insufficient passing Level 7 credits (${level7Credits}/${award.totalLevel7}). You need at least ${award.totalLevel7} credits at Level 7 with marks of 50% or higher.`);
        return;
      }
    } else {
      // For other awards, check Level 7 and Level 6 separately
      const needsLevel6 = award.maxLevel6 > 0;

      if (level7Credits < award.totalLevel7 && needsLevel6 && level6Credits > award.maxLevel6) {
        setError(`Insufficient Level 7 credits (${level7Credits}/${award.totalLevel7}) and too many Level 6 credits (${level6Credits}/${award.maxLevel6} max). You need at least ${award.totalLevel7} credits at Level 7 (50%+) and maximum ${award.maxLevel6} credits at Level 6.`);
        return;
      }

      if (level7Credits < award.totalLevel7) {
        setError(`Insufficient passing Level 7 credits (${level7Credits}/${award.totalLevel7}). You need at least ${award.totalLevel7} credits at Level 7 with marks of 50% or higher.`);
        return;
      }

      if (level6Credits > award.maxLevel6) {
        setError(`Too many Level 6 credits (${level6Credits}/${award.maxLevel6} max). Maximum ${award.maxLevel6} credits at Level 6.`);
        return;
      }
    }

    // Calculate weighted average
    let weightedSum = 0;
    let totalWeightedCredits = 0;

    if (award.integrated) {
      // For integrated masters, calculate based on combined L6 and L7
      weightedSum = validModules.reduce((sum, m) => sum + (m.mark * m.credits), 0);
      totalWeightedCredits = totalCredits;
    } else {
      // For regular postgrad awards, only use L7 for classification
      weightedSum = level7Modules.reduce((sum, m) => sum + (m.mark * m.credits), 0);
      totalWeightedCredits = level7Credits;
    }

    const average = weightedSum / totalWeightedCredits;

    // Determine classification
    let classification = "";
    let classificationWithoutFirstAttempt = "";

    if (average >= 70) {
      classification = "Distinction";
    } else if (average >= 60) {
      classification = "Merit";
    } else if (average >= 50) {
      classification = "Pass";
    } else {
      classification = "Fail";
    }

    // For integrated masters, also show classification without first attempt requirement
    if (award.integrated) {
      classificationWithoutFirstAttempt = classification;
      if (!allPassed && classification === "Distinction") {
        classification = "Merit";
      }
      if (!allPassed && classification === "Merit") {
        classification = "Pass";
      }
    }

    // Create result message
    let resultMessage = `Average Score: ${average.toFixed(2)}%\n`;

    if (award.integrated) {
      resultMessage += `\n`;
      if (allPassed) {
        resultMessage += `Classification: ${classification}\n`;
        resultMessage += `\nNote: This assumes all modules were passed at first attempt.`;
      } else {
        resultMessage += `If you passed all modules at first attempt: ${classificationWithoutFirstAttempt}\n`;
        resultMessage += `If you did not pass all modules at first attempt: Pass only (regardless of average)`;
      }
      resultMessage += `\n\nDetails:\n`;
      resultMessage += `Level 6 Average: ${level6Credits > 0 ? (level6Passing.reduce((sum, m) => sum + (m.mark * m.credits), 0) / level6Credits).toFixed(2) : 0}%\n`;
      resultMessage += `Level 7 Average: ${level7Credits > 0 ? (level7Passing.reduce((sum, m) => sum + (m.mark * m.credits), 0) / level7Credits).toFixed(2) : 0}%\n`;
      resultMessage += `Level 6 Credits: ${level6Credits}\n`;
      resultMessage += `Level 7 Credits: ${level7Credits}`;
    } else {
      resultMessage += `Classification: ${classification}\n`;
      resultMessage += `\nDetails:\n`;
      resultMessage += `Level 7 Average: ${average.toFixed(2)}%\n`;
      resultMessage += `Level 7 Credits: ${level7Credits}`;
      if (level6Credits > 0) {
        resultMessage += `\nLevel 6 Credits: ${level6Credits}`;
      }
    }

    setResult(resultMessage);

    // Track calculation event in Google Analytics
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'calculate_degree', {
        calculator_type: 'postgraduate',
        award_type: selectedAward,
        classification: classification
      });
    }
  };

  const handleReset = () => {
    setModules(createInitialModules(selectedAward));
    setResult("");
    setError("");
  };

  const handleSave = () => {
    try {
      localStorage.setItem('pgModules', JSON.stringify({ modules, selectedAward }));
      alert('Your modules have been saved!');
    } catch (err) {
      alert('Failed to save modules. Please try again.');
    }
  };

  const handleLoad = () => {
    try {
      const saved = localStorage.getItem('pgModules');
      if (saved) {
        const data = JSON.parse(saved);
        setModules(data.modules);
        setSelectedAward(data.selectedAward);
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

  const renderCreditTotal = (level?: string) => {
    const award = awardTypes[selectedAward];
    let filteredModules = modules;

    if (level) {
      filteredModules = modules.filter(m => m.level === level);
    }

    // Only count modules that have passing marks
    const validModules = filteredModules.filter(module => {
      if (module.credits === "" || isNaN(Number(module.credits))) return false;
      if (module.mark === "" || isNaN(Number(module.mark))) return false;
      const mark = Number(module.mark);
      const minPassingMark = module.level === "7" ? 50 : 40;
      return mark >= minPassingMark;
    });
    const totalCredits = validModules.reduce((sum, m) => sum + Number(m.credits), 0);

    let requiredCredits = "";
    let isValid = true;

    if (level === "6") {
      if (award.integrated) {
        // For integrated masters, Level 6 needs to reach the required amount
        requiredCredits = `/ ${award.maxLevel6}`;
        isValid = totalCredits >= award.maxLevel6;
      } else {
        // For other awards, Level 6 is optional with a maximum
        requiredCredits = award.maxLevel6 > 0 ? `/ ${award.maxLevel6} max` : "";
        isValid = totalCredits <= award.maxLevel6;
      }
    } else if (level === "7") {
      requiredCredits = `/ ${award.totalLevel7}`;
      isValid = totalCredits >= award.totalLevel7;
    } else {
      requiredCredits = `/ ${award.minCredits}`;
      isValid = totalCredits >= award.minCredits;
    }

    return (
      <div className={`text-sm font-medium ${isValid ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
        Total Credits: {totalCredits} {requiredCredits}
      </div>
    );
  };

  const renderModuleInput = (module: Module, index: number) => {
    const mark = Number(module.mark || "0");
    const markColor = getMarkColor(mark);
    const textColor = getGradeTextColor(mark);
    const minPassingMark = module.level === "7" ? 50 : 40;

    return (
      <div
        key={module.id}
        className="p-3 border-2 rounded-lg relative transition-colors overflow-hidden"
        suppressHydrationWarning
      >
        <div className="flex justify-between items-start gap-2">
          <div className="grid grid-cols-1 xs:grid-cols-[2fr,auto,auto,auto] gap-2 flex-grow">
            <div className="space-y-1">
              <Label htmlFor={`${module.id}-name`} className={`text-sm font-medium ${textColor}`}>Module Name/Code</Label>
              <Input
                id={`${module.id}-name`}
                value={module.name}
                onChange={(e) => handleModuleChange(index, "name", e.target.value)}
                placeholder="e.g., Module Name"
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
                onChange={(e) => handleModuleChange(index, "credits", e.target.value)}
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
              <Label htmlFor={`${module.id}-level`} className={`text-sm font-medium ${textColor}`}>Level</Label>
              <Select
                value={module.level}
                onValueChange={(value) => handleModuleChange(index, "level", value)}
              >
                <SelectTrigger id={`${module.id}-level`} className={`h-8 w-24 ${markColor}`}>
                  <SelectValue placeholder="Level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="6">Level 6</SelectItem>
                  <SelectItem value="7">Level 7</SelectItem>
                </SelectContent>
              </Select>
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
                onChange={(e) => handleModuleChange(index, "mark", e.target.value)}
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
            onClick={() => handleRemoveModule(module.id)}
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
            onValueChange={(value) => handleModuleChange(index, "mark", value[0].toString())}
            onValueCommit={(value) => {
              // Recalculate when slider is released to ensure final value is used
              if (result || error) {
                setTimeout(() => calculateDegree(), 0);
              }
            }}
            className="[&_[role=slider]]:!bg-white dark:[&_[role=slider]]:!bg-slate-50 [&_.absolute.h-full]:!bg-current"
            style={{ color: `hsl(${mark <= 40
              ? mark * 0.9375
              : mark <= 50
                ? 37.5 + ((mark - 40) * 2.25)
                : mark <= 55
                  ? 60
                  : mark <= 70
                    ? 60 + ((mark - 55) * 4)
                    : 120 + ((mark - 70) * 4)
            } 90% 45%)` }}
          />
        </div>
        {mark < minPassingMark && mark > 0 && (
          <div className="mt-1 text-xs text-red-600 dark:text-red-400">
            Level {module.level} requires {minPassingMark}% to pass
          </div>
        )}
      </div>
    );
  };

  if (!mounted) return null;

  const award = awardTypes[selectedAward];
  const level6Modules = modules.filter(m => m.level === "6");
  const level7Modules = modules.filter(m => m.level === "7");

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
          <CardTitle className="text-4xl font-bold tracking-tight">Postgraduate Degree Calculator</CardTitle>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="about">
              <AccordionTrigger className="text-lg">About</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4">
                  <p className="text-lg leading-relaxed">
                    This calculator determines your postgraduate degree classification based on your module scores.
                    Select your award type and enter your module details (name, credits, and marks).
                    The calculator computes a credit-weighted average to determine whether you achieve a Pass, Merit, or Distinction.
                  </p>
                  <p className="text-lg leading-relaxed">
                    <strong>Passing Requirements:</strong> To earn credits for a module, you must achieve at least 50% for Level 7 modules (postgraduate level),
                    or at least 40% for Level 6 modules (undergraduate level, where permitted).
                    Only modules you have passed will count towards your total credits and final classification.
                  </p>
                  <p className="text-lg leading-relaxed">
                    <strong>Classification Boundaries:</strong> Distinction: 70%+, Merit: 60-69%, Pass: 50-59%.
                    For Integrated Masters, you must pass all modules at first attempt to be eligible for Merit or Distinction.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Looking for the undergraduate calculator? <Link href="/" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">Click here for the Undergraduate Degree Calculator →</Link>
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
            <div className="space-y-2">
              <Label htmlFor="award-type" className="text-lg font-semibold">Award Type</Label>
              <Select value={selectedAward} onValueChange={(value) => {
                const newAward = value as AwardTypeKey;
                setSelectedAward(newAward);
                setModules(createInitialModules(newAward));
                setResult("");
                setError("");
              }}>
                <SelectTrigger id="award-type" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(awardTypes).map(([key, award]) => (
                    <SelectItem key={key} value={key}>
                      {award.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {award.integrated ? (
              // Side-by-side layout for Integrated Masters
              <div className="flex flex-col lg:flex-row gap-8">
                <div className="space-y-4 flex-1">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold tracking-tight">Level 6 Modules</h3>
                    {renderCreditTotal("6")}
                  </div>
                  <div className="space-y-4">
                    {level6Modules.map((module, index) => {
                      const originalIndex = modules.findIndex(m => m.id === module.id);
                      return renderModuleInput(module, originalIndex);
                    })}
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => handleAddModule("6")}
                    >
                      Add Level 6 Module
                    </Button>
                  </div>
                </div>

                <div className="space-y-4 flex-1">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold tracking-tight">Level 7 Modules</h3>
                    {renderCreditTotal("7")}
                  </div>
                  <div className="space-y-4">
                    {level7Modules.map((module, index) => {
                      const originalIndex = modules.findIndex(m => m.id === module.id);
                      return renderModuleInput(module, originalIndex);
                    })}
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => handleAddModule("7")}
                    >
                      Add Level 7 Module
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              // Single column layout for other awards
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold tracking-tight">Modules</h3>
                  {renderCreditTotal()}
                </div>
                <div className="space-y-4">
                  {modules.map((module, index) => renderModuleInput(module, index))}
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => handleAddModule()}
                  >
                    Add Module
                  </Button>
                </div>
              </div>
            )}

            <div className="space-y-3">
              <div className="flex justify-center gap-4">
                <Button
                  onClick={calculateDegree}
                  className="w-full max-w-xs text-sm sm:text-base md:text-lg font-semibold"
                  variant="outline"
                  size="lg"
                >
                  Calculate Classification
                </Button>
                <Button
                  onClick={handleReset}
                  className="w-full max-w-xs text-sm sm:text-base md:text-lg font-semibold"
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
                  result.includes("Distinction") ? "bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400" :
                  result.includes("Merit") ? "bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400" :
                  result.includes("Pass") ? "bg-yellow-100 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400" :
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
