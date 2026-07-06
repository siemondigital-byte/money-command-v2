/**
 * Coach content — ENGLISH.
 *
 * English transcreation of coach-content.ts (source: "The Infallible System of
 * Wealth" / El Sistema Infalible de Riqueza). Native English, not a literal
 * calque. Doctrinal note: all rates (e.g. 8%) are REFERENCE examples, never
 * imposed. The axis is sovereignty — knowing where you stand so you can choose.
 *
 * Same shape as coach-content.ts. Wire by locale in the Coach module; the
 * index-for-date helpers stay shared with the ES file.
 */

import type { CoachConcept, CoachChallenge } from "./coach-content";

export const COACH_CONCEPTS: CoachConcept[] = [
  {
    id: "C01",
    titulo: "The financial thermostat",
    capsula: `Your brain has an income level it always returns to. If it's set at $2,000, the months you earn $4,000 you find ways to spend the extra. The months you earn $800, you find a way to get by. The system's first job is to raise that thermostat for good.`,
    explicacion: `Neuroscience confirms what great mentors have taught for decades: you have a financial comfort zone, a number your material life always drifts back to. You don't raise that thermostat by earning more, because the old setting finds a way to pull you back to the same place. You raise it by rewriting what you believe you deserve to earn, what you believe is possible for someone like you, and what you believe will happen if you have a lot of money. Those beliefs are the real thermostat.`,
  },
  {
    id: "C02",
    titulo: "The difference between rich and poor isn't what they earn",
    capsula: `Warren Buffett put it plainly: the difference between rich people and poor people isn't the amount of money they earn, it's what they do with the money they earn. It isn't complicated. It isn't magic. It's a system.`,
    explicacion: `Most people assume the rich are smarter or luckier. The truth is simpler: they have a system that maximizes income, minimizes spending without deprivation, automates saving, invests that saving, and protects the wealth they build. When you have a system that does this without relying on willpower, wealth becomes inevitable. It's not a question of if — it's a question of when.`,
  },
  {
    id: "C03",
    titulo: "The 4 levels of financial identity",
    capsula: `The Survivor lives paycheck to paycheck and reacts to every emergency. The Manager budgets and saves but sees money as something to control. The Builder sees money as energy directed toward assets that generate more money. The Conscious Architect designs systems, balances enjoyment and building, and measures freedom by what they can choose, not what they spend. Which one are you?`,
    explicacion: `You don't build wealth by learning techniques alone. You build it by becoming the kind of person who naturally makes wealth decisions. The turning point isn't when you have a lot of money — it's when you decide to think like someone at Level 3 or 4 regardless of what's in your account. The Conscious Architect is the fourth level: they don't just build, they design with intention, balance present enjoyment with sustained building, and understand that financial freedom is measured by what you can choose, not by what you spend. That decision is the real starting line. Without it, the tools don't work.`,
  },
  {
    id: "C04",
    titulo: "The 3 types of income",
    capsula: `Active income is your time for money — it has a ceiling. Passive income is money without trading time — it has no ceiling. Portfolio income comes from your investments. To build freedom you need all three, in order.`,
    explicacion: `Active income matters because it's your main source when you start, but it has a limit: you only have 24 hours a day. Even working 12-hour days, there's a ceiling. Passive income has no ceiling, but it requires starting capital: money to invest, a property to buy, a business that runs without you. That's why the order is: you use active income to build savings, those savings to build portfolio income, and eventually larger passive flows.`,
  },
  {
    id: "C05",
    titulo: "The 50/30/20 method",
    capsula: `50% for Essentials. 30% for Style. 20% for Freedom. It isn't a rigid rule — it's a reference. What matters isn't the exact numbers, it's that you have a structure your money respects before you can touch it.`,
    explicacion: `Most budgets fail because they're too complicated. Watching 8 categories month to month is exhausting, and one day you forget and slip back into old habits. The 50/30/20 works because it's simple: three categories. If you overspend on Style, no problem — that category is flexible, you just have less for other things within that 30%. And it adapts: if you carry a lot of debt, you can shift to 50/20/30 (more to debt, less to Style). If you earn a lot, to 40/30/30. The structure leads, the numbers adjust.`,
  },
  {
    id: "C06",
    titulo: "Essentials vs Style vs Freedom",
    capsula: `Essentials are what you need to live: housing, food, utilities, basic transport, insurance. Style is what you want but don't need: restaurants, travel, subscriptions, brand-name clothes. Freedom is what grows your money: savings, index funds, extra debt payments, education that raises your value.`,
    explicacion: `Here's a common mistake: the minimum payment on a debt goes in Essentials (it's mandatory to stay current), but the extra payment above the minimum goes in Freedom (it's a deliberate decision to buy your freedom sooner). Another: Netflix is Style, health insurance is Essential. An online course that raises your future income is Freedom, not Style. The mental rule: is it indispensable to live? Essential. Does it improve my life but I could do without it? Style. Does it grow my money or my ability to generate it? Freedom.`,
  },
  {
    id: "C07",
    titulo: "Why automatic saving beats willpower",
    capsula: `Pay yourself first. When your paycheck arrives, an automatic transfer sends 20% to your investment account before you see the money. You don't have to decide each month — it happens without you. What you don't see, you don't miss.`,
    explicacion: `The classic mistake is paying yourself last: "I'll spend all month and save whatever's left." Nothing's ever left. The psychology is perverse — you find ways to spend everything available. The fix is to reverse the order: you set up an automatic transfer on payday, that money disappears from view, and you live on what remains. Your lifestyle adjusts on its own. What you do NOT see, you do NOT miss. It's the only sustainable way to save — without relying on willpower that runs out by mid-afternoon.`,
  },
  {
    id: "C08",
    titulo: "Delayed gratification without deprivation",
    capsula: `Delaying gratification does NOT mean depriving yourself of living. It means spending BETTER, not spending LESS. Eating at quality restaurants twice a week instead of six isn't sacrifice — it's consciously choosing where your money goes.`,
    explicacion: `The trap of delayed gratification is believing you have to suffer now to enjoy later. That's wrong, and it's why most people quit. The system doesn't ask you to sacrifice your present life on the altar of future freedom. It asks you to choose with intention what you spend and on what, instead of spending out of habit or social pressure. And it asks for something more: that every month the system works, your ability to enjoy the present grows too. You don't wait 10 years to improve your quality of life.`,
  },
  {
    id: "C09",
    titulo: "The real cost of your spending",
    capsula: `A $1,200 phone doesn't cost $1,200. If you invested that $1,200 at, say, 8% a year for 5 years, it would be worth $1,763. The phone costs you $563 extra — the real cost of the opportunity lost. Apply this to every big spending decision.`,
    explicacion: `This is one of the most powerful tools for training delayed gratification: calculate the real cost, not just the visible one. Examples from the book: a new $40,000 car costs you $86,357 over 10 years (because that money invested at, say, 8% would double). Eating out 4 times a week vs once is a $29,342 difference over 5 years. It's not that you can't buy the car or eat out — it's that you know exactly what you're trading for what. Conscious decisions, not automatic ones.`,
  },
  {
    id: "C10",
    titulo: "The Rule of 72",
    capsula: `To know how many years it takes your money to double: divide 72 by your rate of return. At 8% a year: 9 years. At 10%: 7.2 years. At 12%: 6 years. That's the doubling speed of your invested capital.`,
    explicacion: `The Rule of 72 is one of the most useful mental tools in the book. It lets you calculate, in seconds, how long any capital takes to double at any rate. It's good for two things: first, to grasp the real power of compound interest without a calculator. Second, and more important, to see the opportunity cost of every big purchase: every $10,000 you do NOT invest today is $20,000 you won't have in 9 years. That's the real math of your spending decisions.`,
  },
  {
    id: "C11",
    titulo: "Compound interest: the eighth wonder",
    capsula: `Einstein called it the eighth wonder of the world. It's the moment your returns generate returns. $10,000 invested at, say, 8% a year becomes $100,627 in 30 years — ten times your initial investment. The trick is giving it time.`,
    explicacion: `Compound interest is earning a return on your return. Year 1, your $10,000 becomes $10,800. Year 2, it's not $11,600 — it's $11,664, because you earned 8% not on the original $10,000 but on the $10,800. Year 3, $12,597. Year 10, $21,589. Year 20, $46,610. Year 30, $100,627. What matters isn't the formula — it's understanding that time is your best friend. Every year you do NOT start is a compounding year you NEVER get back.`,
  },
  {
    id: "C12",
    titulo: "The emergency fund",
    capsula: `3-6 months of expenses in cash. It isn't an investment, it's insurance. Without it, any crisis pushes you into consumer debt and wipes out years of progress in a single weekend. Building it is the FIRST priority before investing.`,
    explicacion: `Without an emergency fund, every crisis (a broken-down car, a medical issue, a lost job) pushes you toward credit cards and personal loans. That drops you into consumer debt paying 18-25% interest — the exact opposite of the compound interest you want to build. With an emergency fund, you simply use the money, handle it, and move on. 3 months covers most emergencies. 6 months is ideal: it gives you security and lets you make better decisions (not taking any job out of desperation). Build it BEFORE you invest.`,
  },
  {
    id: "C13",
    titulo: "The 5 types of investment",
    capsula: `Fixed Income (bonds, CDs, 3-8%, low risk). Equities (stocks, index funds, 5-10%, medium-high risk). Real Estate (property, 5-10%, medium risk). Businesses (20%+, high risk). Crypto (very high potential return, very high volatility). Each has its place.`,
    explicacion: `For beginners, the recommendation is to start with equities through index funds. They're simple, diversified, cheap on fees, and have a proven track record of building wealth over the long term. Warren Buffett recommends them for most people. Once you have experience and more capital, you can explore other types depending on your age, time horizon, financial situation, and temperament. Diversifying across types is what lowers the portfolio's total risk without sacrificing much expected return.`,
  },
  {
    id: "C14",
    titulo: "Index funds",
    capsula: `An index fund tracks a market index (e.g. the S&P 500). Instead of picking individual stocks, you buy a stake in the 500 largest companies at once. Automatic diversification, low cost (0.05-0.2% fees), consistent performance. The best option for most people.`,
    explicacion: `The elegance of the index fund is mathematical: 80%+ of active managers fail to beat the average index over the long term, yet they charge you 1-2% annual fees that erode your return. The index fund gives you the market's average return (7-8% historically after inflation) with minimal fees. Warren Buffett said it: for most people, index funds are the best investment. Your job isn't to beat the market — it's to be in the market consistently for decades.`,
  },
  {
    id: "C15",
    titulo: "Investment horizon",
    capsula: `Time reduces risk. If you invest in index funds for 1 year you have a 25% chance of loss. Over 10 years, 5%. Over 20 years, 1%. The market has short-term cycles, but over the long term it always rises.`,
    explicacion: `This is why the younger you are, the more risk you can tolerate. If you're 25 and investing for your 65th year, you have a 40-year horizon. Any market drop has time to recover and be offset. If you're 60, you can no longer afford a 40% drop with no time to recover — you need more fixed income. The simple rule: 0-1 year, keep it in cash. 5-10 years, 60% stocks / 40% bonds. 20+ years, 90% stocks / 10% bonds. The horizon rules over your appetite for risk.`,
  },
  {
    id: "C16",
    titulo: "The difference between good debt and bad debt",
    capsula: `Bad debt: consumption. Cards to buy things that depreciate, 18-25% interest, generates no return. Good debt: investment. Mortgage, student loan, business loan, 3-8% interest, generates a future return.`,
    explicacion: `Not all debt is the same. Consumer debt (cards, personal loans to buy things that lose value) is destructive: you pay 18-25% interest and the asset you buy generates nothing to offset that cost. Investment debt is different: a mortgage for a property that appreciates, a student loan for a career that multiplies your income, credit for a business that turns a profit. The key question: does this debt buy something that will generate more than it costs? If yes, good debt. If no, bad debt.`,
  },
  {
    id: "C17",
    titulo: "Avalanche vs snowball strategy",
    capsula: `Avalanche: you pay off the HIGHEST-interest debt first. You save the most in total interest. Snowball: you pay off the SMALLEST debt first. You see quick progress, psychological motivation. Avalanche wins mathematically, snowball wins psychologically.`,
    explicacion: `The avalanche strategy is mathematically optimal: you pay more toward the highest APR, keep minimums on the rest, and each debt cleared frees up money to attack the next. You save thousands in total interest. The snowball is psychologically optimal: you pay the smallest debt first for a quick visible win, which builds motivation to keep going. The book's recommendation: use avalanche if you have discipline and your goal is mathematical efficiency. Use snowball if you need to see quick progress to avoid quitting. Both work — the worst strategy is having none.`,
  },
  {
    id: "C18",
    titulo: "Multiple income streams",
    capsula: `Plan A: your main salary. Plan B: passive income (dividends, interest, rent). Plan C: side income (freelance, side hustle). The trick: 100% of Plan C goes straight to investing — because you already live on Plan A.`,
    explicacion: `The A/B/C structure is defensive and multiplicative at the same time. Defensive because if you lose Plan A (your job), you have B and C as a net. Multiplicative because Plan C lets you accelerate the system: when that extra freelance or consulting money comes in, you do NOT spend it — 100% goes to investing, because your life is already covered by Plan A. In 5-10 years, that reinvested Plan C becomes a meaningful Plan B. And when B surpasses A, you reach financial freedom.`,
  },
  {
    id: "C19",
    titulo: "The 30-day rule",
    capsula: `Before any non-essential purchase over $100, wait 30 days. If after 30 days you still want it, buy it. If not, you avoided an impulse buy. This single rule saves most people hundreds of dollars a month.`,
    explicacion: `Impulse spending is one of the biggest destroyers of wealth. Brands design their entire strategy so you decide in 30 seconds without thinking. The 30-day rule adds a cognitive brake: it forces you to separate desire from impulse. What you truly need or want survives the 30 days. What was a moment's impulse fades. Every time the 30 days pass and you decide not to buy, you're training the muscle of delayed gratification — and that muscle is what separates the 99% from the 1%.`,
  },
  {
    id: "C20",
    titulo: "Lifestyle inflation",
    capsula: `Every time your income rises, your spending rises at the same pace. You earn more, spend more, save the same. It's the most common trap and the reason high-earning professionals keep living paycheck to paycheck. Spot it and break it.`,
    explicacion: `Lifestyle inflation is what kills financial freedom for most professionals who earn well. You got promoted, you bought a better car. You changed jobs with a raise, you moved to a pricier apartment. Your partner earned more, you added subscriptions, ate out more, traveled in a better class. By the end of the month, the real margin is the same as when you earned half. The book's rule: with every raise, at least 50% goes straight to investing BEFORE you touch your lifestyle. That's how you grow without falling into the trap.`,
  },
  {
    id: "C21",
    titulo: "Your Freedom Number",
    capsula: `The invested capital needed so its passive returns cover your monthly expenses without touching the capital. Formula: Desired Monthly Spend × 12 ÷ your portfolio's Expected Passive Return rate. It's the destination the whole system points to.`,
    explicacion: `Without the Freedom Number, you're learning techniques with no destination. With it, everything makes mathematical sense. The formula is simple but powerful: if you want $3,000 a month to live on and your portfolio yields, say, 6% weighted annually, you need $600,000 invested. That capital, generating 6%, pays you $36,000 a year = $3,000 a month — without touching the principal. Every spending, saving, and investing decision makes sense when you measure it against this number. What brings you closer adds. What moves you away subtracts. The rate is yours to set — it's a reference, not a rule.`,
  },
  {
    id: "C22",
    titulo: "The 4 phases of financial freedom",
    capsula: `Phase 1: Crisis (0-3 months, survive and start saving). Phase 2: Stability (3-12 months, emergency fund and pay down debt). Phase 3: Security (1-5 years, invest consistently). Phase 4: Freedom (5+ years, passive income covers expenses).`,
    explicacion: `Financial freedom doesn't happen overnight. It's a 4-phase process, each with clear objectives. In Phase 1 your priority is to reduce spending and start saving, even a little. In Phase 2 you build the emergency fund and attack consumer debt. In Phase 3 you're investing consistently and starting to generate small passive income. In Phase 4 passive income covers your expenses and work becomes a choice, not an obligation. Knowing which phase you're in tells you what to do this month. Don't skip phases — each one builds the foundation of the next.`,
  },
  {
    id: "C23",
    titulo: "The paradox of financial freedom",
    capsula: `Most people idealize "doing nothing." But humans aren't designed for that. Freedom isn't for resting — it's for choosing.`,
    explicacion: `There's something few people anticipate before reaching financial freedom: the danger of total comfort. Humans aren't designed to do nothing — they're designed to progress, contribute, and be useful. Someone who retires without a purpose to sustain them tends to fade; someone who keeps a "what for" holds onto their vitality far longer. That's why many people who reach freedom choose to keep working with more passion than ever. Not because they need the money. Because they found their purpose. Financial freedom isn't the end of the road — it's the starting point of the road you actually chose. That's why, from the first chapter, the book asks: what will you do when you have it?`,
  },
  {
    id: "C24",
    titulo: "The internal locus of control",
    capsula: `External locus: your results depend on the government, the economy, your boss, your family. Internal locus: your life is a direct consequence of your decisions. Wealth requires agency. And agency begins when you stop looking for someone to blame.`,
    explicacion: `There's a psychological distinction that separates those who build wealth from those who don't — regardless of intelligence, education, or starting point. An external locus keeps you in victimhood, and from victimhood it's impossible to build wealth, because wealth requires agency. An internal locus understands that your outer life is a reflection of your accumulated actions. The right question isn't "why do they earn more than me?" — it's "who do I have to become to earn what they earn?" That question shifts the focus from complaint to construction.`,
  },
  {
    id: "C25",
    titulo: "The law of impact at scale",
    capsula: `The economy doesn't reward moral usefulness, it rewards impact at scale. A doctor helps a few deeply. A health-content creator can impact millions. The system pays for how many people you reach with your solution.`,
    explicacion: `For centuries, scale required massive capital: factories, distribution, employees. Today the internet erased that barrier. A person with knowledge, intention, a device, and a connection can reach millions simultaneously. AI erased the second barrier: time. What once took weeks of teamwork now takes hours with the right tools. This means it has never in human history been so within reach for an ordinary person to build a scalable income model from zero, with no starting capital. The barrier is no longer technical — it's mental.`,
  },
  {
    id: "C26",
    titulo: "The 6 roots of financial stress",
    capsula: `1) Lack of purpose. 2) Incomplete action (unfinished tasks). 3) Fear of failure. 4) Fear of rejection (Type A behavior). 5) Denial of reality. 6) Anger at the system. They aren't external — they're internal. And they're the real reason the money doesn't come.`,
    explicacion: `There's a recurring observation in the psychology-of-success literature that identifies six internal conditions predisposing us to negative emotions and mediocre results. They aren't external circumstances — they're internal states. You can earn more and still have the same problems if you don't resolve these roots. For example, denial of reality: refusing to face unpleasant truths about your financial situation is why many people avoid looking at their accounts. There's always a price you can pay to free yourself from any stress. The resistance to facing it is what causes the stress — not the situation itself.`,
  },
  {
    id: "C27",
    titulo: "Type A vs Type B",
    capsula: `Type A works compulsively from fear, is never satisfied, competes against everyone, doesn't rest, dies young. Type B builds from intention, knows when to stop, has healthy relationships, builds sustainably. For real freedom, migrate from Type A to Type B.`,
    explicacion: `Type A lives in permanent fear of rejection and failure. They work long hours but from anxiety, not intention. They can't rest because they feel that if they stop, everything collapses. The irony is that many Type As never reach financial freedom because they burn their health and relationships in the process, or when they arrive, the body no longer responds. Type B works with the same intensity but from clarity: they know what they're building, why, and when to stop. Migrating from A to B isn't working less — it's working with purpose instead of panic.`,
  },
  {
    id: "C28",
    titulo: "Your mental code with money (4 layers)",
    capsula: `Layer 1: what you Believe you deserve to earn. Layer 2: what you Believe is possible for someone like you. Layer 3: what you Believe money requires (the price you put on success). Layer 4: what you Believe will happen if you have a lot of money. What you believe, you create.`,
    explicacion: `Your mental code was installed before you turned 10. Your family, your school, your culture, and your first experiences with money gave it to you. You didn't choose it — but you can rewrite it. The four layers are cumulative and work together: if you believe you don't deserve to earn much (Layer 1) but also believe it's possible for someone like you (Layer 2), you'll unconsciously sabotage any extra income. The Money Command works all four layers, because changing techniques without touching the beliefs is like driving with the parking brake on.`,
  },
  {
    id: "C29",
    titulo: "The 5 phrases that do the most damage",
    capsula: `"Money doesn't buy happiness." "Rich people are bad or corrupt." "To make money you have to have money." "Easy money doesn't exist." "Thinking a lot about money is materialistic." You probably heard all of them. And they installed before you could evaluate them.`,
    explicacion: `These phrases installed in your mind before you could analyze them. They aren't truths — they're programs. And like any program, they can be uninstalled. The truth behind each: money amplifies who you are (it's neither the problem nor the solution). There are wonderful people with money and terrible ones with nothing. Knowledge is the most profitable asset, and you don't need money to start. Smart money exists, and it multiplies your time and energy. Ignoring money is for people who don't understand that money is freedom, options, and time. Not wanting more is valid — not knowing how to manage it is irresponsible.`,
  },
  {
    id: "C30",
    titulo: "Success follows systems, not surnames",
    capsula: `"Success is for other people, not for me." False. Success follows systems, not surnames. This book is the system. You bring the execution. Anyone who applies the system consistently gets there — regardless of where they started.`,
    explicacion: `The belief "success is for other people" is one of the most common and most destructive forms of self-sabotage. It assumes there's something intrinsically special about those who succeed: a background, a connection, luck. The evidence shows the opposite. Most of today's millionaires started from zero. What they have isn't a special gift — it's a system they applied consistently for years. Maximize income, minimize spending, automate saving, invest, protect. Five steps. Repeated. Anyone can do it. But few do, because it takes discipline, patience, and faith in the process when the results aren't yet visible.`,
  },
  {
    id: "C31",
    titulo: "The right question",
    capsula: `The wrong question: "Why do they earn more than me?" The right question: "Who do I have to become to earn what they earn?" The first keeps you in complaint. The second puts you in construction.`,
    explicacion: `Changing the question changes the answer. The question "why do they earn more?" looks for reasons outside: luck, connections, background. It keeps you a victim of the system. The question "who do I have to become?" looks for work inside: what skills I need, what beliefs I must change, what decisions I have to make. It puts you in agency. The difference between the two questions is the difference between staying where you are and moving forward. And that difference isn't about intelligence or circumstances — it's about choice.`,
  },
  {
    id: "C32",
    titulo: "The Wealth Triangle",
    capsula: `Three corners: Income (what you earn), Spending (where it goes), Investment (what multiplies). All three are connected vessels — weakness in one drains the others. Most people work only one. The system works all three.`,
    explicacion: `Most finance books work only one pillar: saving, investing, or entrepreneurship. The problem is that money works like a system of connected vessels: weakness in one drains the rest. A person who invests brilliantly but carries debt at 25% loses more than they gain. A person who saves diligently but generates no additional income reaches freedom in 40 years instead of 10. A person who earns a lot but doesn't control spending ends up in lifestyle inflation. The three corners work together or the system breaks.`,
  },
  {
    id: "C33",
    titulo: "Why traditional budgets fail",
    capsula: `Watching 8 categories month to month is exhausting. Too much discipline, too much willpower. That's why most people quit in 3 weeks. The 50/30/20 works because it has only 3 categories. Simple. Flexible. Sustainable.`,
    explicacion: `Traditional budgets fail from over-engineering. They design 8-10 categories with strict limits for each, and any deviation creates stress. If you spend $50 more on food one month, they force you to cut $50 from another category — that creates anxiety and quitting. The 50/30/20 works because it's simple: three big categories with internal flexibility. If you spend more on restaurants, you simply have less for travel within the 30% for Style. There's no technical failure — there's natural reallocation. The structure leads; the details fall into place on their own.`,
  },
  {
    id: "C34",
    titulo: "Why you need purpose",
    capsula: `Without purpose, money is a destination. With purpose, it's a vehicle. Lack of meaning is the number-one cause of stress and lost motivation, even in people who reached their financial goals. You need to know what you want freedom for.`,
    explicacion: `The paradox of financial success: lack of meaning is the number-one cause of stress and lost motivation, even among those who reached their goals. Money can't give you purpose — that work is yours alone. It can't replace genuine relationships — wealth without community is loneliness in first class. It can't buy peace of mind — it can only buy the time to build it. It can't guarantee happiness — it only buys the freedom to choose it. But with clear purpose, it amplifies all of that extraordinarily. The question isn't how much you want to have. It's what you'll do when you have it.`,
  },
  {
    id: "C35",
    titulo: "The investor's purpose question",
    capsula: `Complete the sentence: "I am building this wealth to be able to ___, for the year ___, because I want to contribute ___." That sentence is your compass. Use it every time you're about to make a financial decision.`,
    explicacion: `This sentence is the simplest and most powerful tool in the system. It works because it turns a vague idea ("I want financial freedom") into a specific commitment with three components: the what (what you'll do), the when (the deadline), and the why (the larger meaning). When you hesitate between buying something and saving, look at that sentence. When an investment opportunity appears, look at that sentence. When you want to spend on a whim, look at that sentence. It's your compass. Without it, you navigate with no north.`,
  },
  {
    id: "C36",
    titulo: "Specificity turns desire into strategy",
    capsula: `"Travel" isn't a goal — it's a desire. "3 months a year in a cabin with my family" is a goal. "Help others" isn't a goal — it's a desire. "Fund my nephews' education" is a goal. Specificity turns your desire into strategy.`,
    explicacion: `Vague goals don't mobilize resources. Your brain doesn't know where to aim, your financial system doesn't know how much to accumulate, your calendar doesn't know what to prioritize. Specificity changes everything: it turns desire into a concrete direction. Example from the book: "travel" requires X dollars a month for X months, which require X of invested capital at X return. Each specific element (place, frequency, duration, company) translates into a figure. And figures get pursued. Desires only get dreamed.`,
  },
  {
    id: "C37",
    titulo: "Delayed gratification and balance",
    capsula: `It's not about living in scarcity waiting for the future. It's about living with intention NOW, knowing that every conscious decision today builds tomorrow's freedom. Enjoy the present, but with awareness.`,
    explicacion: `The trap of delayed gratification is believing the system requires sacrificing your present life. The system does NOT ask that. It asks something different: enjoy the present consciously, choosing with intention where your money goes instead of spending out of habit or social pressure. Be grateful for what you have while you build what you want — abundance doesn't begin when you reach your Number, it begins when you stop living from mental scarcity. Progress gradually: every month the system works, your ability to enjoy the present grows too. You don't wait 10 years to improve your quality of life.`,
  },
  {
    id: "C38",
    titulo: "Be the person of the goal today",
    capsula: `Don't wait to have financial freedom to act like someone who's free. Be today the person you'll be when you reach the goal — not in money, but in mindset. Your brain starts detecting opportunities that were invisible before.`,
    explicacion: `This sounds mystical but it has a neurological basis. Your brain filters millions of stimuli per second and only shows you what's relevant to your current identity. If your identity is "I'm someone who lives paycheck to paycheck," your brain filters out investment opportunities as noise. If your identity is "I'm someone who builds wealth," the same brain starts detecting investment opportunities in every conversation. It doesn't change your luck — it changes your attention. That's why the book insists on working identity before techniques: with the wrong identity, techniques don't work.`,
  },
  {
    id: "C39",
    titulo: "Commit to the system, not the result",
    capsula: `The result takes time. The system is immediate. Commit to applying the system — budget, automatic saving, continuous education — regardless of the first months' results. Most people quit right before the results arrive.`,
    explicacion: `The most common trap in building wealth: wanting to see results in 3 months. Results take time because they depend on compound interest, which is exponential but slow at first. The early years feel like nothing's happening. At 5 years you start to see it. At 10, the curve becomes obvious. At 20, exponential. Most people quit in year 2-3, when results aren't yet visible, not knowing they were 1 year from the exponential curve. The rule: commit to the system, not the result. You control the system; the results arrive on their own if the system holds.`,
  },
  {
    id: "C40",
    titulo: "Consistency beats brilliance",
    capsula: `You don't need to be brilliant. You need to be consistent. Average decisions repeated over years beat genius decisions made sporadically. Compound interest rewards consistency, not intelligence.`,
    explicacion: `One of the great confusions is believing wealth comes from exceptional decisions: the brilliant business, the perfect investment, the unique opportunity. Reality is the opposite: wealth comes from average decisions repeated with consistency. Investing $500 a month in an index fund for 30 years isn't brilliant — it's average. But it gets you to $750,000+ through pure compound interest. The genius who invests $50,000 once and never again ends with less. Consistency is intelligence applied to time. And time is democratic: we all have the same amount.`,
  },
  {
    id: "C41",
    titulo: "Being 100% responsible",
    capsula: `No government, boss, economy, or circumstance has more power over your financial future than you. Taking 100% responsibility doesn't mean everything is your fault — it means you have 100% of the power to change it.`,
    explicacion: `100% responsibility is the most liberating decision you can make. It sounds heavy — "it all depends on me" — but it's the opposite: it's the only position from which you can act. If your financial future depends on the government, you can do nothing until the government changes. If it depends on your boss, until your boss gives you a raise. If it depends on the economy, until the economy improves. Those positions are traps that paralyze you. Total responsibility gives you back the power: you decide, you act, you change. It's not blame — it's agency.`,
  },
  {
    id: "C42",
    titulo: "Continuous financial education",
    capsula: `This book isn't the destination, it's the starting point. Every book, podcast, mentor, and honest conversation about money you add to your life is another stone in your foundation. Financial education has the highest ROI of any asset.`,
    explicacion: `The mistake is reading one book and going back to the routine. Knowledge without depth fades. The book's recommendation: 3-4 finance books a year, 1 podcast a week, 1 monthly conversation with someone further ahead than you. It's not to "know more" — it's so financial decisions become natural. Financial education has an extraordinary ROI because each new concept saves you bad decisions for the rest of your life. A good decision at 25 saves you hundreds of thousands by 60. That's the real math.`,
  },
  {
    id: "C43",
    titulo: "How you know you're making progress",
    capsula: `1) Your savings rate rises. 2) Your debt falls. 3) Your emergency fund grows. 4) Your passive income starts to appear. 5) Your financial stress drops. If these 5 signals happen, you're on track — even if you don't see big figures yet.`,
    explicacion: `Big figures are noise. The true signals of progress are subtler but more reliable. Your savings rate rising from 5% to 10%, then 15%, then 20%, without the absolute figure being spectacular. Your total debt dropping even $200 a month. Your emergency fund going from zero to covering 1 month, then 3, then 6. Receiving your first $50 dividend — not for the figure, but for what it represents: the system working. Stopping thinking about money when you go to sleep. Those are the real signals.`,
  },
  {
    id: "C44",
    titulo: "How to accelerate your path",
    capsula: `1) Raise your income. 2) Cut your spending. 3) Raise your investment return. 4) Create multiple streams. 5) Reinvest your gains. Every extra $500 a month (income or saving) accelerates your freedom by 1-2 years. All 5 together: 5-7 years faster.`,
    explicacion: `Acceleration isn't magic — it's math. Every extra $500 that comes in or that you stop spending is $500 that goes to investing. That $500 at, say, 8% over 20 years becomes $295,000. Add a second income source, optimize your return with better allocation, reinvest your dividends instead of spending them, and the timeline compresses drastically. You go from 25 years to freedom to 12-15 years. It's not revolution — it's fine-tuning applied consistently. The five levers together are more powerful than any single one maxed out.`,
  },
  {
    id: "C45",
    titulo: "From consumer to investor",
    capsula: `The most important mental shift: you stop thinking "what can I buy?" and start thinking "where can I invest?" Same money, opposite decision. That shift is the dividing line between those who consume their life and those who build their freedom.`,
    explicacion: `Most people look at money through the lens of consumption. They receive their paycheck and immediately think about what they can buy with it. Investment decisions are residual — "I'll invest whatever's left." And nothing's ever left. The identity shift reverses the order: first you invest, then you consume. First you think about where to put that money so it grows, then what needs to cover with what remains. Same money, opposite decisions, opposite results. That mental shift, held over time, is what separates the 99% from the 1%.`,
  },
  {
    id: "C46",
    titulo: "Peace of mind as the first result",
    capsula: `The first change you'll feel isn't financial — it's emotional. When your emergency fund is complete (3-6 months of expenses), you sleep differently. That peace of mind is the system's first gift. And it comes fast.`,
    explicacion: `Many people expect financial freedom to arrive as a dramatic event: the day you reach your Number. Reality is more gradual and more kind. The first change comes fast — between 6 and 18 months, when you complete your emergency fund. Suddenly the everyday crises (car, health, a work problem) stop being catastrophic because you have a cushion. You sleep better. Your partner sees you more relaxed. You argue less about money. That early peace of mind is what sustains the system through the years when the big results are still far off.`,
  },
  {
    id: "C47",
    titulo: "Consistency builds legacy",
    capsula: `After 10+ years of consistency, you don't just have financial freedom. You have wealth to pass to your children. You change your family's trajectory, not just your own life. That's the difference between building wealth and building legacy.`,
    explicacion: `Personal financial freedom is the first level. Legacy is the second. When your system keeps running 10, 15, 20 years, what you built starts to transcend your own life. Your children inherit not just money, but financial education, habits, mindset. The possibilities for your grandchildren change. The trajectory of an entire family line changes. That's the difference between building wealth for yourself and building legacy for your bloodline. And it doesn't require being a millionaire — it requires consistency over decades. Compound interest applied to generations.`,
  },
  {
    id: "C48",
    titulo: "Sharing what you learn",
    capsula: `Knowledge shared is knowledge consolidated and multiplied. When you teach something, you learn it twice. When you help someone else build their system, you reinforce your own. Personal financial freedom is good. The freedom you help build in others is transformative.`,
    explicacion: `There's a paradoxical phenomenon in financial education: teaching it reinforces your own discipline. When you explain to a friend how compound interest works, you learn it more deeply. When you help a family member build their budget, yours gets more solid. When you guide someone just starting, you reconnect with the why of your own path. Sharing isn't selfless altruism — it's one of the most powerful tools for learning and consolidation. And it multiplies the impact: your path helps others avoid the traps you fell into.`,
  },
  {
    id: "C49",
    titulo: "The urge to complete",
    capsula: `Inside the human psyche there's an "urge to complete." When you procrastinate, that urge generates chronic stress. Every open task drains energy that should go to building wealth. Rule: do it, complete it, close it.`,
    explicacion: `This has been identified as one of the 6 roots of stress that block financial freedom. Your mind has a limited capacity for open tasks — each pending thing consumes cognitive resources in the background, even when you're not consciously thinking about it. The unpaid bill, the unfiled paperwork, the postponed conversation. Each one drains. The solution isn't to organize better — it's to complete. Do today what can be done today. Close loops. Pay what's owed. The feeling of "everything's up to date" frees mental energy you can redirect toward building.`,
  },
  {
    id: "C50",
    titulo: "The day you decide you're different",
    capsula: `There's a moment that marks the before and after. It isn't when an inheritance arrives. It isn't when you earn more. It's when you decide — in the depths of your gut — that you won't be the same person with money again. That moment can be today.`,
    explicacion: `This is the point the book insists is the real beginning. It's not reading this book. It's not understanding the concepts. It's the single, internal moment when you decide you're different with money. That you won't go back to being the person who spent without thinking, who put off saving, who avoided looking at their accounts, who blamed the system. That decision requires no money or special circumstances — it requires clarity. And once made, all the book's techniques start to work, because there's now someone inside who can execute them. Without that decision, no system works. With it, any system works.`,
  },
];

