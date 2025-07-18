// evaluation.js - Project Evaluation Metrics System

export const evaluationMetrics = {
    // Investment Scoring Criteria
    scoringCriteria: {
        marketPotential: {
            name: "Market Potential",
            weight: 25,
            factors: {
                marketSize: { name: "Market Size", maxScore: 10 },
                growthRate: { name: "Market Growth Rate", maxScore: 8 },
                competition: { name: "Competitive Landscape", maxScore: 7 }
            }
        },
        teamCapability: {
            name: "Team Capability",
            weight: 20,
            factors: {
                experience: { name: "Team Experience", maxScore: 10 },
                skills: { name: "Required Skills", maxScore: 6 },
                commitment: { name: "Team Commitment", maxScore: 4 }
            }
        },
        businessModel: {
            name: "Business Model",
            weight: 20,
            factors: {
                revenueModel: { name: "Revenue Model", maxScore: 8 },
                scalability: { name: "Scalability", maxScore: 7 },
                profitability: { name: "Profitability Potential", maxScore: 5 }
            }
        },
        technologyInnovation: {
            name: "Technology & Innovation",
            weight: 15,
            factors: {
                innovation: { name: "Innovation Level", maxScore: 8 },
                technology: { name: "Technology Stack", maxScore: 4 },
                ip: { name: "Intellectual Property", maxScore: 3 }
            }
        },
        financialHealth: {
            name: "Financial Health",
            weight: 20,
            factors: {
                cashFlow: { name: "Cash Flow", maxScore: 8 },
                burnRate: { name: "Burn Rate", maxScore: 6 },
                funding: { name: "Funding History", maxScore: 6 }
            }
        }
    },

    // Risk Assessment Categories
    riskCategories: {
        marketRisk: {
            name: "Market Risk",
            factors: ["Market volatility", "Regulatory changes", "Economic downturn", "Competition increase"],
            weight: 30
        },
        technologyRisk: {
            name: "Technology Risk",
            factors: ["Technology obsolescence", "Development delays", "Technical challenges", "Security vulnerabilities"],
            weight: 25
        },
        teamRisk: {
            name: "Team Risk",
            factors: ["Key person dependency", "Team conflicts", "Skill gaps", "Attrition risk"],
            weight: 20
        },
        financialRisk: {
            name: "Financial Risk",
            factors: ["Cash flow issues", "Funding gaps", "Cost overruns", "Revenue delays"],
            weight: 15
        },
        operationalRisk: {
            name: "Operational Risk",
            factors: ["Supply chain issues", "Operational inefficiencies", "Scaling challenges", "Quality control"],
            weight: 10
        }
    },

    // Due Diligence Checklist
    dueDiligenceChecklist: {
        legal: {
            name: "Legal Due Diligence",
            items: [
                "Company registration and compliance",
                "Intellectual property rights",
                "Employment contracts and policies",
                "Regulatory compliance",
                "Litigation history",
                "Tax compliance"
            ]
        },
        financial: {
            name: "Financial Due Diligence",
            items: [
                "Financial statements audit",
                "Cash flow analysis",
                "Revenue recognition policies",
                "Debt and liabilities review",
                "Asset valuation",
                "Financial projections validation"
            ]
        },
        operational: {
            name: "Operational Due Diligence",
            items: [
                "Business processes review",
                "Technology infrastructure assessment",
                "Human resources evaluation",
                "Supply chain analysis",
                "Quality control systems",
                "Operational efficiency metrics"
            ]
        },
        market: {
            name: "Market Due Diligence",
            items: [
                "Market size and growth analysis",
                "Competitive landscape review",
                "Customer validation",
                "Go-to-market strategy assessment",
                "Pricing strategy analysis",
                "Market entry barriers"
            ]
        }
    }
};

