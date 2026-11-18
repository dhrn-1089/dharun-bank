export interface ScheduleRow {
  installmentNumber: number;
  monthName: string;
  dueDate: Date;
  emiAmount: number;
  principalComponent: number;
  interestComponent: number;
  remainingAmount: number;
  status: "UPCOMING" | "PAID" | "PARTIALLY_PAID" | "OVERDUE";
}

export function formatINR(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatINRDecimal(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function calculateReducingBalanceEmi(
  principal: number,
  annualInterestRate: number,
  tenureMonths: number
): {
  monthlyEmi: number;
  totalInterest: number;
  totalRepayment: number;
} {
  if (tenureMonths <= 0 || principal <= 0) {
    return { monthlyEmi: 0, totalInterest: 0, totalRepayment: 0 };
  }

  const monthlyRate = annualInterestRate / 12 / 100;
  if (monthlyRate === 0) {
    const monthlyEmi = Math.round(principal / tenureMonths);
    return {
      monthlyEmi,
      totalInterest: 0,
      totalRepayment: principal,
    };
  }

  const factor = Math.pow(1 + monthlyRate, tenureMonths);
  const emi = (principal * monthlyRate * factor) / (factor - 1);
  const roundedEmi = Math.round(emi);
  const totalRepayment = roundedEmi * tenureMonths;
  const totalInterest = totalRepayment - principal;

  return {
    monthlyEmi: roundedEmi,
    totalInterest,
    totalRepayment,
  };
}

export function calculateFlatInterestEmi(
  principal: number,
  annualInterestRate: number,
  tenureMonths: number
): {
  monthlyEmi: number;
  totalInterest: number;
  totalRepayment: number;
} {
  const years = tenureMonths / 12;
  const totalInterest = Math.round(principal * (annualInterestRate / 100) * years);
  const totalRepayment = principal + totalInterest;
  const monthlyEmi = Math.round(totalRepayment / tenureMonths);

  return {
    monthlyEmi,
    totalInterest,
    totalRepayment,
  };
}

export function generateAmortizationSchedule(
  principal: number,
  annualInterestRate: number,
  tenureMonths: number,
  startDate: Date,
  interestType: "REDUCING_BALANCE" | "FLAT" = "REDUCING_BALANCE",
  dueDay: number = 5
): ScheduleRow[] {
  const schedule: ScheduleRow[] = [];
  const monthlyRate = annualInterestRate / 12 / 100;

  let calc;
  if (interestType === "FLAT") {
    calc = calculateFlatInterestEmi(principal, annualInterestRate, tenureMonths);
  } else {
    calc = calculateReducingBalanceEmi(principal, annualInterestRate, tenureMonths);
  }

  let remainingPrincipal = principal;
  const currentDate = new Date(startDate);

  for (let i = 1; i <= tenureMonths; i++) {
    // Add month
    const dueDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + i, dueDay);
    const monthName = dueDate.toLocaleString("en-IN", { month: "long", year: "numeric" });

    let interestComp: number;
    let principalComp: number;

    if (interestType === "FLAT") {
      interestComp = Math.round(calc.totalInterest / tenureMonths);
      principalComp = calc.monthlyEmi - interestComp;
    } else {
      interestComp = Math.round(remainingPrincipal * monthlyRate);
      principalComp = calc.monthlyEmi - interestComp;
    }

    if (i === tenureMonths || principalComp > remainingPrincipal) {
      principalComp = remainingPrincipal;
    }

    remainingPrincipal = Math.max(0, remainingPrincipal - principalComp);

    schedule.push({
      installmentNumber: i,
      monthName,
      dueDate,
      emiAmount: calc.monthlyEmi,
      principalComponent: principalComp,
      interestComponent: interestComp,
      remainingAmount: calc.monthlyEmi,
      status: "UPCOMING",
    });
  }

  return schedule;
}
