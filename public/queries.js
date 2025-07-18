// queries.js - Query & Solution System

export const queryCategories = {
    businessStrategy: {
        name: "Business Strategy",
        icon: "🎯",
        description: "Strategic planning, business model, and growth questions",
        tags: ["strategy", "planning", "growth", "business-model"]
    },
    funding: {
        name: "Funding & Investment",
        icon: "💰",
        description: "Fundraising, investment, and financial questions",
        tags: ["funding", "investment", "fundraising", "finance"]
    },
    technology: {
        name: "Technology",
        icon: "💻",
        description: "Tech stack, development, and technical questions",
        tags: ["technology", "development", "software", "tech-stack"]
    },
    marketing: {
        name: "Marketing & Sales",
        icon: "📈",
        description: "Marketing strategy, customer acquisition, and sales questions",
        tags: ["marketing", "sales", "customer-acquisition", "branding"]
    },
    legal: {
        name: "Legal & Compliance",
        icon: "⚖️",
        description: "Legal structure, compliance, and regulatory questions",
        tags: ["legal", "compliance", "regulatory", "contracts"]
    },
    operations: {
        name: "Operations",
        icon: "⚙️",
        description: "Process optimization, supply chain, and operational questions",
        tags: ["operations", "process", "supply-chain", "efficiency"]
    },
    startup: {
        name: "Startup & Entrepreneurship",
        icon: "🚀",
        description: "Startup challenges, entrepreneurship, and early-stage questions",
        tags: ["startup", "entrepreneurship", "early-stage", "founder"]
    },
    scaling: {
        name: "Scaling & Growth",
        icon: "📊",
        description: "Scaling challenges, growth strategies, and expansion questions",
        tags: ["scaling", "growth", "expansion", "scale-up"]
    }
};

export const queryStatus = {
    open: { name: "Open", color: "#10B981", description: "Awaiting response" },
    answered: { name: "Answered", color: "#059669", description: "Has responses" },
    resolved: { name: "Resolved", color: "#3B82F6", description: "Marked as resolved" },
    closed: { name: "Closed", color: "#6B7280", description: "No longer active" }
};

export const responseTypes = {
    expert: { name: "Expert Response", badge: "👨‍💼 Expert", color: "#8B5CF6" },
    community: { name: "Community Response", badge: "👥 Community", color: "#10B981" },
    verified: { name: "Verified Response", badge: "✅ Verified", color: "#059669" }
};

// Query Management Functions
export function createQuery(queryData) {
    return {
        id: generateQueryId(),
        title: queryData.title,
        description: queryData.description,
        category: queryData.category,
        tags: queryData.tags || [],
        authorId: queryData.authorId,
        authorName: queryData.authorName,
        authorType: queryData.authorType,
        urgency: queryData.urgency || 'normal', // low, normal, high, urgent
        status: 'open',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        views: 0,
        responses: [],
        upvotes: 0,
        downvotes: 0,
        isAnonymous: queryData.isAnonymous || false,
        attachments: queryData.attachments || [],
        bounty: queryData.bounty || 0, // Optional reward for best answer
        expertRequested: queryData.expertRequested || false,
        priority: calculatePriority(queryData.urgency, queryData.expertRequested)
    };
}

export function addResponse(queryId, responseData) {
    const response = {
        id: generateResponseId(),
        queryId: queryId,
        content: responseData.content,
        authorId: responseData.authorId,
        authorName: responseData.authorName,
        authorType: responseData.authorType,
        authorExpertise: responseData.authorExpertise || [],
        responseType: responseData.responseType || 'community',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        upvotes: 0,
        downvotes: 0,
        isAccepted: false,
        isVerified: responseData.isVerified || false,
        attachments: responseData.attachments || [],
        references: responseData.references || [],
        helpfulCount: 0,
        reportCount: 0
    };
    
    return response;
}

export function searchQueries(searchCriteria) {
    const { 
        category, 
        status, 
        tags, 
        authorType, 
        urgency, 
        dateRange, 
        keyword,
        expertOnly 
    } = searchCriteria;
    
    // Mock search implementation
    const mockQueries = generateMockQueries();
    
    return mockQueries.filter(query => {
        if (category && query.category !== category) return false;
        if (status && query.status !== status) return false;
        if (tags && !tags.some(tag => query.tags.includes(tag))) return false;
        if (authorType && query.authorType !== authorType) return false;
        if (urgency && query.urgency !== urgency) return false;
        if (expertOnly && !query.expertRequested) return false;
        if (keyword && !query.title.toLowerCase().includes(keyword.toLowerCase()) && 
            !query.description.toLowerCase().includes(keyword.toLowerCase())) return false;
        
        return true;
    }).sort((a, b) => {
        // Sort by priority, then by date
        if (a.priority !== b.priority) return b.priority - a.priority;
        return new Date(b.createdAt) - new Date(a.createdAt);
    });
}

