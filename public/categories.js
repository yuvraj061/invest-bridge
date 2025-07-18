// categories.js - Enhanced Business Categories System

export const businessCategories = {
    technology: {
        name: "Technology",
        icon: "💻",
        description: "Software, hardware, and digital innovations",
        subcategories: {
            "software-development": "Software Development",
            "artificial-intelligence": "Artificial Intelligence",
            "blockchain": "Blockchain & Cryptocurrency",
            "cybersecurity": "Cybersecurity",
            "fintech": "Financial Technology",
            "ecommerce": "E-commerce & Digital Commerce",
            "mobile-apps": "Mobile Applications",
            "cloud-computing": "Cloud Computing",
            "iot": "Internet of Things (IoT)",
            "gaming": "Gaming & Entertainment"
        },
        investmentRange: {
            min: 50000,
            max: 5000000,
            typical: 500000
        }
    },
    healthcare: {
        name: "Healthcare",
        icon: "🏥",
        description: "Medical technology, pharmaceuticals, and health services",
        subcategories: {
            "medical-devices": "Medical Devices",
            "pharmaceuticals": "Pharmaceuticals",
            "telemedicine": "Telemedicine",
            "health-tech": "Health Technology",
            "biotechnology": "Biotechnology",
            "mental-health": "Mental Health Services",
            "fitness-wellness": "Fitness & Wellness",
            "medical-research": "Medical Research",
            "healthcare-services": "Healthcare Services"
        },
        investmentRange: {
            min: 100000,
            max: 10000000,
            typical: 1000000
        }
    },
    finance: {
        name: "Finance",
        icon: "💰",
        description: "Financial services, banking, and investment solutions",
        subcategories: {
            "digital-banking": "Digital Banking",
            "investment-platforms": "Investment Platforms",
            "insurance-tech": "Insurance Technology",
            "payment-solutions": "Payment Solutions",
            "lending-platforms": "Lending Platforms",
            "wealth-management": "Wealth Management",
            "cryptocurrency": "Cryptocurrency Services",
            "financial-advisory": "Financial Advisory"
        },
        investmentRange: {
            min: 200000,
            max: 8000000,
            typical: 800000
        }
    },
    education: {
        name: "Education",
        icon: "🎓",
        description: "EdTech, online learning, and educational services",
        subcategories: {
            "online-learning": "Online Learning Platforms",
            "skill-development": "Skill Development",
            "corporate-training": "Corporate Training",
            "language-learning": "Language Learning",
            "stem-education": "STEM Education",
            "virtual-reality": "Virtual Reality in Education",
            "educational-content": "Educational Content",
            "student-services": "Student Services"
        },
        investmentRange: {
            min: 30000,
            max: 2000000,
            typical: 300000
        }
    },
    retail: {
        name: "Retail & E-commerce",
        icon: "🛍️",
        description: "Retail technology, marketplaces, and consumer goods",
        subcategories: {
            "online-marketplace": "Online Marketplace",
            "retail-tech": "Retail Technology",
            "fashion-tech": "Fashion Technology",
            "food-delivery": "Food Delivery",
            "supply-chain": "Supply Chain Solutions",
            "inventory-management": "Inventory Management",
            "customer-analytics": "Customer Analytics",
            "loyalty-programs": "Loyalty Programs"
        },
        investmentRange: {
            min: 50000,
            max: 3000000,
            typical: 400000
        }
    },
    manufacturing: {
        name: "Manufacturing",
        icon: "🏭",
        description: "Industrial manufacturing, automation, and production",
        subcategories: {
            "automation": "Industrial Automation",
            "3d-printing": "3D Printing",
            "smart-manufacturing": "Smart Manufacturing",
            "quality-control": "Quality Control Systems",
            "supply-chain-manufacturing": "Supply Chain Management",
            "green-manufacturing": "Green Manufacturing",
            "textile-manufacturing": "Textile Manufacturing",
            "automotive-parts": "Automotive Parts"
        },
        investmentRange: {
            min: 200000,
            max: 15000000,
            typical: 2000000
        }
    },
    renewable_energy: {
        name: "Renewable Energy",
        icon: "☀️",
        description: "Solar, wind, and sustainable energy solutions",
        subcategories: {
            "solar-energy": "Solar Energy",
            "wind-energy": "Wind Energy",
            "energy-storage": "Energy Storage",
            "smart-grid": "Smart Grid Technology",
            "energy-efficiency": "Energy Efficiency",
            "biofuels": "Biofuels",
            "hydrogen-energy": "Hydrogen Energy",
            "energy-trading": "Energy Trading Platforms"
        },
        investmentRange: {
            min: 500000,
            max: 20000000,
            typical: 3000000
        }
    },
    agriculture: {
        name: "Agriculture & Food",
        icon: "🌾",
        description: "AgTech, food processing, and agricultural innovations",
        subcategories: {
            "precision-agriculture": "Precision Agriculture",
            "organic-farming": "Organic Farming",
            "food-processing": "Food Processing",
            "agricultural-tech": "Agricultural Technology",
            "livestock-management": "Livestock Management",
            "crop-monitoring": "Crop Monitoring",
            "food-safety": "Food Safety Solutions",
            "vertical-farming": "Vertical Farming"
        },
        investmentRange: {
            min: 100000,
            max: 5000000,
            typical: 600000
        }
    },
    transportation: {
        name: "Transportation & Logistics",
        icon: "🚚",
        description: "Mobility solutions, logistics, and transportation tech",
        subcategories: {
            "electric-vehicles": "Electric Vehicles",
            "logistics-tech": "Logistics Technology",
            "ride-sharing": "Ride Sharing",
            "fleet-management": "Fleet Management",
            "last-mile-delivery": "Last Mile Delivery",
            "public-transport": "Public Transportation",
            "autonomous-vehicles": "Autonomous Vehicles",
            "supply-chain-logistics": "Supply Chain Logistics"
        },
        investmentRange: {
            min: 200000,
            max: 10000000,
            typical: 1500000
        }
    },
    real_estate: {
        name: "Real Estate",
        icon: "🏢",
        description: "Property technology, construction, and real estate services",
        subcategories: {
            "proptech": "Property Technology",
            "construction-tech": "Construction Technology",
            "real-estate-marketplace": "Real Estate Marketplace",
            "property-management": "Property Management",
            "smart-buildings": "Smart Buildings",
            "construction-materials": "Construction Materials",
            "real-estate-analytics": "Real Estate Analytics",
            "co-working": "Co-working Spaces"
        },
        investmentRange: {
            min: 300000,
            max: 20000000,
            typical: 2500000
        }
    },
    entertainment: {
        name: "Entertainment & Media",
        icon: "🎬",
        description: "Content creation, streaming, and entertainment platforms",
        subcategories: {
            "streaming-platforms": "Streaming Platforms",
            "content-creation": "Content Creation",
            "gaming": "Gaming & Esports",
            "virtual-reality-entertainment": "Virtual Reality Entertainment",
            "music-tech": "Music Technology",
            "social-media": "Social Media Platforms",
            "podcasting": "Podcasting",
            "live-events": "Live Events Technology"
        },
        investmentRange: {
            min: 50000,
            max: 5000000,
            typical: 400000
        }
    },
    other: {
        name: "Other",
        icon: "🔧",
        description: "Miscellaneous business opportunities",
        subcategories: {
            "consulting": "Consulting Services",
            "marketing": "Marketing & Advertising",
            "legal-tech": "Legal Technology",
            "hr-tech": "HR Technology",
            "environmental": "Environmental Services",
            "tourism": "Tourism & Hospitality",
            "fashion": "Fashion & Lifestyle",
            "sports": "Sports Technology"
        },
        investmentRange: {
            min: 25000,
            max: 2000000,
            typical: 200000
        }
    }
};

