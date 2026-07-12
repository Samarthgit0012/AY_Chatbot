import type { FlowDefinition } from "../types.js";

/** Source: docx §5 "Contractor Insurance / Construction Script Tree". */
export const contractorFlow: FlowDefinition = {
  line: "contractor",
  label: "Contractor Insurance / Construction",
  entry: {
    prompt:
      "We help contractors with general liability, commercial auto, tools/equipment, workers comp, umbrella, and bonds. What type of construction work do you do?",
    buttons: [
      "General contractor",
      "Roofing",
      "HVAC",
      "Electrical",
      "Plumbing",
      "Flooring",
      "Painting",
      "Framing",
      "Landscaping",
      "Handyman",
      "Concrete",
      "Other",
    ],
  },
  qualificationQuestions: [
    { id: "tradeType", prompt: "Trade/type of work?" },
    {
      id: "workCategory",
      prompt: "Residential, commercial, or both?",
      options: ["Residential", "Commercial", "Both"],
    },
    {
      id: "workType",
      prompt: "New construction, repair, remodel, or service work?",
      options: ["New construction", "Repair", "Remodel", "Service work"],
    },
    { id: "annualPayroll", prompt: "Annual payroll?" },
    { id: "annualGrossRevenue", prompt: "Annual gross revenue?" },
    {
      id: "employeesOrSubs",
      prompt: "Employees or subcontractors?",
      options: ["Employees", "Subcontractors", "Both", "Neither"],
    },
    {
      id: "workOverTwoStories",
      prompt: "Any work over 2 stories?",
      options: ["Yes", "No"],
    },
    {
      id: "highRiskWork",
      prompt: "Any roofing, structural, excavation, demolition, or high-risk work?",
      options: ["Yes", "No"],
    },
    {
      id: "needsCertificateForJob",
      prompt: "Need certificate for a job?",
      options: ["Yes", "No"],
    },
    { id: "needsBond", prompt: "Need a bond?", options: ["Yes", "No"] },
  ],
  faqs: [
    {
      id: "insurance-for-construction-job",
      question: "I need insurance for a construction job. Can you help?",
      answer:
        "Yes. We'll need to know what kind of work you do, what the contract requires, and whether they need a certificate, additional insured wording, waiver of subrogation, or specific limits.",
    },
    {
      id: "what-contractors-usually-need",
      question: "What insurance does a contractor usually need?",
      answer:
        "Most contractors start with general liability. Depending on the business, they may also need commercial auto, workers compensation, tools/equipment coverage, umbrella, and bonds.",
    },
    {
      id: "why-so-many-questions",
      question: "Why does the insurance company ask so many questions?",
      answer:
        "Construction risk changes a lot depending on the work. For example, roofing, excavation, electrical, and structural work can have different risks than painting or flooring. The questions help match you with the right carrier.",
    },
    {
      id: "subcontractors-need-insurance",
      question: "Do subcontractors need insurance?",
      answer:
        "Usually yes. If you use subcontractors, carriers may ask for certificates from them. If they are uninsured, it can affect your premium or create a coverage problem.",
    },
  ],
  cta: {
    prompt: "Would you like a licensed agent to review your contractor insurance options?",
    buttons: ["Yes, start quote", "I want to upload my current policy", "Call me", "Text me", "I'm just comparing"],
  },
};