export function getQueryAnalytics(queryId) {
    // Mock analytics for a specific query
    return {
        queryId,
        totalViews: 245,
        uniqueViews: 180,
        responseRate: 85, // percentage
        averageResponseTime: "4.2 hours",
        engagementScore: 78,
        topResponders: [
            { name: "Dr. Sarah Johnson", responses: 3, helpfulVotes: 15 },
            { name: "Rajesh Kumar", responses: 2, helpfulVotes: 12 },
            { name: "Maria Rodriguez", responses: 1, helpfulVotes: 8 }
        ],
        categoryPerformance: {
            views: 245,
            responses: 6,
            resolutionRate: 100
        },
        trending: {
            isTrending: true,
            trendScore: 85,
            trendingSince: "2024-01-15T10:30:00Z"
        }
    };
}

// Knowledge Base Functions
export function createKnowledgeBaseArticle(articleData) {
    return {
        id: generateArticleId(),
        title: articleData.title,
        content: articleData.content,
        category: articleData.category,
        tags: articleData.tags || [],
        authorId: articleData.authorId,
        authorName: articleData.authorName,
        status: 'published', // draft, published, archived
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        views: 0,
        helpfulCount: 0,
        notHelpfulCount: 0,
        relatedQueries: articleData.relatedQueries || [],
        attachments: articleData.attachments || [],
        seoKeywords: articleData.seoKeywords || [],
        readingTime: calculateReadingTime(articleData.content),
        difficulty: articleData.difficulty || 'intermediate', // beginner, intermediate, advanced
        lastReviewed: new Date().toISOString()
    };
}

export function searchKnowledgeBase(searchCriteria) {
    const { keyword, category, difficulty, tags } = searchCriteria;
    
    // Mock knowledge base search
    const mockArticles = generateMockArticles();
    
    return mockArticles.filter(article => {
        if (keyword && !article.title.toLowerCase().includes(keyword.toLowerCase()) && 
            !article.content.toLowerCase().includes(keyword.toLowerCase())) return false;
        if (category && article.category !== category) return false;
        if (difficulty && article.difficulty !== difficulty) return false;
        if (tags && !tags.some(tag => article.tags.includes(tag))) return false;
        
        return true;
    }).sort((a, b) => {
        // Sort by relevance score (views + helpful votes)
        const scoreA = a.views + a.helpfulCount;
        const scoreB = b.views + b.helpfulCount;
        return scoreB - scoreA;
    });
}

// Expert Matching Functions
export function matchExpertToQuery(queryData) {
    const { category, tags, urgency, expertRequested } = queryData;
    
    if (!expertRequested) return null;
    
    // Mock expert matching
    const experts = generateMockExperts();
    
    return experts
        .filter(expert => {
            return expert.expertise.includes(category) || 
                   expert.specializations.some(spec => tags.includes(spec));
        })
        .map(expert => ({
            ...expert,
            matchScore: calculateExpertMatchScore(expert, queryData),
            availability: checkExpertAvailability(expert, urgency)
        }))
        .filter(expert => expert.matchScore >= 70)
        .sort((a, b) => b.matchScore - a.matchScore)
        .slice(0, 3);
}

export function requestExpertResponse(queryId, expertId, requestData) {
    return {
        id: generateRequestId(),
        queryId,
        expertId,
        status: 'pending', // pending, accepted, declined, completed
        requestedAt: new Date().toISOString(),
        deadline: calculateDeadline(requestData.urgency),
        message: requestData.message,
        compensation: requestData.compensation || 0,
        acceptedAt: null,
        completedAt: null,
        response: null
    };
}

// Community Features
export function upvoteQuery(queryId, userId) {
    // Mock upvote implementation
    return {
        success: true,
        newVoteCount: 15,
        userVote: 'up'
    };
}

export function downvoteQuery(queryId, userId) {
    // Mock downvote implementation
    return {
        success: true,
        newVoteCount: 2,
        userVote: 'down'
    };
}

export function markResponseAsHelpful(responseId, userId) {
    // Mock helpful vote implementation
    return {
        success: true,
        newHelpfulCount: 8
    };
}

export function acceptResponse(responseId, queryId) {
    // Mock accept response implementation
    return {
        success: true,
        responseId,
        queryId,
        status: 'accepted'
    };
}