// Helper functions
export function getCategoryInfo(categoryKey) {
    return businessCategories[categoryKey] || null;
}

export function getSubcategoryInfo(categoryKey, subcategoryKey) {
    const category = businessCategories[categoryKey];
    if (!category || !category.subcategories[subcategoryKey]) {
        return null;
    }
    return {
        name: category.subcategories[subcategoryKey],
        category: category.name,
        categoryIcon: category.icon,
        investmentRange: category.investmentRange
    };
}

export function getAllCategories() {
    return Object.keys(businessCategories).map(key => ({
        key,
        ...businessCategories[key]
    }));
}

export function getCategorySuggestions(userType, amount) {
    const suggestions = [];
    
    for (const [key, category] of Object.entries(businessCategories)) {
        if (amount >= category.investmentRange.min && amount <= category.investmentRange.max) {
            suggestions.push({
                key,
                name: category.name,
                icon: category.icon,
                matchScore: calculateMatchScore(amount, category.investmentRange)
            });
        }
    }
    
    return suggestions.sort((a, b) => b.matchScore - a.matchScore);
}

function calculateMatchScore(amount, range) {
    const typical = range.typical;
    const deviation = Math.abs(amount - typical) / typical;
    return Math.max(0, 100 - (deviation * 100));
}

export function formatInvestmentRange(range) {
    if (range.min >= 1000000) {
        return `₹${(range.min / 1000000).toFixed(1)}M - ₹${(range.max / 1000000).toFixed(1)}M`;
    } else if (range.min >= 1000) {
        return `₹${(range.min / 1000).toFixed(0)}K - ₹${(range.max / 1000).toFixed(0)}K`;
    }
    return `₹${range.min.toLocaleString()} - ₹${range.max.toLocaleString()}`;
} 