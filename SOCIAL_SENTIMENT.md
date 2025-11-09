# ESG Social Sentiment Analysis

## Overview

The Social Sentiment Analysis feature extracts employee satisfaction and social impact metrics from LinkedIn and Glassdoor company pages. This provides crucial ESG (Environmental, Social, Governance) social pillar data by analyzing employee reviews, ratings, and company culture indicators.

## Purpose

This feature helps organizations:
- **Measure Social Impact** - Track employee satisfaction and workplace culture
- **ESG Reporting** - Provide data-driven social metrics for CSRD/ESRS compliance
- **Identify Improvement Areas** - Discover strengths and weaknesses in social performance
- **Benchmark Performance** - Compare against industry standards
- **Support Due Diligence** - Assess social risks for M&A and partnerships

## Key Features

### Data Sources

1. **LinkedIn Company Pages**
   - Employee reviews and ratings
   - Company culture indicators
   - Diversity and inclusion metrics
   - Work-life balance feedback

2. **Glassdoor Company Reviews**
   - Detailed employee ratings (1-5 scale)
   - Work-life balance ratings
   - Culture & values ratings
   - Diversity & inclusion ratings
   - Career opportunities ratings
   - Compensation & benefits ratings
   - Senior management ratings
   - Pros and cons from reviews
   - Sample employee reviews

### Analysis Capabilities

#### Sentiment Scoring
- **Overall Sentiment** - Aggregate sentiment score (-1 to 1 scale)
- **Rating Analysis** - Analysis of ratings across dimensions
- **Theme Extraction** - Identification of positive and negative themes
- **Trend Detection** - Changes in sentiment over time

#### ESG Indicators
- **Diversity & Inclusion** - Representation and equity metrics
- **Employee Wellbeing** - Work-life balance and mental health
- **Social Impact** - Community engagement and CSR
- **Governance** - Management transparency and communication

#### AI-Powered Insights
- **Automated Summaries** - AI-generated overview of key findings
- **Recommendations** - Actionable suggestions for improvement
- **Risk Identification** - Flagging of potential social risks
- **Opportunity Discovery** - Identifying areas of strength

## How It Works

### Data Collection

1. **Web Scraping**
   - Uses Firecrawl API for ethical web scraping
   - Extracts public company information
   - Respects robots.txt and rate limits
   - Falls back to mock data for demo

2. **Data Processing**
   - Cleans and structures scraped data
   - Extracts key metrics and ratings
   - Identifies review samples
   - Timestamps data freshness

### AI Analysis

Uses Lovable AI (Google Gemini 2.5 Flash) to:
- Analyze sentiment across thousands of reviews
- Extract ESG-relevant themes
- Identify patterns in employee feedback
- Generate actionable insights
- Provide comparative benchmarks

### Data Storage

All analysis results stored in `social_sentiment_data` table:
```sql
- overall_rating (1-5 scale)
- sentiment_score (-1 to 1)
- Individual dimension ratings
- Positive and negative themes
- ESG indicators
- AI summary and recommendations
- Sample reviews
```

## Usage

### Running an Analysis

1. **Navigate** to Social Sentiment page (`/social-sentiment`)
2. **Click** "New Analysis" button
3. **Enter:**
   - Company Name (required)
   - LinkedIn URL (optional)
   - Glassdoor URL (optional)
4. **Click** "Run Analysis"
5. **Wait** for AI analysis to complete (~30-60 seconds)

### Viewing Results

Results display in four tabs:

#### Overview Tab
- Total reviews count
- Overall sentiment score
- Average rating
- AI-generated summary
- ESG recommendations
- Key ESG indicators

#### Ratings Tab
- Work-life balance rating
- Culture & values rating
- Diversity & inclusion rating
- Career opportunities rating
- Compensation & benefits rating
- Senior management rating

Progress bars show each metric visually.

#### Themes Tab
- **Positive Themes** - What employees praise (green badges)
- **Negative Themes** - Areas needing improvement (red badges)

Common themes:
- Positive: "inclusive culture", "career growth", "good benefits"
- Negative: "work-life balance", "bureaucracy", "limited flexibility"

#### Reviews Tab
- Sample employee reviews
- Individual ratings
- Pros and cons
- Review dates

### Integration with ESG Reporting

Social sentiment data automatically enriches ESG reports:

1. **S-Score Contribution** - Feeds into Social pillar of ESG score
2. **CSRD Compliance** - Provides required employee data for ESRS S1
3. **Materiality Assessment** - Identifies key social issues
4. **Stakeholder Engagement** - Shows employee perspectives

