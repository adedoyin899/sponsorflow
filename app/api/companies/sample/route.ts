/**
 * GET /api/companies/sample
 * Downloads a sample CSV with 54 UK tech sponsors with Worker license ratings.
 */

import { NextResponse } from "next/server";

const SAMPLE_CSV = `Company Name,Website,Industry,Type & Rating,Location,Personalization Hook
ClearBank,https://clear.bank,Fintech,Worker (A rating),London,Cloud-native clearing bank infrastructure and real-time payment rails
Canva,https://canva.com,Design & SaaS,Worker (A rating),London,Visual suite collaboration and generative AI design systems
Cloudflare,https://cloudflare.com,Cloud Infrastructure,Worker (A rating),London,Zero Trust edge security and developer serverless platform
Atlassian,https://atlassian.com,Enterprise SaaS,Worker (A rating),London,Jira & Confluence agile workflows and team velocity tooling
Monzo,https://monzo.com,Fintech,Worker (A rating),London,Consumer digital banking and transparent money management UX
Wise,https://wise.com,Fintech,Worker (A rating),London,Cross-border remittances with instant multi-currency accounts
Revolut,https://revolut.com,Fintech,Worker (A rating),London,Global financial super-app and automated treasury management
Deliveroo,https://deliveroo.co.uk,FoodTech & Logistics,Worker (A rating),London,Real-time rider routing algorithms and restaurant merchant portals
Checkout.com,https://checkout.com,Fintech,Worker (A rating),London,Enterprise global payment gateway and multi-currency acquiring
OakNorth Bank,https://oaknorth.co.uk,Fintech,Worker (A rating),London,AI-driven credit intelligence for mid-sized business lending
Starling Bank,https://starlingbank.com,Fintech,Worker (A rating),London,App-based SME business accounts and automated tax categorization
GoCardless,https://gocardless.com,Fintech,Worker (A rating),London,Direct debit recurring payments and open banking bank payment rails
Thought Machine,https://thoughtmachine.net,Fintech,Worker (A rating),London,Vault cloud-native core banking engine with smart contract ledgers
Primer,https://primer.io,Fintech,Worker (A rating),London,Unified payment automation infrastructure and checkout workflow builder
Marshmallow,https://marshmallow.com,Insurtech,Worker (A rating),London,Algorithmic car insurance pricing for immigrants and global movers
Tractable,https://tractable.ai,AI & Insurtech,Worker (A rating),London,Computer vision AI for automated accident damage appraisal
Synthesia,https://synthesia.io,AI & Video,Worker (A rating),London,Generative AI video avatars for corporate communications and training
Paddle,https://paddle.com,SaaS & Billing,Worker (A rating),London,Merchant of record billing infrastructure and global sales tax compliance
SumUp,https://sumup.co.uk,Fintech,Worker (A rating),London,Point-of-sale card readers and merchant financial ecosystems
Tide,https://tide.co,Fintech,Worker (A rating),London,Business financial platform for UK small business accounting and invoicing
Hopin,https://hopin.com,SaaS & Events,Worker (A rating),London,Virtual event streaming and community video engagement tools
Cazoo,https://cazoo.co.uk,E-commerce,Worker (A rating),London,End-to-end digital car buying platform with home delivery logistics
Babylon Health,https://babylonhealth.com,HealthTech,Worker (A rating),London,Digital-first clinical triage and remote telemedicine consultations
BenevolentAI,https://benevolent.com,HealthTech & AI,Worker (A rating),London,AI knowledge graphs for clinical drug discovery and molecular target validation
Elvie,https://elvie.com,FemTech & Health,Worker (A rating),London,Connected women's health hardware and mobile companion apps
Zilch,https://payzilch.com,Fintech,Worker (A rating),London,Regulated Buy Now Pay Later payments with open banking credit scoring
Onfido,https://onfido.com,Identity & Security,Worker (A rating),London,Automated biometric identity verification and anti-fraud AML compliance
Quantexa,https://quantexa.com,Data & Security,Worker (A rating),London,Contextual decision intelligence for financial crime and fraud detection
Snyk,https://snyk.io,Developer Security,Worker (A rating),London,Developer-first open source vulnerability scanner and code security
Pecan AI,https://pecan.ai,AI & Analytics,Worker (A rating),London,Predictive analytics for customer churn and lifetime value modeling
Gousto,https://gousto.co.uk,E-commerce & FoodTech,Worker (A rating),London,Automated recipe box fulfilment operations and recommendation engines
Curve,https://curve.com,Fintech,Worker (A rating),London,All-in-one smart payment card with retroactive cashback and card switching
Truelayer,https://truelayer.com,Fintech,Worker (A rating),London,Open banking payment APIs and instant financial data aggregation
ComplyAdvantage,https://complyadvantage.com,RegTech,Worker (A rating),London,Real-time sanctions screening and transaction monitoring for compliance
Signal AI,https://signal-ai.com,AI & PR,Worker (A rating),London,Executive decision intelligence and global media sentiment monitoring
Cera Care,https://ceracare.co.uk,HealthTech,Worker (A rating),London,Digital home care scheduling platform and remote elderly health analytics
Accurx,https://accurx.com,HealthTech,Worker (A rating),London,GP communication platform connecting NHS patients and primary care staff
HealthHero,https://healthhero.com,HealthTech,Worker (A rating),London,Integrated virtual primary care and clinical prescription services
Luno,https://luno.com,Crypto & Fintech,Worker (A rating),London,Crypto asset exchange and secure digital wallet infrastructure
Blockchain.com,https://blockchain.com,Crypto & Fintech,Worker (A rating),London,Institutional crypto prime services and retail exchange infrastructure
Checkout.com,https://checkout.com,Fintech,Worker (A rating),London,Global enterprise payment orchestration and fraud prevention
Farewill,https://farewill.com,LegalTech,Worker (A rating),London,Digital will writing, probate services, and compassionate legal workflows
Kroo,https://kroo.com,Fintech,Worker (A rating),London,Social neo-bank with high-interest current accounts and carbon offset rewards
OVO Energy,https://ovoenergy.com,CleanTech & Energy,Worker (A rating),London,Smart grid energy management and residential decarbonization tech
Bulb,https://bulb.co.uk,CleanTech & Energy,Worker (A rating),London,Digital green renewable energy billing and smart meter telemetry
Seatfrog,https://seatfrog.com,TravelTech,Worker (A rating),London,Auction platform for first-class train ticket upgrades and rebooking
Drest,https://drest.com,Gaming & Luxury,Worker (A rating),London,Interactive luxury fashion styling game with in-game digital e-commerce
What3words,https://what3words.com,Geotech,Worker (A rating),London,Global address system dividing the planet into 3m x 3m squares
TransferGo,https://transfergo.com,Fintech,Worker (A rating),London,Migrant remittance service with zero-fee real-time European transfers
Habito,https://habito.com,Proptech & Fintech,Worker (A rating),London,Digital mortgage broker and lending platform with automated underwriting
Lendable,https://lendable.co.uk,Fintech,Worker (A rating),London,Algorithmic peer-to-peer personal loans with instant underwriting decisions
Multiverse,https://multiverse.io,EdTech,Worker (A rating),London,Tech apprenticeship matching platform and corporate skills coaching
Depop,https://depop.com,Social E-commerce,Worker (A rating),London,Community-driven circular fashion marketplace with peer-to-peer sales
Gymshark,https://gymshark.com,E-commerce,Worker (A rating),Solihull,Global conditioning apparel brand and community fitness apps`;

export async function GET() {
  return new NextResponse(SAMPLE_CSV.trim(), {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="sponsorflow_uk_tech_sponsors_54.csv"',
    },
  });
}
