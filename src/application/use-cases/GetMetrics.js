/**
 * Use Case: GetMetrics
 * Fetches compiled system aggregation statistics for the dashboard view.
 */
export class GetMetrics {
  constructor(employeeRepository) {
    this.employeeRepository = employeeRepository;
  }

  /**
   * Execute use case logic
   * @returns {Promise<Object>} Aggregated metrics object
   */
  async execute() {
    const rawMetrics = await this.employeeRepository.getFinancialMetrics();
    
    // We can enrich the metrics here, for example:
    // Adding aggregate global metrics by converting home currencies to a base reference (e.g. USD)
    // using baseline fixed exchange rates:
    // 1 USD = 83 INR, 1 GBP = 1.25 USD, 1 EUR = 1.08 USD
    const exchangeRatesToUsd = {
      USD: 1.0,
      INR: 1 / 83.0,
      GBP: 1.25,
      EUR: 1.08,
    };

    let totalGlobalGrossRunRateUSD = 0;

    const enrichedRunRates = rawMetrics.runRates.map(item => {
      const rate = exchangeRatesToUsd[item.currency] || 1.0;
      
      // Calculate real value (since they are stored as lowest denominator)
      const divider = 100; // base (cents, pence, paise)
      const baseRealVal = item.totalBase / divider;
      const bonusRealVal = item.totalBonus / divider;
      const allowancesRealVal = item.totalAllowances / divider;
      const deductionsRealVal = item.totalDeductions / divider;
      const grossSpendRealVal = item.totalGrossSpend / divider;

      // Add to running USD estimation
      totalGlobalGrossRunRateUSD += grossSpendRealVal * rate;

      return {
        ...item,
        totalBaseReal: baseRealVal,
        totalBonusReal: bonusRealVal,
        totalAllowancesReal: allowancesRealVal,
        totalDeductionsReal: deductionsRealVal,
        totalGrossSpendReal: grossSpendRealVal,
        usdEquivalentGrossSpend: grossSpendRealVal * rate,
      };
    });

    // Format headcount ratios
    const totalHeadcount = rawMetrics.headcountByCountry.reduce((acc, curr) => acc + curr.count, 0);

    const enrichedHeadcounts = rawMetrics.headcountByCountry.map(item => ({
      ...item,
      percentage: totalHeadcount > 0 ? Math.round((item.count / totalHeadcount) * 100) : 0,
    }));

    return {
      headcount: {
        total: totalHeadcount,
        distribution: enrichedHeadcounts,
      },
      runRates: {
        totalUSD: Math.round(totalGlobalGrossRunRateUSD),
        breakdown: enrichedRunRates,
      },
      departmentAllocations: rawMetrics.departmentAllocations.map(dept => {
        // Average values stored in lowest common currency format can be divided by 100
        // for ease of representation in charts (though they represent averages, so currencies are mixed,
        // we can flag them or display them grouped nicely).
        return {
          ...dept,
          avgBaseSalaryReal: Math.round(dept.avgBaseSalary / 100),
          avgBonusReal: Math.round(dept.avgBonus / 100),
          avgAllowancesReal: Math.round(dept.avgAllowances / 100),
          avgDeductionsReal: Math.round(dept.avgDeductions / 100),
          totalSpendReal: Math.round(dept.totalSpend / 100),
        };
      }),
    };
  }
}
export default GetMetrics;
