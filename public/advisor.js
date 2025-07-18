// advisor.js - Business Advisor Module

export const advisorServices = {
    // Advisory Service Categories
    serviceCategories: {
        businessStrategy: {
            name: "Business Strategy",
            icon: "🎯",
            description: "Strategic planning, business model development, and growth strategies",
            services: [
                "Business Model Canvas Development",
                "Market Entry Strategy",
                "Competitive Analysis",
                "Growth Strategy Planning",
                "Pivot Strategy Development",
                "Exit Strategy Planning"
            ],
            hourlyRate: { min: 2000, max: 5000, typical: 3500 },
            expertise: ["Strategy", "Business Development", "Market Analysis"]
        },
        financialAdvisory: {
            name: "Financial Advisory",
            icon: "💰",
            description: "Financial planning, fundraising, and investment strategy",
            services: [
                "Financial Modeling",
                "Fundraising Strategy",
                "Investment Pitch Development",
                "Valuation Analysis",
                "Cash Flow Management",
                "Investor Relations"
            ],
            hourlyRate: { min: 2500, max: 6000, typical: 4000 },
            expertise: ["Finance", "Fundraising", "Investment"]
        },
        technologyConsulting: {
            name: "Technology Consulting",
            icon: "💻",
            description: "Technology strategy, architecture, and digital transformation",
            services: [
                "Technology Stack Selection",
                "System Architecture Design",
                "Digital Transformation",
                "Product Development Strategy",
                "Technical Due Diligence",
                "Cybersecurity Assessment"
            ],
            hourlyRate: { min: 3000, max: 7000, typical: 4500 },
            expertise: ["Technology", "Software Development", "Architecture"]
        },
        marketingStrategy: {
            name: "Marketing Strategy",
            icon: "📈",
            description: "Marketing strategy, brand development, and customer acquisition",
            services: [
                "Brand Strategy Development",
                "Digital Marketing Strategy",
                "Customer Acquisition Planning",
                "Market Research",
                "Go-to-Market Strategy",
                "Marketing Analytics Setup"
            ],
            hourlyRate: { min: 1500, max: 4000, typical: 2500 },
            expertise: ["Marketing", "Branding", "Customer Acquisition"]
        },
        operationsOptimization: {
            name: "Operations Optimization",
            icon: "⚙️",
            description: "Process optimization, supply chain, and operational efficiency",
            services: [
                "Process Optimization",
                "Supply Chain Analysis",
                "Quality Management Systems",
                "Operational Efficiency Audit",
                "Scaling Operations",
                "Cost Reduction Strategies"
            ],
            hourlyRate: { min: 2000, max: 4500, typical: 3000 },
            expertise: ["Operations", "Supply Chain", "Process Improvement"]
        },
        legalCompliance: {
            name: "Legal & Compliance",
            icon: "⚖️",
            description: "Legal structure, compliance, and regulatory guidance",
            services: [
                "Legal Structure Setup",
                "Regulatory Compliance",
                "Intellectual Property Strategy",
                "Contract Review & Negotiation",
                "Employment Law Guidance",
                "Data Protection Compliance"
            ],
            hourlyRate: { min: 3000, max: 8000, typical: 5000 },
            expertise: ["Legal", "Compliance", "Regulatory"]
        }
    },

    // Advisor Expertise Levels
    expertiseLevels: {
        junior: { name: "Junior Advisor", experience: "2-5 years", multiplier: 0.7 },
        senior: { name: "Senior Advisor", experience: "5-10 years", multiplier: 1.0 },
        expert: { name: "Expert Advisor", experience: "10+ years", multiplier: 1.5 },
        partner: { name: "Partner Level", experience: "15+ years", multiplier: 2.0 }
    },

    // Consultation Types
    consultationTypes: {
        oneTime: {
            name: "One-Time Consultation",
            description: "Single session for specific advice",
            duration: "1-2 hours",
            pricing: "Hourly rate"
        },
        ongoing: {
            name: "Ongoing Advisory",
            description: "Regular sessions for continuous guidance",
            duration: "Monthly/Quarterly",
            pricing: "Retainer basis"
        },
        project: {
            name: "Project-Based",
            description: "Complete project delivery",
            duration: "Project timeline",
            pricing: "Fixed project fee"
        },
        emergency: {
            name: "Emergency Consultation",
            description: "Urgent advice for critical situations",
            duration: "As needed",
            pricing: "Premium hourly rate"
        }
    }
};

