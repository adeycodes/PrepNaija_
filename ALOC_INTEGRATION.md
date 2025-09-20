# ALOC Questions API Integration

This document explains how PrepNaija integrates with ALOC Questions API to provide authentic Nigerian past questions from 2015-2025.

## 🎯 **Why ALOC Questions API?**

ALOC provides **FREE** access to over **6,000+ authentic Nigerian past questions** including:
- ✅ JAMB UTME questions (2015-2025)
- ✅ WAEC SSCE questions (2015-2025) 
- ✅ NECO SSCE questions (2015-2025)
- ✅ All subjects: Mathematics, English, Physics, Chemistry, Biology
- ✅ Questions include detailed solutions
- ✅ Up-to-date and exam-relevant

## 🚀 **Setup Instructions**

### 1. Get ALOC Access Token
1. Visit https://questions.aloc.com.ng
2. Sign up for a free account
3. Get your Access Token from the dashboard
4. Add it to your `.env` file:

```env
# ALOC Questions API (Free 6,000+ Nigerian past questions)
ALOC_ACCESS_TOKEN=your-aloc-access-token-here
```

### 2. Integration Features

Our integration automatically:
- **Prioritizes Recent Questions**: Fetches 2020-2025 questions first
- **Comprehensive Seeding**: Seeds questions from 2015-2025 across all subjects
- **Smart Caching**: Saves questions to local database to reduce API calls
- **Fallback Strategy**: Uses local questions if ALOC API is unavailable
- **Year-based Filtering**: Ensures students get current exam patterns

## 📊 **API Endpoints (Development)**

### Test ALOC Connection
```
GET /api/aloc/test
```

### Seed Comprehensive Questions (2015-2025)
```
POST /api/aloc/seed-comprehensive
Body: { "startYear": 2015, "endYear": 2025 }
```

### Analyze Question Coverage
```
GET /api/aloc/coverage/Mathematics/JAMB?startYear=2015&endYear=2025
```

### Get Recent Questions
```
GET /api/aloc/recent/Mathematics/JAMB/20
```

## 🎯 **Smart Question Selection Strategy**

### 1. **Recent Questions First (2020-2025)**
- Prioritizes most recent exam patterns
- Ensures relevance to current syllabi
- Matches latest exam formats

### 2. **Comprehensive Coverage (2015-2025)**
- Covers 10+ years of authentic past questions
- Balanced across all subjects and exam types
- Strategic mix of difficulty levels

### 3. **Fallback Protection**
- Local question database as backup
- AI-generated questions when needed
- Never fails to provide questions

## 📈 **Seeding Strategy**

### Initial Seeding
When the app starts, it automatically:
1. **Checks existing questions** (if >100 questions exist, skip seeding)
2. **Runs comprehensive ALOC seeding** (2015-2025)
3. **Saves 5 questions per year per subject per exam type**
4. **Falls back to local questions** if ALOC fails

### Expected Results
- **Total Questions**: ~825 questions (5 × 11 years × 5 subjects × 3 exam types)
- **Coverage**: All major Nigerian exams from 2015-2025
- **Quality**: Authentic past questions with solutions

## 🔧 **Technical Implementation**

### Question Format Conversion
```typescript
// ALOC format → Our format
{
  question: "What is the speed of light?",
  option: { a: "3×10⁸ m/s", b: "3×10⁹ m/s", c: "3×10⁷ m/s", d: "3×10¹⁰ m/s" },
  answer: "a",
  solution: "Light travels at 3×10⁸ m/s in vacuum",
  examtype: "utme",
  examyear: "2023",
  subject: "physics"
}
```

### Smart Topic Detection
Our system automatically detects topics based on question content:
- **Mathematics**: Logarithms, Algebra, Geometry, etc.
- **English**: Grammar, Vocabulary, Comprehension
- **Physics**: Motion, Forces, Energy, Waves
- **Chemistry**: Organic Chemistry, Acids/Bases, Periodic Table
- **Biology**: Cell Biology, Plant/Human Biology, Genetics

### Error Handling
- **API Timeouts**: 10-second timeout with retry logic
- **Rate Limiting**: 1-2 second delays between requests
- **Graceful Degradation**: Local questions if ALOC fails
- **Duplicate Prevention**: Skips existing questions

## 📱 **User Experience Impact**

### Students Get:
1. **Authentic Questions**: Real past questions, not fake/generated ones
2. **Current Patterns**: Recent exam formats and trends
3. **Comprehensive Coverage**: 10+ years of exam history
4. **Detailed Solutions**: Step-by-step explanations
5. **Exam-Specific**: Questions filtered by JAMB/WAEC/NECO

### Platform Benefits:
1. **Credibility**: Using official past questions builds trust
2. **Accuracy**: Real exam patterns improve preparation
3. **Scalability**: 6,000+ questions vs manual creation
4. **Maintenance**: Auto-updates with new questions
5. **Cost**: FREE vs expensive question banks

## 🚨 **Important Notes**

### API Limits
- ALOC is free but respect their usage limits
- Our integration includes delays to avoid overwhelming their servers
- Questions are cached locally to reduce API calls

### Year Availability
- Not all years may have questions for all subjects
- System gracefully handles missing years
- Falls back to available years or local questions

### Nigerian Context
- All questions are Nigerian-focused
- Uses familiar names, places, and contexts
- Aligned with Nigerian educational curriculum

## 🎉 **Success Metrics**

After integration, expect:
- **Higher Question Quality**: Authentic vs generated questions
- **Better Exam Preparation**: Real past question patterns
- **Increased User Engagement**: Relevant and challenging content
- **Improved Results**: Students practice with actual exam questions
- **Platform Growth**: Word-of-mouth from effective preparation

---

**Ready to use authentic Nigerian past questions from 2015-2025!** 🚀

For support: Visit https://questions.aloc.com.ng or contact aloc.mass@gmail.com
