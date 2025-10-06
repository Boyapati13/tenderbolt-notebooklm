# Winning Capabilities Test Guide

## Overview
The system now automatically calculates winning capabilities based on your company documents and supporting documents when you upload tender documents. This provides a realistic assessment of your chances of winning each tender.

## How It Works

### 1. Document Upload Process
When you upload a tender document (RFQ, RFP, etc.), the system:
1. **Extracts tender requirements** from the document
2. **Analyzes your company documents** (company profile, certificates, etc.)
3. **Calculates capability scores** based on how well you match the requirements
4. **Updates the tender** with calculated winning probability and analysis

### 2. Capability Analysis
The AI analyzes:
- **Technical requirements** vs your technical expertise
- **Experience requirements** vs your project portfolio
- **Certification requirements** vs your certifications
- **Compliance requirements** vs your compliance documents
- **Team capabilities** vs required skills

### 3. Scoring System
- **Capability Score**: 0-100% overall match with requirements
- **Requirements Met**: X/Y requirements clearly satisfied
- **Win Probability**: Realistic chance of winning (0-100%)
- **Strengths**: Areas where you excel
- **Weaknesses**: Areas needing improvement
- **Recommendations**: Actionable steps to improve chances

## Test Steps

### Step 1: Upload Company Documents
First, upload your company capability documents:

1. Go to **Supporting Documents** or **Company Documents** section
2. Upload these sample documents:
   - `sample-company-profile.txt` - Your company capabilities
   - `sample-iso-certificate.txt` - Your certifications
   - `sample-company-registration.txt` - Your business registration

### Step 2: Upload Tender Document
1. Go to any tender/project detail page
2. Upload `test-tender-document.txt` (the educational software RFP)
3. Watch the system automatically:
   - Extract tender requirements
   - Analyze your company documents
   - Calculate winning capabilities
   - Update the display

### Step 3: View Results
The tender detail page will now show:

#### 🎯 Winning Capabilities Section
- **Capability Score**: How well you match overall (e.g., 85%)
- **Requirements Met**: 8/10 requirements satisfied
- **Win Probability**: Realistic winning chance (e.g., 75%)

#### ✅ Strengths
- Strong technical expertise in React.js development
- Proven track record with educational software
- ISO 27001 certification for data security
- FERPA and COPPA compliance experience

#### ⚠️ Areas to Improve
- Limited experience with Flutter mobile development
- No previous work with specific client requirements

#### 📋 Recommendations
- Partner with a Flutter developer for mobile app
- Obtain additional certifications if needed
- Highlight similar educational projects in proposal

## Expected Results

Based on the sample documents, you should see:
- **High capability score** (80-90%) due to strong educational software experience
- **Most requirements met** due to comprehensive technical stack
- **Good win probability** (70-80%) due to relevant experience and certifications
- **Specific strengths** highlighting your educational software expertise
- **Targeted recommendations** for any gaps

## Real-World Usage

### For Your Own Company
1. Upload your actual company documents:
   - Company profile and capabilities
   - ISO certificates and compliance documents
   - Project portfolios and case studies
   - Team qualifications and certifications

2. Upload tender documents to get:
   - Realistic winning probability assessments
   - Specific areas where you excel
   - Clear gaps that need addressing
   - Actionable recommendations for improvement

### Benefits
- **Data-driven decisions**: Know which tenders to pursue
- **Gap identification**: Understand what you need to improve
- **Competitive advantage**: Highlight your strengths effectively
- **Resource planning**: Allocate resources to high-probability wins

## Troubleshooting

### No Capability Analysis Shown
- Ensure you have uploaded company/supporting documents
- Check that the tender document contains clear requirements
- Verify the AI service is working (check console logs)

### Low Capability Scores
- Upload more comprehensive company documents
- Include specific project examples and case studies
- Add relevant certifications and compliance documents

### Inaccurate Analysis
- Ensure company documents are detailed and specific
- Include quantifiable achievements and metrics
- Update documents with recent projects and capabilities

## Technical Details

The system uses advanced AI to:
1. **Parse tender requirements** using natural language processing
2. **Extract company capabilities** from uploaded documents
3. **Match requirements to capabilities** using semantic analysis
4. **Calculate realistic probabilities** based on industry standards
5. **Generate actionable insights** for improvement

This provides a comprehensive, automated assessment of your winning capabilities for each tender opportunity.
