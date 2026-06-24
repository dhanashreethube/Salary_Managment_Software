import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { toBaseUnit, toSubUnit } from "../../utils/formatters.js";

// Client-side validation schema using Zod
const compensationSchema = z.object({
  baseSalary: z
    .number({ invalid_type_error: "Base salary must be a valid number" })
    .nonnegative("Base salary cannot be negative"),
  bonus: z
    .number({ invalid_type_error: "Bonus must be a valid number" })
    .nonnegative("Bonus cannot be negative"),
  allowances: z
    .number({ invalid_type_error: "Allowance must be a valid number" })
    .nonnegative("Allowance cannot be negative"),
  deductions: z
    .number({ invalid_type_error: "Deductions must be a valid number" })
    .nonnegative("Deductions cannot be negative"),
});

/**
 * Custom React hook that encapsualtes form bindings, useEffect mappings,
 * Zod validations, and TanStack mutations for salary updates.
 */
export function useModifySalary(employee, onClose) {
  const queryClient = useQueryClient();
  const [errorMsg, setErrorMsg] = useState("");

  const [baseSalary, setBaseSalary] = useState("");
  const [bonus, setBonus] = useState("");
  const [allowances, setAllowances] = useState("");
  const [deductions, setDeductions] = useState("");

  // Map sub-units from db to standard decimal representation
  useEffect(() => {
    if (employee && employee.compensation) {
      const comp = employee.compensation;
      setBaseSalary(toBaseUnit(comp.baseSalary).toString());
      setBonus(toBaseUnit(comp.bonus).toString());
      setAllowances(toBaseUnit(comp.allowances).toString());
      setDeductions(toBaseUnit(comp.deductions).toString());
    }
  }, [employee]);

  const mutation = useMutation({
    mutationFn: async (payload) => {
      const res = await fetch(`/api/employees/${employee.id}/compensation`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update compensation details");
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["employees"]);
      queryClient.invalidateQueries(["metrics"]);
      onClose(); // Close modal on success
    },
    onError: (err) => {
      setErrorMsg(err.message);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMsg("");

    const baseVal = parseFloat(baseSalary);
    const bonusVal = parseFloat(bonus) || 0;
    const allowanceVal = parseFloat(allowances) || 0;
    const deductionVal = parseFloat(deductions) || 0;

    // Validate using Zod schema
    const result = compensationSchema.safeParse({
      baseSalary: baseVal,
      bonus: bonusVal,
      allowances: allowanceVal,
      deductions: deductionVal,
    });

    if (!result.success) {
      // Map error messages nicely for form feedback
      const messages = result.error.issues.map((issue) => issue.message).join(" | ");
      setErrorMsg(messages);
      return;
    }

    // Convert decimal numbers to sub-unit integers
    const payload = {
      baseSalary: toSubUnit(baseVal),
      bonus: toSubUnit(bonusVal),
      allowances: toSubUnit(allowanceVal),
      deductions: toSubUnit(deductionVal),
    };

    mutation.mutate(payload);
  };

  return {
    baseSalary,
    setBaseSalary,
    bonus,
    setBonus,
    allowances,
    setAllowances,
    deductions,
    setDeductions,
    errorMsg,
    isPending: mutation.isPending,
    handleSubmit,
  };
}
