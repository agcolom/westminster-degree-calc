"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Trash2, Moon, Sun, AlertTriangle } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
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
import { debounce } from "@/lib/utils";

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
    integrated: false,
    includeL6InClassification: true // L6 modules count in classification
  },
  pgdip: {
    label: "Postgraduate Diploma (PgDip)",
    minCredits: 120,
    maxLevel6: 20,
    totalLevel7: 120,
    integrated: false,
    includeL6InClassification: true // L6 modules count in classification
  },
  mfa: {
    label: "Master of Fine Arts (MFA)",
    minCredits: 240,
    maxLevel6: 0,
    totalLevel7: 240,
    integrated: false,
    includeL6InClassification: false
  },
  mres: {
    label: "Master by Research (MRes)",
    minCredits: 180,
    maxLevel6: 20,
    totalLevel7: 180,
    integrated: false,
    includeL6InClassification: false // L6 modules count towards award but NOT classification
  },
  erasmus: {
    label: "Erasmus Mundus Master's",
    minCredits: 240,
    maxLevel6: 20,
    totalLevel7: 240,
    integrated: false,
    includeL6InClassification: false // L6 modules count towards award but NOT classification
  },
  masters: {
    label: "Master's Degree (MA, MSc, MBA, LLM, MArch, MMus)",
    minCredits: 180,
    maxLevel6: 20,
    totalLevel7: 180,
    integrated: false,
    includeL6InClassification: false // L6 modules count towards award but NOT classification
  },
  integrated: {
    label: "Integrated Masters (MEng, MLaw, MSci)",
    minCredits: 240,
    maxLevel6: 120,
    totalLevel7: 120,
    integrated: true,
    includeL6InClassification: true // L6 modules count in classification
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
  const { toast } = useToast();
  const [mounted, setMounted] = useState(false);
  const [selectedAward, setSelectedAward] = useState<AwardTypeKey>("masters");
  const [modules, setModules] = useState<Module[]>(createInitialModules("masters"));
  const [result, setResult] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [showL6Warning, setShowL6Warning] = useState<boolean>(false);
  const [l6WarningMessage, setL6WarningMessage] = useState<string>("");
  const [theme, setTheme] = useState<"light" | "dark">("light");

  // Debounced tracking function for auto-calculations
  const debouncedTrackCalculation = useRef(
    debounce((classification: string, awardType: string) => {
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'calculate_degree', {
          calculator_type: 'postgraduate',
          award_type: awardType,
          classification: classification,
          calculation_trigger: 'auto_calculation'
        });
      }
    }, 2000) // Wait 2 seconds after last change
  ).current;

  useEffect(() => {
    setMounted(true);
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setTheme("dark");
      document.body.classList.add("dark");
    }
  }, []);

  // Auto-recalculate when modules change (if a calculation has been performed)
  useEffect(() => {
    if ((result || error) && mounted) {
      calculateDegree('auto_calculation');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modules]);

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
    // Safety check
    if (!Array.isArray(modules)) {
      console.error('modules state is not an array:', modules);
      return;
    }

    const updatedModules = modules.map((module, i) =>
      i === index ? { ...module, [field]: value } : module
    );
    setModules(updatedModules);
    // Note: useEffect will automatically recalculate when modules change
  };

  const calculateDegree = (trigger: 'button_click' | 'auto_calculation' = 'button_click') => {
    setError("");
    setShowL6Warning(false);
    setL6WarningMessage("");
    const award = awardTypes[selectedAward];

    // Safety check to ensure we have an array
    if (!Array.isArray(modules)) {
      console.error('modules state is not an array:', modules);
      return;
    }

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

    // MRes-specific validation: Must have a project module with at least 80 credits
    if (selectedAward === 'mres') {
      const allPassingModules = [...level6Passing, ...level7Passing];
      const hasProjectModule = allPassingModules.some(m => m.credits >= 80);
      if (!hasProjectModule) {
        setError("MRes requires a project module with a minimum of 80 credits. Please ensure you have a project module with at least 80 credits and a passing mark (50%+ for Level 7, 40%+ for Level 6).");
        return;
      }
    }

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
      // For other awards (PGCert, PGDip, Masters, etc.)
      // L6 credits can count towards the minimum if validated as part of the award

      // First check if too many L6 credits
      if (level6Credits > award.maxLevel6) {
        setError(`Too many Level 6 credits (${level6Credits}/${award.maxLevel6} max). Maximum ${award.maxLevel6} credits at Level 6.`);
        return;
      }

      // Check if total credits meet the minimum requirement
      if (totalCredits < award.minCredits) {
        setError(`Insufficient passing credits (${totalCredits}/${award.minCredits}). You need at least ${award.minCredits} credits total. This can include Level 7 credits (50%+) and up to ${award.maxLevel6} credits at Level 6 (40%+) if validated as part of your award.`);
        return;
      }

      // Ensure there's enough L7 credits (considering L6 can make up the difference)
      const minRequiredL7 = award.minCredits - award.maxLevel6;
      if (level7Credits < minRequiredL7) {
        setError(`Insufficient passing Level 7 credits (${level7Credits}/${minRequiredL7} minimum). You need at least ${minRequiredL7} credits at Level 7 with marks of 50% or higher.`);
        return;
      }
    }

    // Calculate weighted average
    let weightedSum = 0;
    let totalWeightedCredits = 0;

    if (award.integrated || award.includeL6InClassification) {
      // For integrated masters, PGCert, and PGDip: include both L6 and L7 in classification
      weightedSum = validModules.reduce((sum, m) => sum + (m.mark * m.credits), 0);
      totalWeightedCredits = totalCredits;
    } else {
      // For other postgrad awards (Erasmus, MRes, Masters, MFA): only use L7 for classification
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
    } else {
      // If they've reached this point, they have all required credits with passing marks
      // So they get at least a Pass, even if average is below 50%
      classification = "Pass";
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

      // Show accurate breakdown based on whether L6 is included
      if (award.includeL6InClassification && level6Credits > 0) {
        // PGCert, PGDip with L6 modules: show combined average breakdown
        resultMessage += `\nDetails:\n`;
        resultMessage += `Overall Average: ${average.toFixed(2)}%\n`;
        resultMessage += `Level 7 Credits: ${level7Credits}\n`;
        resultMessage += `Level 6 Credits: ${level6Credits}`;
      } else if (level6Credits > 0) {
        // Masters, MRes, Erasmus with L6 modules: show separate averages
        resultMessage += `\nDetails:\n`;
        resultMessage += `Level 7 Average (used for classification): ${average.toFixed(2)}%\n`;
        const level6Average = level6Passing.reduce((sum, m) => sum + (m.mark * m.credits), 0) / level6Credits;
        resultMessage += `Level 6 Average (not used for classification): ${level6Average.toFixed(2)}%\n`;
        resultMessage += `Level 7 Credits: ${level7Credits}\n`;
        resultMessage += `Level 6 Credits: ${level6Credits}`;
      } else {
        // No L6 modules: just show credits (average already shown above)
        resultMessage += `\nTotal Credits: ${level7Credits}`;
      }
    }

    // Set Level 6 warning if Level 6 modules were used
    if (level6Credits > 0 && !award.integrated) {
      setShowL6Warning(true);
      if (award.includeL6InClassification) {
        // PGCert, PGDip
        setL6WarningMessage(`Level 6 modules count towards your award and classification only if they are validated as part of your programme. Please check your programme specification.`);
      } else {
        // Erasmus, MRes, Masters
        setL6WarningMessage(`Level 6 modules count towards your award only if they are validated as part of your programme. They do NOT contribute to your classification (only Level 7 modules count for classification). Please check your programme specification.`);
      }
    } else {
      setShowL6Warning(false);
      setL6WarningMessage("");
    }

    setResult(resultMessage);

    // Track calculation event in Google Analytics
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'calculate_degree', {
        calculator_type: 'postgraduate',
        award_type: selectedAward,
        classification: classification,
        calculation_trigger: trigger
      });
    }
  };

  const handleReset = () => {
    setModules(createInitialModules(selectedAward));
    setResult("");
    setError("");
    setShowL6Warning(false);
    setL6WarningMessage("");
  };

  const handleSave = () => {
    try {
      localStorage.setItem('pgModules', JSON.stringify({ modules, selectedAward }));
      toast({
        title: "Saved successfully",
        description: "Your module marks have been saved!",
      });

      // Track save event in Google Analytics
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'save_marks', {
          calculator_type: 'postgraduate',
          award_type: selectedAward
        });
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to save modules. Please try again.",
        variant: "destructive",
      });
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
        setShowL6Warning(false);
        setL6WarningMessage("");
        toast({
          title: "Loaded successfully",
          description: "Your module marks have been loaded!",
        });

        // Track successful load event in Google Analytics
        if (typeof window !== 'undefined' && (window as any).gtag) {
          (window as any).gtag('event', 'load_marks', {
            calculator_type: 'postgraduate',
            award_type: data.selectedAward,
            load_status: 'success'
          });
        }
      } else {
        toast({
          title: "No saved data",
          description: "No saved module marks found.",
        });

        // Track failed load (no data) in Google Analytics
        if (typeof window !== 'undefined' && (window as any).gtag) {
          (window as any).gtag('event', 'load_marks', {
            calculator_type: 'postgraduate',
            award_type: selectedAward,
            load_status: 'no_data'
          });
        }
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to load modules. Please try again.",
        variant: "destructive",
      });

      // Track error in Google Analytics
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'load_marks', {
          calculator_type: 'postgraduate',
          award_type: selectedAward,
          load_status: 'error'
        });
      }
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
                placeholder="e.g. Module Name"
                className={`h-8 w-full min-w-[10ch] ${markColor} placeholder:text-slate-400 dark:placeholder:text-slate-500`}
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
                className={`w-20 h-8 text-sm ${markColor}`}
              />
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="text-slate-600 hover:text-red-600 dark:text-slate-300 dark:hover:text-red-400 h-8 w-8"
            onClick={() => handleRemoveModule(module.id)}
            aria-label={`Remove ${module.name || 'module'}`}
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
            aria-label={`Mark for ${module.name || 'module'}: ${mark}%`}
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
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded-md focus:shadow-lg"
      >
        Skip to main content
      </a>
      <Card className="max-w-7xl mx-auto relative shadow-lg bg-white dark:bg-slate-900" suppressHydrationWarning>
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-4 top-4 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
          onClick={toggleTheme}
          aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
        >
          {theme === "light" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
        </Button>
        <CardHeader>
          <h1 className="text-4xl font-bold tracking-tight pr-16 break-words">Postgraduate Degree Calculator</h1>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="about">
              <AccordionTrigger className="text-lg">About</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4">
                  <p className="text-lg leading-relaxed">
                    Use this tool to get a helpful estimate of the postgraduate award you might achieve by the end of your course, based on the marks you have so far.
                    If you&apos;re missing any marks, you can simply enter what you expect to get. Please note that this provides an estimate only and should not be taken as a definitive prediction of your final classification.
                  </p>
                  <p className="text-lg leading-relaxed">
                    <strong>Passing Requirements:</strong> To earn credits for a module, you must achieve at least 50% for Level 7 modules (postgraduate level),
                    or at least 40% for Level 6 modules (undergraduate level, where permitted).
                    Only modules you have passed will count towards your total credits and final classification.
                  </p>
                  <p className="text-lg leading-relaxed">
                    <strong>Level 6 Modules:</strong> The contribution of Level 6 modules varies by award type:
                  </p>
                  <ul className="text-lg leading-relaxed list-disc list-inside space-y-1 ml-2">
                    <li><strong>PGCert, PGDip:</strong> May include up to 20 credits at Level 6 (if validated as part of your programme). These count towards both your award <em>and</em> classification.</li>
                    <li><strong>Erasmus Mundus, MRes, Master&apos;s (MA, MSc, MBA, LLM, MArch, MMus):</strong> May include up to 20 credits at Level 6 (if validated as part of your programme). These count towards your award but <em>not</em> your classification (only Level 7 modules count for classification).</li>
                    <li><strong>MFA:</strong> Does not permit any Level 6 credits.</li>
                    <li><strong>Integrated Masters:</strong> Requires 120 credits at Level 6, which count towards both award and classification.</li>
                  </ul>
                  <p className="text-lg leading-relaxed">
                    Check your programme specification to confirm which Level 6 modules (if any) are validated as part of your award.
                  </p>
                  <p className="text-lg leading-relaxed">
                    <strong>Classification Boundaries:</strong> Distinction: 70%+, Merit: 60-69%, Pass: 50-59%.
                    For Integrated Masters, you must pass all modules at first attempt to be eligible for Merit or Distinction.
                  </p>
                  <p className="text-lg leading-relaxed">
                    <strong>How to Use:</strong>
                  </p>
                  <ol className="text-lg leading-relaxed list-decimal list-inside space-y-2 ml-2">
                    <li>Select your award type from the dropdown (PgCert, PgDip, Masters, or Integrated Masters)</li>
                    <li>Enter your module names (optional), credits, marks, and levels</li>
                    <li>Use the sliders or type directly to adjust marks - the colours indicate your performance</li>
                    <li>Click &quot;Add Module&quot; if you need to add more modules</li>
                    <li>Click &quot;Calculate Classification&quot; to see your degree classification</li>
                    <li>Use &quot;Save My Marks&quot; to save your progress and &quot;Load My Marks&quot; to restore it later</li>
                    <li>Click &quot;Reset All&quot; to start over with empty modules</li>
                  </ol>
                  <p className="text-lg leading-relaxed">
                    <strong>How It Works:</strong> The calculator computes a credit-weighted average of your passing modules to determine whether you achieve a Pass, Merit, or Distinction.
                  </p>
                  <p className="text-lg text-muted-foreground">
                    For undergraduate degrees: <Link href="/" className="text-blue-600 dark:text-blue-400 underline font-medium">Switch to Undergraduate Degree Calculator →</Link>
                  </p>
                  <p className="text-lg text-muted-foreground">
                    Developed by Anne-Gaelle Colom, University of Westminster (2026)
                  </p>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardHeader>
        <CardContent id="main-content">
          <div className="space-y-8">
            <div className="space-y-2">
              <Label htmlFor="award-type" className="text-lg font-semibold">Award Type</Label>
              <Select value={selectedAward} onValueChange={(value) => {
                const newAward = value as AwardTypeKey;
                setSelectedAward(newAward);
                setModules(createInitialModules(newAward));
                setResult("");
                setError("");
                setShowL6Warning(false);
                setL6WarningMessage("");
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
                    <h2 className="text-lg font-semibold tracking-tight">Level 6 Modules</h2>
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
                    <h2 className="text-lg font-semibold tracking-tight">Level 7 Modules</h2>
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
                  <h2 className="text-lg font-semibold tracking-tight">Modules</h2>
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
                  onClick={() => calculateDegree('button_click')}
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
                  variant="outline"
                  size="default"
                >
                  Save My Marks
                </Button>
                <Button
                  onClick={handleLoad}
                  className="w-full max-w-xs"
                  variant="outline"
                  size="default"
                >
                  Load My Marks
                </Button>
              </div>
            </div>

            {error && (
              <div
                className="mt-4 p-4 bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-center font-medium"
                role="alert"
                aria-live="polite"
              >
                {error}
              </div>
            )}

            {result && !error && (
              <div className="mt-4 space-y-3">
                <div
                  className={`p-4 rounded-lg text-center font-medium whitespace-pre-line ${
                    result.includes("Distinction") ? "bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300" :
                    result.includes("Merit") ? "bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300" :
                    result.includes("Pass") ? "bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300" :
                    "bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300"
                  }`}
                  role="status"
                  aria-live="polite"
                >
                  {result}
                </div>
                {showL6Warning && (
                  <div
                    className="p-4 bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-500 rounded-lg"
                    role="alert"
                    aria-live="polite"
                  >
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" aria-hidden="true" />
                      <div className="text-amber-800 dark:text-amber-200">
                        <strong className="font-semibold">Important: </strong>
                        {l6WarningMessage}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