// Evaluation Functions
export function calculateProjectScore(evaluationData) {
    let totalScore = 0;
    let maxPossibleScore = 0;
    const categoryScores = {};

    for (const [categoryKey, category] of Object.entries(evaluationMetrics.scoringCriteria)) {
        let categoryScore = 0;
        let categoryMaxScore = 0;

        for (const [factorKey, factor] of Object.entries(category.factors)) {
            const score = evaluationData[factorKey] || 0;
            categoryScore += score;
            categoryMaxScore += factor.maxScore;
        }

        const weightedScore = (categoryScore / categoryMaxScore) * category.weight;
        totalScore += weightedScore;
        maxPossibleScore += category.weight;
        categoryScores[categoryKey] = {
            score: categoryScore,
            maxScore: categoryMaxScore,
            weightedScore: weightedScore,
            percentage: (categoryScore / categoryMaxScore) * 100
        };
    }

    const overallScore = (totalScore / maxPossibleScore) * 100;
    
    return {
        overallScore: Math.round(overallScore * 10) / 10,
        categoryScores,
        grade: getScoreGrade(overallScore),
        recommendation: getRecommendation(overallScore)
    };
}

export function assessRisk(riskData) {
    let totalRiskScore = 0;
    let maxRiskScore = 0;
    const riskScores = {};

    for (const [categoryKey, category] of Object.entries(evaluationMetrics.riskCategories)) {
        const categoryRiskScore = riskData[categoryKey] || 0;
        const weightedRisk = (categoryRiskScore / 100) * category.weight;
        
        totalRiskScore += weightedRisk;
        maxRiskScore += category.weight;
        riskScores[categoryKey] = {
            score: categoryRiskScore,
            weightedScore: weightedRisk,
            level: getRiskLevel(categoryRiskScore)
        };
    }

    const overallRisk = (totalRiskScore / maxRiskScore) * 100;
    
    return {
        overallRisk: Math.round(overallRisk * 10) / 10,
        riskScores,
        riskLevel: getRiskLevel(overallRisk),
        riskFactors: getTopRiskFactors(riskScores)
    };
}

export function generateDueDiligenceReport(checklistData) {
    const report = {
        completed: 0,
        total: 0,
        categories: {},
        priority: [],
        timeline: estimateTimeline(checklistData)
    };

    for (const [categoryKey, category] of Object.entries(evaluationMetrics.dueDiligenceChecklist)) {
        const completedItems = checklistData[categoryKey] || [];
        const totalItems = category.items.length;
        const completionRate = (completedItems.length / totalItems) * 100;

        report.categories[categoryKey] = {
            name: category.name,
            completed: completedItems.length,
            total: totalItems,
            completionRate: Math.round(completionRate * 10) / 10,
            remaining: category.items.filter(item => !completedItems.includes(item))
        };

        report.completed += completedItems.length;
        report.total += totalItems;

        if (completionRate < 100) {
            report.priority.push({
                category: categoryKey,
                name: category.name,
                remaining: totalItems - completedItems.length
            });
        }
    }

    report.overallCompletion = Math.round((report.completed / report.total) * 100 * 10) / 10;
    report.priority.sort((a, b) => b.remaining - a.remaining);

    return report;
}

// Helper Functions
function getScoreGrade(score) {
    if (score >= 90) return { grade: 'A+', label: 'Excellent', color: '#10B981' };
    if (score >= 80) return { grade: 'A', label: 'Very Good', color: '#059669' };
    if (score >= 70) return { grade: 'B+', label: 'Good', color: '#10B981' };
    if (score >= 60) return { grade: 'B', label: 'Above Average', color: '#F59E0B' };
    if (score >= 50) return { grade: 'C+', label: 'Average', color: '#F59E0B' };
    if (score >= 40) return { grade: 'C', label: 'Below Average', color: '#EF4444' };
    if (score >= 30) return { grade: 'D', label: 'Poor', color: '#DC2626' };
    return { grade: 'F', label: 'Very Poor', color: '#991B1B' };
}