## ESG Metrics Extracted

### Core Metrics

| Metric | Source | ESG Relevance |
|--------|--------|---------------|
| Overall Rating | Both | General employee satisfaction |
| Sentiment Score | AI Analysis | Aggregate employee mood |
| Work-Life Balance | Both | Employee wellbeing (ESRS S1) |
| Diversity & Inclusion | Both | Equality and representation (ESRS S1) |
| Culture & Values | Both | Corporate culture (ESRS S1) |
| Career Opportunities | Both | Employee development (ESRS S1) |
| Compensation | Glassdoor | Fair wages (ESRS S1) |
| Management Quality | Glassdoor | Governance quality (ESRS G1) |

### ESG Indicators

**Diversity Indicators:**
- Representation across demographics
- Inclusive culture mentions
- Equity in opportunities
- D&I program effectiveness

**Wellbeing Indicators:**
- Work-life balance quality
- Mental health support
- Flexible work options
- Employee benefits

**Social Impact Indicators:**
- Community engagement
- CSR program mentions
- Volunteer opportunities
- Social purpose alignment

**Governance Indicators:**
- Management transparency
- Communication quality
- Decision-making processes
- Employee voice

## Configuration

### Environment Variables

**Required for Production:**
```bash
FIRECRAWL_API_KEY=fc-... # For web scraping
LOVABLE_API_KEY=... # Auto-provided by Lovable Cloud
```

**Optional:**
```bash
OPENAI_API_KEY=... # Alternative to Lovable AI
```

### Demo Mode

Without Firecrawl API key, the system uses realistic mock data:
- LinkedIn: ~150 reviews, 4.2/5 rating
- Glassdoor: ~425 reviews, 3.9/5 rating
- Includes all metrics and sample reviews
- Demonstrates full feature capabilities

## API Reference

### Endpoint

```
POST /functions/v1/social-sentiment-analysis
```

### Request Body

```json
{
  "company_name": "Acme Corporation",
  "linkedin_url": "https://www.linkedin.com/company/acme",
  "glassdoor_url": "https://www.glassdoor.com/Overview/Working-at-Acme",
  "organization_id": "uuid"
}
```

### Response

```json
{
  "success": true,
  "results": [
    { "source": "linkedin", "success": true },
    { "source": "glassdoor", "success": true }
  ],
  "message": "Social sentiment analysis completed"
}
```

### Database Query

```typescript
// Fetch sentiment data
const { data } = await supabase
  .from('social_sentiment_data')
  .select('*')
  .eq('company_name', 'Acme Corporation')
  .order('analyzed_at', { ascending: false });
```

## Best Practices

### Data Collection

1. **Use Official URLs** - Link to company's official profiles
2. **Regular Updates** - Re-analyze quarterly or semi-annually
3. **Multiple Sources** - Combine LinkedIn and Glassdoor for complete picture
4. **Verify Data** - Cross-reference with internal HR metrics

### Analysis Interpretation

1. **Context Matters** - Consider industry, size, and location
2. **Trends Over Time** - Track changes, not just snapshots
3. **Qualitative + Quantitative** - Combine ratings with themes
4. **Action Orientation** - Use insights to drive improvements

### ESG Reporting

1. **Document Methodology** - Explain data sources and analysis
2. **Show Improvements** - Track progress on identified issues
3. **Be Transparent** - Acknowledge weaknesses and plans
4. **Stakeholder Communication** - Share findings with employees

## Compliance Mapping

### CSRD/ESRS Standards

**ESRS S1 (Own Workforce):**
- S1-1: Employment practices → Work-life balance ratings
- S1-5: Adequate wages → Compensation ratings
- S1-8: Diversity metrics → D&I ratings
- S1-9: Health & safety → Employee wellbeing indicators

**ESRS G1 (Governance):**
- G1-1: Corporate culture → Culture & values ratings
- G1-3: Management quality → Senior management ratings

### GRI Standards

- **GRI 401**: Employment → Career opportunities
- **GRI 405**: Diversity → D&I metrics
- **GRI 406**: Non-discrimination → Inclusive culture themes

## Limitations

### Data Availability
- Limited to public company pages
- Review counts vary by company
- Not all companies have Glassdoor profiles
- LinkedIn reviews may be limited

### Sampling Bias
- Reviews may not represent all employees
- Negative experiences may be over-reported
- Recent hires may dominate feedback
- Remote vs. office workers may differ