// ============================================================================
// Reminders of the day (30 anchor lines)
// ============================================================================

export const COACH_REMINDERS: string[] = [
  `"Wealth isn't complicated. It's a system."`,
  `"The difference between rich people and poor people isn't the amount of money they earn. It's what they do with the money they earn." — Warren Buffett`,
  `"What gets measured gets improved. And what gets written down becomes real."`,
  `"Do today what others aren't willing to do. Tomorrow you'll have what others can't have."`,
  `"Pay yourself first. If you don't see the money, you don't miss it."`,
  `"Delaying gratification doesn't mean depriving yourself of living. It means spending better, not spending less."`,
  `"Time is your best friend. Every year you do NOT start is a compounding year you NEVER get back."`,
  `"The right question isn't 'why do they earn more?' but 'who do I have to become to earn what they earn?'"`,
  `"Success follows systems, not surnames. You bring the execution."`,
  `"Your financial past doesn't determine your financial future."`,
  `"Consistency beats brilliance."`,
  `"Your greatest asset isn't in the bank — it's between your ears."`,
  `"What isn't written down doesn't exist for the subconscious."`,
  `"A goal without a date is a dream."`,
  `"Rich people aren't smarter than you. They have a system that automates building wealth."`,
  `"There are no shortcuts. There are systems. And those who run them, win."`,
  `"Financial freedom isn't the end of the road. It's the starting point of the road you actually chose."`,
  `"Without purpose, money is a destination. With purpose, it's a vehicle."`,
  `"People without goals are doomed to work for those who have them."`,
  `"What you fear is exactly where your next growth is."`,
  `"Your financial thermostat determines your material life more than your salary."`,
  `"The first expense of the month is to yourself."`,
  `"Every conscious decision today builds tomorrow's freedom."`,
  `"Consumption is easy. Building requires intention."`,
  `"Start imperfect. Adjust along the way. Learn by doing."`,
  `"What you believe, you create."`,
  `"I am responsible. No one can make me feel anything without my permission."`,
  `"Financial freedom begins the day you decide you're different with money."`,
  `"There's no perfect moment. There's this moment, and nothing more."`,
  `"Compound interest rewards consistency, not intelligence."`,
];

