import { Button } from "@/components/ui/button";
import { ChevronRight, BarChart3, Clock, MessageSquare } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-20 md:py-32 bg-gradient-to-b from-background to-muted/50">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
              <div className="space-y-4">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tighter">
                  Transform feedback with AI-powered conversational surveys
                </h1>
                <p className="text-xl text-muted-foreground md:text-2xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Get deeper insights through natural conversational surveys. No rigid forms—just AI-guided conversations that encourage honest, complete answers.
                </p>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Link href="/signup">
                    <Button size="lg" className="h-12 px-6">
                      Get started—it's free
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="mx-auto lg:ml-auto flex items-center justify-center w-full pointer-events-none">
                <div className="w-full max-w-[650px] h-[550px] bg-white rounded-xl shadow-lg overflow-hidden flex flex-col">
                  {/* Chat Header */}
                  <div className="bg-primary/5 p-3 sm:p-4 border-b">
                    <h3 className="font-medium text-base sm:text-lg">Customer Feedback Survey</h3>
                    <p className="text-xs sm:text-sm text-muted-foreground">Understanding your experience with our product</p>
                  </div>

                  {/* Chat Messages */}
                  <div className="flex-1 p-3 sm:p-4 space-y-3 sm:space-y-4 overflow-y-auto">
                    {/* AI Initial Message */}
                    <div className="flex items-start gap-2 sm:gap-3">
                      <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <span className="text-xs sm:text-sm font-medium text-primary">AI</span>
                      </div>
                      <div className="flex-1">
                        <div className="bg-muted rounded-lg p-2 sm:p-3 max-w-[85%] sm:max-w-[80%]">
                          <p className="text-sm sm:text-base">Hi! I'd like to understand your experience with our product. What made you choose it?</p>
                        </div>
                      </div>
                    </div>

                    {/* User Response */}
                    <div className="flex items-start gap-2 sm:gap-3 justify-end">
                      <div className="flex-1">
                        <div className="bg-primary text-primary-foreground rounded-lg p-2 sm:p-3 max-w-[85%] sm:max-w-[80%] ml-auto">
                          <p className="text-sm sm:text-base">I was looking for something that could help me understand my customers better. The AI-powered approach seemed interesting.</p>
                        </div>
                      </div>
                      <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-primary flex items-center justify-center shrink-0">
                        <span className="text-xs sm:text-sm font-medium text-primary-foreground">U</span>
                      </div>
                    </div>

                    {/* AI Follow-up */}
                    <div className="flex items-start gap-2 sm:gap-3">
                      <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <span className="text-xs sm:text-sm font-medium text-primary">AI</span>
                      </div>
                      <div className="flex-1">
                        <div className="bg-muted rounded-lg p-2 sm:p-3 max-w-[85%] sm:max-w-[80%]">
                          <p className="text-sm sm:text-base">That's great! Could you tell me more about what specific customer insights you were hoping to gain?</p>
                        </div>
                      </div>
                    </div>

                    {/* User Detailed Response */}
                    <div className="flex items-start gap-2 sm:gap-3 justify-end">
                      <div className="flex-1">
                        <div className="bg-primary text-primary-foreground rounded-lg p-2 sm:p-3 max-w-[85%] sm:max-w-[80%] ml-auto">
                          <p className="text-sm sm:text-base">I wanted to understand why customers were leaving our platform. Traditional surveys weren't giving us the depth we needed, and I thought an AI conversation might help get more honest, detailed feedback.</p>
                        </div>
                      </div>
                      <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-primary flex items-center justify-center shrink-0">
                        <span className="text-xs sm:text-sm font-medium text-primary-foreground">U</span>
                      </div>
                    </div>
                  </div>

                  {/* Input Area */}
                  <div className="p-3 sm:p-4 border-t bg-muted/30">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-background rounded-full px-3 sm:px-4 py-2 text-xs sm:text-sm">
                        Type your message...
                      </div>
                      <button className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center shrink-0">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="sm:w-4 sm:h-4">
                          <path d="m22 2-7 20-4-9-9-4Z" />
                          <path d="M22 2 11 13" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Survey Experience Section */}
        <section className="py-12" style={{ background: 'linear-gradient(135deg, rgba(255, 127, 80, 0.3) 0%, rgba(255, 127, 80, 0.15) 100%)' }}>
          <div className="container px-4 md:px-6">
            <div className="flex justify-center">
              <div className="relative max-w-xl w-full p-6 border rounded-xl bg-card shadow-md" style={{ borderColor: 'rgba(255, 127, 80, 0.4)' }}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full" style={{ background: 'rgba(255, 127, 80, 0.2)' }}>
                    <div className="flex items-center justify-center h-full">
                      <MessageSquare className="h-6 w-6" style={{ color: 'rgb(255, 127, 80)' }} />
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold" style={{ color: 'rgb(205, 80, 45)' }}>Try responding to a survey now</h3>
                </div>
                <p className="text-md mb-6">
                  See for yourself how our AI conversations feel compared to traditional surveys.
                </p>
                <div className="flex justify-center">
                  <Link href="https://www.parliant.ai/surveys/51536356-8ca6-45a4-a9f4-4bfcb9ef9421" target="_blank" rel="noopener noreferrer">
                    <Button className="w-full" size="lg" style={{
                      backgroundColor: 'rgb(205, 80, 45)',
                      borderColor: 'rgb(205, 80, 45)',
                      color: 'white',
                      width: '220px'
                    }}>
                      Respond now
                      <ChevronRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* What is it Section */}
        <section id="what-is-it" className="py-20 bg-background">
          <div className="container px-4 md:px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                Parliant.AI helps you understand customers
              </h2>
              <p className="mx-auto mt-4 max-w-[700px] text-muted-foreground md:text-xl">
                Our AI conducts natural conversations that feel human, encouraging honest and detailed responses.
              </p>
            </div>
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
              <div className="space-y-4 order-2 lg:order-1">
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold">OPEN-ENDED SURVEYS</h3>
                  <p className="text-3xl font-bold md:text-4xl">Get richer qualitative data</p>
                  <p className="text-muted-foreground md:text-xl">
                    When your surveys feel like conversations, people share more. Our AI asks relevant follow-up
                    questions and adapts to responses in real-time. Respondents can type or speak their answers.
                  </p>
                </div>
                <Link href="/signup">
                  <Button className="mt-4">Sign up</Button>
                </Link>
              </div>
              <div className="mx-auto order-1 lg:order-2">
                <div className="flex flex-col lg:flex-row gap-6 items-center">

                  <div className="border rounded-lg p-6 bg-[#1a1a2e] text-white w-full max-w-md pointer-events-none">
                    <div className="flex flex-col items-center gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">Insight Level</span>
                      </div>
                      <div className="relative h-4 w-full bg-white/10 rounded-full">
                        <div
                          className="absolute left-0 h-full transition-all duration-500 rounded-full"
                          style={{
                            width: "60%",
                            backgroundColor: "rgba(255, 127, 80, 0.8)"
                          }}
                        />
                        <div
                          className="absolute top-1/2 -translate-y-1/2 flex items-center justify-center w-8 h-8 rounded-full text-white text-lg font-bold transition-all duration-500 z-10"
                          style={{
                            left: "calc(60% - 16px)",
                            backgroundColor: "rgba(255, 127, 80, 0.8)"
                          }}
                        >
                          6
                        </div>
                      </div>
                      <div className="text-sm w-full text-left mt-4">
                        <p className="font-medium mb-2">Current Evaluation:</p>
                        <p>
                          Good responses with clear points, but could benefit from more specific examples and personal experiences.
                          Consider elaborating on how these insights have impacted your decision-making process and what specific
                          outcomes you've observed.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section id="benefits" className="py-20 bg-muted/50">
          <div className="container px-4 md:px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                With a superior form of data collection
              </h2>
            </div>
            <div className="grid gap-8 md:grid-cols-3">
              <div className="bg-card p-6 rounded-lg shadow-sm">
                <div className="mb-4 text-primary">
                  <Clock className="h-10 w-10" />
                </div>
                <h3 className="text-xl font-bold mb-2">Create in minutes, not hours</h3>
                <p className="text-muted-foreground">
                  No need to design forms or phrase perfect questions. Simply tell our AI what insights you need, and it
                  creates the entire conversation flow.
                </p>
              </div>
              <div className="bg-card p-6 rounded-lg shadow-sm">
                <div className="mb-4 text-primary">
                  <MessageSquare className="h-10 w-10" />
                </div>
                <h3 className="text-xl font-bold mb-2">Gathers deeper insights</h3>
                <p className="text-muted-foreground">
                  Our AI asks intelligent follow-up questions based on previous answers, encouraging participants to
                  elaborate and share meaningful insights.
                </p>
              </div>
              <div className="bg-card p-6 rounded-lg shadow-sm">
                <div className="mb-4 text-primary">
                  <BarChart3 className="h-10 w-10" />
                </div>
                <h3 className="text-xl font-bold mb-2">Analyzes qualitative data</h3>
                <p className="text-muted-foreground">
                  Automatically categorizes responses, identifies themes, and extracts actionable insights from
                  open-ended answers without manual coding.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-20 bg-background">
          <div className="container px-4 md:px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                Simple, transparent pricing
              </h2>
              <p className="mx-auto mt-4 max-w-[700px] text-muted-foreground md:text-xl">
                Choose the plan that's right for your research needs
              </p>
            </div>
            <div className="grid gap-6 md:grid-cols-3">
              <div className="border rounded-lg p-6 bg-card">
                <h3 className="text-xl font-bold">Free</h3>
                <div className="mt-4 mb-6">
                  <span className="text-3xl font-bold">$0</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
                <ul className="space-y-2 mb-6">
                  <li className="flex items-center">
                    <ChevronRight className="mr-2 h-4 w-4 text-primary" />
                    <span>Up to 3 surveys</span>
                  </li>
                  <li className="flex items-center">
                    <ChevronRight className="mr-2 h-4 w-4 text-primary" />
                    <span>100 responses per month</span>
                  </li>
                  <li className="flex items-center">
                    <ChevronRight className="mr-2 h-4 w-4 text-primary" />
                    <span>Basic analytics</span>
                  </li>
                </ul>
                <Link href="/signup">
                  <Button className="w-full" variant="outline">
                    Get started
                  </Button>
                </Link>
              </div>
              <div className="border rounded-lg p-6 bg-primary/5 border-primary shadow-sm">
                <div className="inline-block rounded-full bg-primary px-3 py-1 text-xs text-primary-foreground mb-2">
                  Popular
                </div>
                <h3 className="text-xl font-bold">Pro</h3>
                <div className="mt-4 mb-6">
                  <span className="text-3xl font-bold">$49</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
                <ul className="space-y-2 mb-6">
                  <li className="flex items-center">
                    <ChevronRight className="mr-2 h-4 w-4 text-primary" />
                    <span>Unlimited surveys</span>
                  </li>
                  <li className="flex items-center">
                    <ChevronRight className="mr-2 h-4 w-4 text-primary" />
                    <span>1,000 responses per month</span>
                  </li>
                </ul>
                <Link href="/signup">
                  <Button className="w-full">Get started</Button>
                </Link>
              </div>
              <div className="border rounded-lg p-6 bg-card">
                <h3 className="text-xl font-bold">Enterprise</h3>
                <div className="mt-4 mb-6">
                  <span className="text-3xl font-bold">Custom</span>
                </div>
                <ul className="space-y-2 mb-6">
                  <li className="flex items-center">
                    <ChevronRight className="mr-2 h-4 w-4 text-primary" />
                    <span>Unlimited everything</span>
                  </li>
                  <li className="flex items-center">
                    <ChevronRight className="mr-2 h-4 w-4 text-primary" />
                    <span>Dedicated support</span>
                  </li>
                  <li className="flex items-center">
                    <ChevronRight className="mr-2 h-4 w-4 text-primary" />
                    <span>Custom branding</span>
                  </li>
                </ul>
                <Button className="w-full" variant="outline">
                  Contact sales
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-muted/50">
          <div className="container px-4 md:px-6 text-center">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl mb-4">
              Start getting to know your customers
            </h2>
            <p className="mx-auto mb-6 max-w-[700px] text-muted-foreground md:text-xl">Our Free Plan lets you:</p>
            <div className="flex flex-col sm:flex-row justify-center gap-4 mb-8">
              <div className="flex items-center justify-center">
                <ChevronRight className="mr-2 h-4 w-4 text-primary" />
                <span>Create up to 3 surveys</span>
              </div>
              <div className="flex items-center justify-center">
                <ChevronRight className="mr-2 h-4 w-4 text-primary" />
                <span>Get 100 responses</span>
              </div>
              <div className="flex items-center justify-center">
                <ChevronRight className="mr-2 h-4 w-4 text-primary" />
                <span>Access basic analytics</span>
              </div>
            </div>
            <Link href="/signup">
              <Button size="lg" className="h-12 px-6">
                Sign up
              </Button>
            </Link>
          </div>
        </section>
      </main>

      <div className="flex justify-center items-center flex-col gap-8 my-12">
        <Image src="/logo-large.png" alt="Parliant.AI logo large" width={200} height={200} />

        <div className="mt-3">
          <a href="https://theresanaiforthat.com/ai/parliant-ai/?ref=featured&v=5984822" target="_blank" rel="nofollow">
            <img width="300" src="https://media.theresanaiforthat.com/featured-on-taaft.png?width=600" />
          </a>
        </div>
      </div>

      <footer className="border-t bg-background">
        <div className="container px-4 md:px-6 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <div className="text-lg font-bold">Parliant.AI</div>
              <p className="mt-1 text-sm text-muted-foreground">Open-ended surveys conducted by AI</p>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/terms" className="text-sm text-muted-foreground hover:text-primary">
                Terms of Service
              </Link>
              <Link href="/privacy" className="text-sm text-muted-foreground hover:text-primary">
                Privacy Policy
              </Link>
              <Link href="/contact" className="text-sm text-muted-foreground hover:text-primary">
                Contact
              </Link>
              <p className="text-xs text-muted-foreground">
                © {new Date().getFullYear()} Parliant.AI. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