### Temporal Factors
- Reviews reflect historical experiences
- Culture changes may not be captured
- Seasonal variations in sentiment
- Impact of recent events (layoffs, etc.)

### Legal Considerations
- Web scraping must respect ToS
- Data privacy regulations apply
- Attribution requirements
- Fair use considerations

## Troubleshooting

### No Data Retrieved

**Issue:** Analysis completes but shows no data

**Solutions:**
1. Verify URLs are correct and public
2. Check if Firecrawl API key is set
3. Confirm company has reviews on platform
4. Review error messages in function logs

### Low Quality Analysis

**Issue:** AI summary is generic or inaccurate

**Solutions:**
1. Ensure sufficient review data exists
2. Verify scraped content quality
3. Check Lovable AI credits available
4. Consider using more specific URLs

### Rate Limiting

**Issue:** Analysis fails with rate limit errors

**Solutions:**
1. Space out analysis requests (1-2 per minute)
2. Implement request queuing
3. Monitor Firecrawl API limits
4. Use caching for repeat analyses

## Cost Considerations

### API Costs

- **Firecrawl**: ~$0.10-0.50 per analysis (web scraping)
- **Lovable AI**: ~$0.05-0.15 per analysis (AI processing)
- **Total**: ~$0.15-0.65 per company analyzed

### Optimization Tips

1. **Batch Analyses** - Analyze multiple companies less frequently
2. **Cache Results** - Reuse recent analyses
3. **Strategic Selection** - Focus on key partners/clients
4. **Mock Data** - Use for testing/demos

## Future Enhancements

### Planned Features

1. **Historical Tracking**
   - Trend analysis over time
   - Sentiment change detection
   - Benchmark evolution

2. **Competitive Analysis**
   - Industry peer comparison
   - Ranking and percentiles
   - Best practice identification

3. **Automated Alerts**
   - Notify on sentiment drops
   - Flag emerging issues
   - Highlight improvements

4. **Enhanced Sources**
   - Indeed reviews
   - Blind (tech companies)
   - Social media sentiment
   - News mentions

5. **Deeper Analysis**
   - Department-level sentiment
   - Role-based analysis
   - Geographic variations
   - Temporal patterns

6. **Action Planning**
   - Auto-generate improvement plans
   - Track remediation progress
   - Measure intervention impact
   - ROI calculation

## Use Cases

### M&A Due Diligence
Assess target company's:
- Employee satisfaction
- Cultural compatibility
- Social risks
- Integration challenges

### Supply Chain ESG
Evaluate suppliers on:
- Labor practices
- Employee treatment
- Social responsibility
- Governance quality

### Investor Relations
Demonstrate to investors:
- Strong ESG performance
- Employee satisfaction
- Social impact
- Continuous improvement

### Sustainability Reporting
Support CSRD compliance with:
- Required social metrics
- Stakeholder perspectives
- Material issues
- Progress tracking

### HR Strategy
Inform HR initiatives:
- Retention programs
- Benefits improvements
- Culture enhancements
- Leadership development

## Support

For issues or questions:
1. Check function logs in Lovable Cloud dashboard
2. Review error messages in UI
3. Verify API keys are configured
4. Test with known company URLs
5. Contact support with connector ID and error details

## Example Output

### LinkedIn Analysis Summary
```
Acme Corporation demonstrates strong ESG social performance on LinkedIn 
with particularly positive employee sentiment around culture, diversity, 
and career development. The company's commitment to inclusion and employee 
wellbeing is evident in reviews.

Key Strengths:
- Inclusive culture and active D&I programs
- Strong career development opportunities  
- Flexible work arrangements
- Supportive management

Areas for Improvement:
- Work can be demanding and fast-paced
- Some feedback on work-life balance
- Communication could be enhanced

ESG Recommendations:
Continue building on diversity strengths. Consider expanding remote work 
options to further improve work-life balance scores. Maintain focus on 
career development programs as a key differentiator.
```

### Glassdoor Analysis Summary
```
Acme Corporation's Glassdoor profile reveals mixed ESG social performance. 
Strengths include competitive compensation and benefits, plus learning 
opportunities. Key areas for improvement include work-life balance, 
diversity in leadership, and management communication.

Priority ESG Actions:
1. Implement flexible work policies
2. Accelerate diversity in leadership pipeline
3. Enhance management transparency
4. Expand CSR programs
5. Regular employee ESG feedback
```