function getRecommendation(score) {
    if (score >= 80) return "Strongly Recommend Investment";
    if (score >= 70) return "Recommend Investment with Monitoring";
    if (score >= 60) return "Consider Investment with Conditions";
    if (score >= 50) return "Requires Significant Improvements";
    if (score >= 40) return "High Risk - Not Recommended";
    return "Not Suitable for Investment";
}

function getRiskLevel(riskScore) {
    if (riskScore <= 20) return { level: 'Low', color: '#10B981', description: 'Minimal risk factors' };
    if (riskScore <= 40) return { level: 'Moderate', color: '#F59E0B', description: 'Some risk factors present' };
    if (riskScore <= 60) return { level: 'High', color: '#EF4444', description: 'Significant risk factors' };
    if (riskScore <= 80) return { level: 'Very High', color: '#DC2626', description: 'Major risk factors' };
    return { level: 'Critical', color: '#991B1B', description: 'Extreme risk factors' };
}

function getTopRiskFactors(riskScores) {
    return Object.entries(riskScores)
        .sort((a, b) => b[1].score - a[1].score)
        .slice(0, 3)
        .map(([category, data]) => ({
            category: evaluationMetrics.riskCategories[category].name,
            score: data.score,
            level: data.level.level
        }));
}

function estimateTimeline(checklistData) {
    const totalRemaining = Object.values(checklistData).reduce((sum, completed) => {
        return sum + (evaluationMetrics.dueDiligenceChecklist[Object.keys(checklistData)[0]]?.items.length || 0) - completed.length;
    }, 0);
    
    const daysPerItem = 2; // Average days per checklist item
    const totalDays = totalRemaining * daysPerItem;
    
    if (totalDays <= 7) return { days: totalDays, timeline: '1 week' };
    if (totalDays <= 14) return { days: totalDays, timeline: '2 weeks' };
    if (totalDays <= 30) return { days: totalDays, timeline: '1 month' };
    return { days: totalDays, timeline: `${Math.ceil(totalDays / 30)} months` };
}

// Investment Valuation Functions
export function calculateValuation(financialData) {
    const { revenue, growthRate, profitMargin, marketMultiple } = financialData;
    
    // Simple DCF-like calculation
    const projectedRevenue = revenue * Math.pow(1 + (growthRate / 100), 3);
    const projectedProfit = projectedRevenue * (profitMargin / 100);
    const valuation = projectedProfit * marketMultiple;
    
    return {
        currentValuation: revenue * marketMultiple,
        projectedValuation: valuation,
        growthMultiple: marketMultiple,
        roi: ((valuation - revenue) / revenue) * 100
    };
}

export function generateInvestmentSummary(projectData, evaluationScore, riskAssessment) {
    return {
        projectId: projectData.id,
        projectName: projectData.title,
        category: projectData.category,
        investmentAmount: projectData.amount,
        evaluationScore: evaluationScore.overallScore,
        riskLevel: riskAssessment.riskLevel.level,
        recommendation: evaluationScore.recommendation,
        keyStrengths: getKeyStrengths(evaluationScore.categoryScores),
        keyRisks: riskAssessment.riskFactors,
        timeline: '3-6 months',
        expectedROI: calculateExpectedROI(evaluationScore.overallScore, riskAssessment.overallRisk)
    };
}

function getKeyStrengths(categoryScores) {
    return Object.entries(categoryScores)
        .filter(([_, data]) => data.percentage >= 70)
        .map(([category, data]) => ({
            category: evaluationMetrics.scoringCriteria[category].name,
            score: data.percentage
        }))
        .sort((a, b) => b.score - a.score)
        .slice(0, 3);
}

function calculateExpectedROI(evaluationScore, riskScore) {
    // Base ROI calculation based on score and risk
    const baseROI = evaluationScore * 0.5; // Higher score = higher potential ROI
    const riskAdjustment = (100 - riskScore) * 0.3; // Lower risk = higher ROI
    return Math.round((baseROI + riskAdjustment) * 10) / 10;
} 