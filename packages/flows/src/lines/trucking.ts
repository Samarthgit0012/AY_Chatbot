import type { FlowDefinition } from "../types.js";

/** Source: docx §2 "Commercial Trucking Script Tree". */
export const truckingFlow: FlowDefinition = {
  line: "trucking",
  label: "Commercial Trucking",
  entry: {
    prompt:
      "Sure. We help with trucking insurance for owner-operators, new ventures, fleets, hot shot, dump trucks, box trucks, cargo vans, and more. What type of operation do you have?",
    buttons: [
      "Owner-operator",
      "New trucking authority",
      "Fleet",
      "Hot shot",
      "Dump truck",
      "Box truck",
      "Cargo van",
      "Tow truck",
      "Other",
    ],
  },
  qualificationQuestions: [
    {
      id: "hasAuthority",
      prompt: "Do you have your own authority?",
      options: ["Yes", "No", "Applying now", "Not sure"],
    },
    {
      id: "truckCount",
      prompt: "How many trucks do you operate?",
      options: ["1", "2–5", "6–10", "10+"],
    },
    {
      id: "cargoType",
      prompt: "What do you haul?",
      options: [
        "General freight",
        "Refrigerated goods",
        "Auto transport",
        "Dump / dirt / gravel",
        "Containers",
        "Amazon / delivery",
        "Household goods",
        "Other",
      ],
    },
    {
      id: "radiusOfOperation",
      prompt: "Radius of operation?",
      options: ["Local", "50–100 miles", "100–300 miles", "Interstate / long haul"],
    },
    {
      id: "recentIncidents",
      prompt: "Any accidents, violations, or claims in the last 3 years?",
      options: ["No", "Yes", "Not sure"],
    },
    {
      id: "needsCargoInsurance",
      prompt: "Do you need cargo insurance?",
      options: ["Yes", "No", "Not sure"],
    },
  ],
  faqs: [
    {
      id: "how-much-is-trucking-insurance",
      question: "How much is trucking insurance?",
      answer:
        "Great question — and honestly, trucking insurance rates vary quite a bit depending on a few things: the state, your age, your CDL experience, your driving record, what you're hauling, how far you travel, your driving history, the age and value of your truck, and whether you're an owner-operator or a fleet. Rather than give you a number that might not apply to your situation, I'd love to get you a real quote. Can I grab your name and phone number so one of our trucking specialists can reach out? We work with top carriers like Progressive, Great West, BHHC, Northland, NICO, and more — so we'll shop the market to find you the best rate.",
    },
    {
      id: "why-so-expensive",
      question: "Why is my insurance so expensive / Why are my rates so high?",
      answer:
        "I completely understand the frustration — nobody wants to pay more than they have to, and I hear this a lot. Here's the honest truth: insurance rates are based on risk factors that are sometimes outside your control, like your location, the type of cargo you haul, current market conditions, or claims that happened in your industry overall — not just your personal history. But there are also things that CAN be improved over time, like your driving record, safety scores, and claims history. What I'd love to do is have one of our agents do a full review of your current policy. Sometimes we can find coverage gaps, overlaps, or carrier options you didn't know were available. We shop across many carriers — Progressive, Great West, BHHC, Northland, Canal, NICO, Allstate, National General, Geico, and more — so we have a lot of options to work with. Would you like us to take a look and see if we can do better for you?",
    },
    {
      id: "can-i-get-a-discount",
      question: "Can I get a discount?",
      answer:
        "Absolutely — there are several ways to lower your premium! Bundling multiple policies, maintaining a clean driving record, completing safety courses, installing dash cams or GPS tracking, and paying your premium upfront are all things that can bring your rate down. Our agents are great at identifying every discount that applies to your situation. Want me to have someone go through the options with you?",
    },
    {
      id: "why-did-rate-go-up-at-renewal",
      question: "Why did my rate go up at renewal?",
      answer:
        "Renewal increases are frustrating, and you deserve a real explanation. Rates can go up because of claims you filed, changes in your driving record, inflation affecting repair and medical costs, or market-wide adjustments by the carrier. The good news is that when your rate goes up, it's a great time to let us shop the market for you. We may be able to find you a better deal with a different carrier. Want us to do that for you?",
    },
    {
      id: "insure-new-ventures",
      question: "Can you insure new ventures?",
      answer:
        "Yes, we work with options for new ventures. Pricing is usually higher in the beginning, but we can help you understand what coverage is required and what can be improved over time.",
    },
    {
      id: "new-driver",
      question: "I'm a new driver. Can I still get insured?",
      answer:
        "Yes, but options are a bit more limited and pricing is usually higher. We work with markets that do accept new ventures. I can check what you qualify for.",
    },
    {
      id: "just-got-authority",
      question: "I just got my authority. What insurance do I need?",
      answer:
        "Most trucking operations need auto liability first. Depending on what you haul and who you work with, you may also need physical damage, cargo, trailer interchange, non-trucking liability, occupational accident, or general liability. A licensed agent should review your exact operation before you buy.",
    },
    {
      id: "why-quote-so-high",
      question: "Why is my quote so high?",
      answer:
        "I understand. Trucking insurance can be expensive because claims can be large, repairs cost more, cargo can be valuable, and carriers look closely at driving history and experience. The good news is that we can compare markets and also check whether coverage or deductibles can be structured better.",
    },
    {
      id: "beat-my-current-policy",
      question: "Can you beat my current policy?",
      answer:
        "We can review it. Sometimes we can lower the price, sometimes we improve coverage, and sometimes the current policy is already strong. If you upload or send your current declarations page, an agent can compare it properly.",
    },
    {
      id: "hot-shot-trucking",
      question: "Do you insure hot shot trucking?",
      answer:
        "Yes, we can help with hot shot trucking. We'll need to know the truck type, trailer type, cargo, radius, authority status, and driving history.",
    },
    {
      id: "dump-trucks",
      question: "Do you insure dump trucks?",
      answer:
        "Yes. Dump truck insurance depends heavily on what you haul, where you operate, and whether you work for contractors, municipalities, or private clients.",
    },
    {
      id: "box-trucks",
      question: "Do you insure box trucks?",
      answer:
        "Yes. Box truck coverage depends on whether it is local delivery, moving, Amazon-style delivery, appliance delivery, or general freight.",
    },
    {
      id: "need-cargo-insurance",
      question: "Do I need cargo insurance?",
      answer:
        "If you haul property that belongs to someone else, cargo insurance is usually required by brokers or contracts. It helps protect the goods you are transporting if they are damaged or stolen.",
    },
    {
      id: "new-authority-mc-number",
      question: "I'm a new authority / just got my MC number. Can you help me?",
      answer:
        "Absolutely — we love working with new authorities! Getting your first trucking policy can feel overwhelming, but our team makes it straightforward. We'll help you get the minimum liability coverage required by the FMCSA, and walk you through any other coverages that make sense for your operation. Just keep in mind that being a new authority can affect your rate, but we work with multiple carriers who specialize in new ventures. Want to get the ball rolling? Drop your name and number and we'll call you!",
    },
    {
      id: "insure-owner-operators",
      question: "Do you insure owner-operators?",
      answer:
        "Yes, absolutely! Owner-operators are actually one of our specialties. Whether you're leased to a carrier or running under your own authority, we've got options for you. Let me have one of our team members reach out to you with a custom quote — what's the best number to call you on?",
    },
    {
      id: "insure-truck-types",
      question:
        "Do you insure semi-trucks, dump trucks, box trucks, tow trucks, flatbeds?",
      answer:
        "Yes to all of those! We insure a wide variety of commercial trucks including: Semi-trucks / 18-wheelers, Dump trucks, Box trucks, Tow trucks, Flatbed trucks, Refrigerated trucks (reefers), Tanker trucks, and more! Every truck type has its own insurance considerations, and our team is well-versed in all of them. Want us to put together a quote for you?",
    },
    {
      id: "minimum-liability-required",
      question: "What is the minimum liability required for trucking?",
      answer:
        "The FMCSA sets the federal minimums based on what you haul: $750,000 for general freight, $1,000,000 for oil transport, $5,000,000 for hazardous materials. Some shippers and brokers may require higher limits, so it's worth checking your contracts too. Our team can make sure you're covered for exactly what you need — want us to reach out?",
    },
    {
      id: "physical-damage-coverage",
      question: "What is physical damage coverage?",
      answer:
        "Physical damage helps protect your own truck or trailer if it is damaged by collision, theft, fire, vandalism, or certain weather events.",
    },
    {
      id: "non-trucking-liability",
      question: "What is non-trucking liability?",
      answer:
        "Non-trucking liability is usually for owner-operators leased to a motor carrier. It may cover certain personal or non-business use of the truck when you are not under dispatch. An agent should verify if it fits your situation.",
    },
    {
      id: "what-kind-of-trucking-insurance",
      question: "What kind of trucking insurance do I need?",
      answer:
        "That depends on what you're doing! Here's a quick breakdown of the most common coverages for truckers: Primary Liability — Required by the FMCSA, covers damage or injury you cause to others. Physical Damage — Covers your truck if it's damaged in an accident, fire, theft, etc. Motor Truck Cargo — Covers the freight you're hauling if it's lost or damaged. Non-Trucking Liability — Covers you when you're driving your truck for personal use (not under dispatch). Bobtail Insurance — Covers your truck when you're operating without a trailer. General Liability — Covers your business for incidents that happen off the road. Not sure which ones apply to you? Let me connect you with one of our trucking specialists — they'll walk you through exactly what you need. Want me to set that up?",
    },
  ],
  cta: {
    prompt: "Would you like a licensed agent to review your trucking insurance options?",
    buttons: [
      "Yes, start quote",
      "I want to upload my current policy",
      "Call me",
      "Text me",
      "I'm just comparing",
    ],
  },
  crossSell:
    "By the way — a lot of our trucking clients also protect their business with a General Liability policy, especially if shippers or brokers require it. And if you ever need help with DOT compliance filings like IFTA, IRP, or Form 2290, that's something our team handles too! Want to bundle everything together and make your life a little easier?",
};