// Helper Functions
function generateQueryId() {
    return 'qry_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

function generateResponseId() {
    return 'resp_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

function generateArticleId() {
    return 'art_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

function generateRequestId() {
    return 'req_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

function calculatePriority(urgency, expertRequested) {
    let priority = 0;
    
    switch (urgency) {
        case 'low': priority += 1; break;
        case 'normal': priority += 2; break;
        case 'high': priority += 3; break;
        case 'urgent': priority += 4; break;
    }
    
    if (expertRequested) priority += 2;
    
    return priority;
}

function calculateReadingTime(content) {
    const wordsPerMinute = 200;
    const wordCount = content.split(' ').length;
    return Math.ceil(wordCount / wordsPerMinute);
}

function calculateExpertMatchScore(expert, queryData) {
    let score = 0;
    
    // Category match
    if (expert.expertise.includes(queryData.category)) {
        score += 40;
    }
    
    // Tag match
    const tagMatches = expert.specializations.filter(spec => 
        queryData.tags.includes(spec)
    ).length;
    score += tagMatches * 15;
    
    // Experience level
    score += expert.experience * 10;
    
    // Rating
    score += expert.rating * 5;
    
    return Math.min(score, 100);
}

function checkExpertAvailability(expert, urgency) {
    const availability = {
        immediate: urgency === 'urgent' && Math.random() > 0.3,
        within24h: urgency === 'high' && Math.random() > 0.2,
        withinWeek: Math.random() > 0.1
    };
    
    return availability;
}

function calculateDeadline(urgency) {
    const now = new Date();
    switch (urgency) {
        case 'urgent': return new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours
        case 'high': return new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000); // 3 days
        case 'normal': return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 1 week
        default: return new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000); // 2 weeks
    }
}

// Mock Data Generators
function generateMockQueries() {
    const titles = [
        "How to validate a business idea before investing?",
        "Best practices for startup fundraising in 2024",
        "Technology stack recommendations for SaaS startup",
        "Legal structure for a fintech startup in India",
        "Marketing strategy for B2B SaaS product",
        "Scaling operations from 10 to 100 employees"
    ];
    
    const categories = Object.keys(queryCategories);
    
    return titles.map((title, index) => ({
        id: generateQueryId(),
        title,
        description: `Detailed question about ${title.toLowerCase()}. Looking for expert advice and best practices.`,
        category: categories[index % categories.length],
        tags: queryCategories[categories[index % categories.length]].tags.slice(0, 2),
        authorId: 'user_' + (index + 1),
        authorName: `User ${index + 1}`,
        authorType: ['entrepreneur', 'investor', 'banker'][index % 3],
        urgency: ['low', 'normal', 'high', 'urgent'][index % 4],
        status: ['open', 'answered', 'resolved'][index % 3],
        createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
        views: 50 + Math.floor(Math.random() * 200),
        responses: Math.floor(Math.random() * 5),
        upvotes: Math.floor(Math.random() * 20),
        expertRequested: Math.random() > 0.5
    }));
}

function generateMockArticles() {
    const titles = [
        "Complete Guide to Startup Fundraising",
        "Building a Scalable Technology Architecture",
        "Legal Compliance for Indian Startups",
        "Customer Acquisition Strategies for B2B",
        "Financial Modeling for Startups",
        "Team Building and Culture Development"
    ];
    
    const categories = Object.keys(queryCategories);
    
    return titles.map((title, index) => ({
        id: generateArticleId(),
        title,
        content: `Comprehensive guide covering all aspects of ${title.toLowerCase()}. This article provides detailed insights and actionable steps.`,
        category: categories[index % categories.length],
        tags: queryCategories[categories[index % categories.length]].tags.slice(0, 3),
        authorId: 'expert_' + (index + 1),
        authorName: `Expert ${index + 1}`,
        status: 'published',
        createdAt: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString(),
        views: 500 + Math.floor(Math.random() * 2000),
        helpfulCount: Math.floor(Math.random() * 50),
        difficulty: ['beginner', 'intermediate', 'advanced'][index % 3],
        readingTime: 5 + Math.floor(Math.random() * 15)
    }));
}

function generateMockExperts() {
    const names = [
        "Dr. Sarah Johnson", "Rajesh Kumar", "Maria Rodriguez", "David Chen",
        "Priya Patel", "Michael O'Connor", "Lisa Thompson", "Ahmed Hassan"
    ];
    
    const categories = Object.keys(queryCategories);
    
    return names.map((name, index) => ({
        id: 'expert_' + (index + 1),
        name,
        expertise: [categories[index % categories.length]],
        specializations: queryCategories[categories[index % categories.length]].tags.slice(0, 3),
        experience: 5 + Math.floor(Math.random() * 15),
        rating: 4.5 + Math.random() * 0.5,
        completedQueries: 20 + Math.floor(Math.random() * 80),
        responseRate: 85 + Math.floor(Math.random() * 15),
        averageResponseTime: "2.5 hours"
    }));
} 