// ============================================================================
// Challenges of the week (15 challenges)
// ============================================================================

export const COACH_CHALLENGES: CoachChallenge[] = [
  {
    id: "R01",
    titulo: "The Thermostat Challenge",
    descripcion: `This week, write three numbers on paper: your average income over the last 12 months, the most you earned in a single month, and what you'd want to earn 2 years from now. Divide the third by the first. That ratio is the gap the system needs to close.`,
  },
  {
    id: "R02",
    titulo: "The Real Cost Challenge",
    descripcion: `Pick ONE recurring or large expense you made last month. Calculate its real cost: what that money would be worth invested at, say, 8% over 10 years. Compare that figure with what you got. Would you make the purchase again knowing that?`,
  },
  {
    id: "R03",
    titulo: "The 30-Day Challenge",
    descripcion: `This week, for any non-essential purchase over $100, write it on a list with the date. Wait 30 days before buying it. If in 30 days you still want it, buy it. If not, you avoided an impulse buy. Keep count.`,
  },
  {
    id: "R04",
    titulo: "The Automatic Saving Challenge",
    descripcion: `If you haven't already, this week set up an automatic transfer of 10% (or whatever you can) of your income to a separate account on payday. It doesn't have to be perfect — it has to exist. You raise the % later.`,
  },
  {
    id: "R05",
    titulo: "The Subscriptions Challenge",
    descripcion: `This week review ALL your active subscriptions (Netflix, Spotify, gym, apps, software, platforms). Calculate the monthly and annual total. Cancel the ones you used fewer than 3 times last month. Note how much you saved and send it to investing.`,
  },
  {
    id: "R06",
    titulo: "The Diagnostic Challenge",
    descripcion: `This week complete the 10 steps of the Financial Diagnostic from Chapter 3: net income, total expenses, monthly saving, savings rate, total debt, debt-to-income ratio, emergency fund, net worth. It's the starting photo. Without it you can't measure progress.`,
  },
  {
    id: "R07",
    titulo: "The Purpose Challenge",
    descripcion: `This week, complete this sentence with real honesty: "I am building this wealth to be able to ___, for the year ___, because I want to contribute ___." Write it on paper. Put it where you'll see it. That sentence is your compass.`,
  },
  {
    id: "R08",
    titulo: "The Negotiation Challenge",
    descripcion: `This week call ONE service provider (internet, phone, insurance) and negotiate. Say you saw competitor offers and ask for a better rate. Typical success rate: 50-60%. Typical monthly saving: $30-80. That saving goes straight to investing.`,
  },
  {
    id: "R09",
    titulo: "The Small-Leak Challenge",
    descripcion: `This week, add up every coffee out, snack, and purchase under $10. Write it all down. At the end of the week, multiply by 4 for the monthly cost. Then by 12 for the annual. It'll probably surprise you.`,
  },
  {
    id: "R10",
    titulo: "The Categorization Challenge",
    descripcion: `This week, review the last 30 expenses on your bank account. Mark each one as Essential / Style / Freedom. How many were truly Essential? How many were automatic Style with no conscious enjoyment? That reading alone changes your next month.`,
  },
  {
    id: "R11",
    titulo: "The Credit Score Challenge",
    descripcion: `This week, get your credit report (in many countries it's free once a year). Check it for errors — 20% of reports have errors that unfairly lower the score. If you find errors, dispute them. One correction can raise your score 30-50 points.`,
  },
  {
    id: "R12",
    titulo: "The Minimum Investment Challenge",
    descripcion: `If you've never invested, this week open a brokerage account (Interactive Brokers, Fidelity, or the equivalent in your country). You do NOT have to invest big — just open it. The "I don't know how" psychological barrier is bigger than the real one. Once it's open, buy $50 of an S&P 500 index fund. You started.`,
  },
  {
    id: "R13",
    titulo: "The Conversation Challenge",
    descripcion: `This week talk about money with someone — partner, friend, family. Not to show off, not to complain — to share what you're learning. The book's rule: knowledge shared is knowledge consolidated. And sometimes, that conversation opens something in the other person too.`,
  },
  {
    id: "R14",
    titulo: "The Extra Book Challenge",
    descripcion: `This week start ONE more book on finance. Any from the book's list: "The Millionaire Next Door," "Rich Dad Poor Dad," "The Intelligent Investor," "Atomic Habits," "Secrets of the Millionaire Mind." Financial education has the highest ROI of any asset.`,
  },
  {
    id: "R15",
    titulo: "The Letter to the Future Challenge",
    descripcion: `This week write a letter to yourself 2 years from now. Describe the process you're starting, what scares you, what you hope to achieve. Seal it in an envelope. Open it in 2 years. You'll see how much you changed — and that reinforces your identity as a wealth builder.`,
  },
];