// Advisor Management Functions
export function createAdvisorProfile(advisorData) {
    return {
        id: generateId(),
        name: advisorData.name,
        email: advisorData.email,
        phone: advisorData.phone,
        expertise: advisorData.expertise,
        experience: advisorData.experience,
        level: advisorData.level,
        services: advisorData.services,
        hourlyRate: calculateHourlyRate(advisorData.level, advisorData.services),
        availability: advisorData.availability,
        rating: 0,
        reviews: [],
        completedSessions: 0,
        specializations: advisorData.specializations,
        certifications: advisorData.certifications,
        bio: advisorData.bio,
        profileImage: advisorData.profileImage,
        createdAt: new Date().toISOString(),
        status: 'active'
    };
}

export function matchAdvisorToClient(clientNeeds) {
    const { serviceCategory, budget, urgency, expertise } = clientNeeds;
    
    // This would typically query a database of advisors
    // For now, we'll return a mock matching algorithm
    const matchedAdvisors = [];
    
    // Filter by service category
    const serviceData = advisorServices.serviceCategories[serviceCategory];
    if (!serviceData) return [];
    
    // Calculate budget range
    const budgetRange = {
        min: serviceData.hourlyRate.min * 0.8,
        max: serviceData.hourlyRate.max * 1.2
    };
    
    // Mock advisor matching logic
    const mockAdvisors = generateMockAdvisors(serviceCategory);
    
    mockAdvisors.forEach(advisor => {
        let matchScore = 0;
        
        // Service category match
        if (advisor.services.includes(serviceCategory)) {
            matchScore += 40;
        }
        
        // Budget compatibility
        if (advisor.hourlyRate >= budgetRange.min && advisor.hourlyRate <= budgetRange.max) {
            matchScore += 30;
        }
        
        // Expertise match
        if (advisor.expertise.some(exp => expertise.includes(exp))) {
            matchScore += 20;
        }
        
        // Availability for urgency
        if (urgency === 'high' && advisor.availability.includes('immediate')) {
            matchScore += 10;
        }
        
        if (matchScore >= 50) {
            matchedAdvisors.push({
                ...advisor,
                matchScore,
                estimatedCost: calculateEstimatedCost(advisor.hourlyRate, clientNeeds.sessionType)
            });
        }
    });
    
    return matchedAdvisors.sort((a, b) => b.matchScore - a.matchScore);
}

export function bookConsultation(bookingData) {
    const {
        advisorId,
        clientId,
        serviceCategory,
        consultationType,
        scheduledDate,
        duration,
        description,
        budget
    } = bookingData;
    
    const consultation = {
        id: generateId(),
        advisorId,
        clientId,
        serviceCategory,
        consultationType,
        scheduledDate,
        duration,
        description,
        budget,
        status: 'pending',
        createdAt: new Date().toISOString(),
        paymentStatus: 'pending',
        meetingLink: null,
        notes: [],
        followUpActions: []
    };
    
    return consultation;
}

export function generateConsultationReport(consultationData) {
    const { advisor, client, session, recommendations } = consultationData;
    
    return {
        consultationId: consultationData.id,
        date: consultationData.scheduledDate,
        advisor: {
            name: advisor.name,
            expertise: advisor.expertise,
            rating: advisor.rating
        },
        client: {
            name: client.name,
            businessType: client.businessType,
            challenge: client.challenge
        },
        session: {
            duration: session.duration,
            topics: session.topics,
            keyInsights: session.keyInsights
        },
        recommendations: recommendations.map(rec => ({
            category: rec.category,
            action: rec.action,
            priority: rec.priority,
            timeline: rec.timeline,
            estimatedCost: rec.estimatedCost
        })),
        nextSteps: generateNextSteps(recommendations),
        followUpDate: calculateFollowUpDate(consultationData.scheduledDate)
    };
}

