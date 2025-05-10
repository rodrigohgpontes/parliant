'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useUser } from '@auth0/nextjs-auth0';
import { toast } from 'sonner';
import { ChevronRight, Copy, Check } from 'lucide-react';

interface UsageStats {
    surveys: number;
    responses: number;
    monthlyData: {
        month: string;
        surveys: number;
        responses: number;
    }[];
}

interface SubscriptionPlan {
    id: string;
    name: string;
    price: number;
    features: string[];
    limits: {
        surveys: number;
        responses: number;
    };
    isPopular?: boolean;
    isEnterprise?: boolean;
}

const plans: SubscriptionPlan[] = [
    {
        id: 'free',
        name: 'Free',
        price: 0,
        features: [
            'Up to 3 surveys',
            '100 responses per month',
            'Basic analytics'
        ],
        limits: {
            surveys: 3,
            responses: 100
        }
    },
    {
        id: 'pro',
        name: 'Pro',
        price: 49,
        features: [
            'Unlimited surveys',
            '1,000 responses per month'
        ],
        limits: {
            surveys: Infinity,
            responses: 1000
        },
        isPopular: true
    },
    {
        id: 'enterprise',
        name: 'Enterprise',
        price: -1,
        features: [
            'Unlimited everything',
            'Dedicated support',
            'Custom branding'
        ],
        limits: {
            surveys: Infinity,
            responses: Infinity
        },
        isEnterprise: true
    }
];

export default function SubscriptionPage() {
    const { user } = useUser();
    const [currentPlan, setCurrentPlan] = useState<string>('free');
    const [usageStats, setUsageStats] = useState<UsageStats>({
        surveys: 0,
        responses: 0,
        monthlyData: []
    });
    const [loading, setLoading] = useState(true);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (user) {
            fetchSubscriptionStatus();
            fetchUsageStats();
        }
    }, [user]);

    const fetchSubscriptionStatus = async () => {
        try {
            const response = await fetch('/api/subscription');
            const data = await response.json();
            setCurrentPlan(data.subscription?.plan || 'free');
        } catch (error) {
            toast.error('Failed to fetch subscription status');
        }
    };

    const fetchUsageStats = async () => {
        try {
            const response = await fetch('/api/subscription/usage');
            const data = await response.json();
            setUsageStats(data);
            setLoading(false);
        } catch (error) {
            toast.error('Failed to fetch usage statistics');
            setLoading(false);
        }
    };

    const handleSubscribe = async (planId: string) => {
        try {
            const response = await fetch('/api/subscription', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ plan: planId }),
            });

            if (!response.ok) {
                throw new Error('Failed to update subscription');
            }

            toast.success(`Successfully subscribed to ${planId} plan`);
            setCurrentPlan(planId);
        } catch (error) {
            toast.error('Failed to update subscription');
        }
    };

    const handleCancel = async () => {
        try {
            const response = await fetch('/api/subscription', {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error('Failed to cancel subscription');
            }

            toast.success('Subscription cancelled successfully');
            setCurrentPlan('free');
        } catch (error) {
            toast.error('Failed to cancel subscription');
        }
    };

    const handleCopyEmail = async () => {
        try {
            await navigator.clipboard.writeText('enterprise@parliant.ai');
            setCopied(true);
            toast.success('Email copied to clipboard');
            setTimeout(() => setCopied(false), 2000);
        } catch (error) {
            toast.error('Failed to copy email');
        }
    };

    if (loading) {
        return (
            <div className="container mx-auto py-8 px-4">
                <div className="flex items-center justify-center h-64">
                    <p className="text-muted-foreground">Loading subscription information...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-8 px-4">
            <h1 className="text-3xl font-bold mb-8">Subscription Management</h1>

            <Tabs defaultValue="plans" className="space-y-6">
                <TabsList>
                    <TabsTrigger value="plans">Subscription Plans</TabsTrigger>
                    <TabsTrigger value="usage">Usage Statistics</TabsTrigger>
                </TabsList>

                <TabsContent value="plans" className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {plans.map((plan) => (
                            <Card
                                key={plan.id}
                                className={`${currentPlan === plan.id ? 'border-primary' : ''} ${plan.isPopular ? 'bg-primary/5 border-primary shadow-sm' : ''}`}
                            >
                                <CardHeader>
                                    {plan.isPopular && (
                                        <div className="inline-block rounded-full bg-primary px-3 py-1 text-xs text-primary-foreground mb-2">
                                            Popular
                                        </div>
                                    )}
                                    <CardTitle className="flex items-center gap-2">
                                        {plan.name}
                                        {currentPlan === plan.id && (
                                            <span className="text-sm font-normal text-muted-foreground">(Current)</span>
                                        )}
                                    </CardTitle>
                                    <CardDescription>
                                        {plan.price === -1 ? 'Custom' : `$${plan.price}/month`}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <ul className="space-y-2">
                                        {plan.features.map((feature, index) => (
                                            <li key={index} className="flex items-center">
                                                <ChevronRight className="mr-2 h-4 w-4 text-primary" />
                                                {feature}
                                            </li>
                                        ))}
                                    </ul>
                                </CardContent>
                                <CardFooter className="flex flex-col gap-2">
                                    {plan.isEnterprise ? (
                                        <>
                                            <Button
                                                variant="outline"
                                                className="w-full"
                                                onClick={() => window.location.href = 'mailto:enterprise@parliant.ai'}
                                            >
                                                Contact sales
                                            </Button>
                                            <div className="flex items-center justify-center gap-2">
                                                <p className="text-sm text-muted-foreground">
                                                    enterprise@parliant.ai
                                                </p>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-6 w-6"
                                                    onClick={handleCopyEmail}
                                                >
                                                    {copied ? (
                                                        <Check className="h-4 w-4 text-green-500" />
                                                    ) : (
                                                        <Copy className="h-4 w-4" />
                                                    )}
                                                </Button>
                                            </div>
                                        </>
                                    ) : currentPlan === plan.id ? (
                                        plan.id !== 'free' && (
                                            <Button
                                                variant="destructive"
                                                onClick={handleCancel}
                                                className="w-full"
                                            >
                                                Cancel Subscription
                                            </Button>
                                        )
                                    ) : (
                                        <Button
                                            onClick={() => handleSubscribe(plan.id)}
                                            className="w-full"
                                        >
                                            {plan.price === 0 ? 'Downgrade' : 'Upgrade'}
                                        </Button>
                                    )}
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                </TabsContent>

                <TabsContent value="usage" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Current Usage</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-lg font-medium mb-2">Surveys</h3>
                                    <Progress value={(usageStats.surveys / (currentPlan === 'free' ? 3 : Infinity)) * 100} />
                                    <p className="text-sm text-muted-foreground mt-1">
                                        {usageStats.surveys} of {currentPlan === 'free' ? '3' : 'Unlimited'} surveys used
                                    </p>
                                </div>
                                <div>
                                    <h3 className="text-lg font-medium mb-2">Responses</h3>
                                    <Progress value={(usageStats.responses / (currentPlan === 'free' ? 100 : 1000)) * 100} />
                                    <p className="text-sm text-muted-foreground mt-1">
                                        {usageStats.responses} of {currentPlan === 'free' ? '100' : '1000'} responses used this month
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Monthly Statistics</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="h-[300px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={usageStats.monthlyData}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="month" />
                                        <YAxis />
                                        <Tooltip />
                                        <Bar dataKey="surveys" fill="#8884d8" name="Surveys" />
                                        <Bar dataKey="responses" fill="#82ca9d" name="Responses" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
} 