// Advisory Service Functions
export function createAdvisoryPost(advisorData) {
    return {
        id: generateId(),
        advisorId: advisorData.advisorId,
        serviceCategory: advisorData.serviceCategory,
        title: advisorData.title,
        description: advisorData.description,
        services: advisorData.services,
        hourlyRate: advisorData.hourlyRate,
        availability: advisorData.availability,
        expertise: advisorData.expertise,
        specializations: advisorData.specializations,
        consultationTypes: advisorData.consultationTypes,
        status: 'active',
        createdAt: new Date().toISOString(),
        views: 0,
        inquiries: 0
    };
}

export function searchAdvisoryServices(searchCriteria) {
    const { category, budget, location, expertise, availability } = searchCriteria;
    
    // Mock search implementation
    const allServices = Object.entries(advisorServices.serviceCategories)
        .filter(([key, service]) => {
            if (category && key !== category) return false;
            if (budget && service.hourlyRate.typical > budget) return false;
            return true;
        })
        .map(([key, service]) => ({
            category: key,
            ...service,
            availableAdvisors: generateMockAdvisors(key).length
        }));
    
    return allServices;
}

// Helper Functions
function generateId() {
    return 'adv_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

function calculateHourlyRate(level, services) {
    const levelMultiplier = advisorServices.expertiseLevels[level]?.multiplier || 1.0;
    const baseRate = 3000; // Base hourly rate
    return Math.round(baseRate * levelMultiplier);
}

function calculateEstimatedCost(hourlyRate, sessionType) {
    const durationMultipliers = {
        oneTime: 1,
        ongoing: 4, // Monthly retainer
        project: 20, // Project-based
        emergency: 1.5 // Premium rate
    };
    
    return hourlyRate * (durationMultipliers[sessionType] || 1);
}

function generateMockAdvisors(serviceCategory) {
    const names = [
        "Dr. Sarah Johnson", "Rajesh Kumar", "Maria Rodriguez", "David Chen",
        "Priya Patel", "Michael O'Connor", "Lisa Thompson", "Ahmed Hassan"
    ];
    
    const levels = Object.keys(advisorServices.expertiseLevels);
    const expertise = advisorServices.serviceCategories[serviceCategory]?.expertise || [];
    
    return names.slice(0, 3).map((name, index) => ({
        id: generateId(),
        name,
        expertise: expertise.slice(0, 2),
        level: levels[index % levels.length],
        hourlyRate: calculateHourlyRate(levels[index % levels.length], [serviceCategory]),
        rating: 4.5 + (Math.random() * 0.5),
        completedSessions: 50 + Math.floor(Math.random() * 200),
        availability: ['immediate', 'this_week', 'next_week'],
        services: [serviceCategory],
        specializations: expertise.slice(0, 2)
    }));
}

function generateNextSteps(recommendations) {
    return recommendations
        .filter(rec => rec.priority === 'high')
        .map(rec => ({
            action: rec.action,
            timeline: rec.timeline,
            responsible: 'Client',
            status: 'pending'
        }));
}

function calculateFollowUpDate(scheduledDate) {
    const date = new Date(scheduledDate);
    date.setDate(date.getDate() + 7); // Follow up in 1 week
    return date.toISOString();
}

// Analytics Functions
export function generateAdvisorAnalytics(advisorId, timeRange) {
    // Mock analytics data
    return {
        totalSessions: 45,
        totalRevenue: 180000,
        averageRating: 4.7,
        clientSatisfaction: 92,
        repeatClients: 15,
        sessionTypes: {
            oneTime: 20,
            ongoing: 15,
            project: 8,
            emergency: 2
        },
        topServices: [
            { service: "Business Strategy", sessions: 18 },
            { service: "Financial Advisory", sessions: 12 },
            { service: "Technology Consulting", sessions: 10 }
        ],
        monthlyTrends: [
            { month: "Jan", sessions: 8, revenue: 32000 },
            { month: "Feb", sessions: 12, revenue: 48000 },
            { month: "Mar", sessions: 10, revenue: 40000 },
            { month: "Apr", sessions: 15, revenue: 60000 }
        ]
    };
} 