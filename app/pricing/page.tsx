'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Check } from 'lucide-react';
import { openHelpScout, identifyUser } from '@/components/helpscout-beacon';

export default function PricingPage() {
  const handleContactSales = () => {
    // Identify the user if they're logged in (optional for sales inquiries)
    identifyUser('sales-inquiry@vespera.ai', {
      name: 'Sales Inquiry',
      email: 'sales-inquiry@vespera.ai',
      inquiryType: 'Enterprise Sales',
      plan: 'Enterprise',
    });
    openHelpScout();
  };

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold mb-4">Pricing Plans</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Just as we ensure effortless integration, our transparent pricing
          structure removes complexities, enabling you to move forward with
          clarity, confidence and ease.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {/* Core Plan */}
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle className="text-2xl">Core</CardTitle>
            <CardDescription>Small Businesses</CardDescription>
            <div className="mt-4">
              <span className="text-4xl font-bold">$150.00</span>
              <span className="text-muted-foreground">/month</span>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              $0.01 per message
            </p>
          </CardHeader>
          <CardContent className="grow">
            <ul className="space-y-3">
              <li className="flex items-center">
                <Check className="mr-2 size-4 text-green-500" />
                <span>99.99% availability</span>
              </li>
              <li className="flex items-center">
                <Check className="mr-2 size-4 text-green-500" />
                <span>Up to 200 messages per day</span>
              </li>
              <li className="flex items-center">
                <Check className="mr-2 size-4 text-green-500" />
                <span>Basic chat models</span>
              </li>
              <li className="flex items-center">
                <Check className="mr-2 size-4 text-green-500" />
                <span>9 am - 6 pm support</span>
              </li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button className="w-full">Get Started</Button>
          </CardFooter>
        </Card>

        {/* Professional Plan */}
        <Card className="flex flex-col border-primary">
          <CardHeader>
            <CardTitle className="text-2xl">Professional</CardTitle>
            <CardDescription>Medium Businesses</CardDescription>
            <div className="mt-4">
              <span className="text-4xl font-bold">$350.00</span>
              <span className="text-muted-foreground">/month</span>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              $0.001 per message
            </p>
          </CardHeader>
          <CardContent className="grow">
            <ul className="space-y-3">
              <li className="flex items-center">
                <Check className="mr-2 size-4 text-green-500" />
                <span>99.999% availability</span>
              </li>
              <li className="flex items-center">
                <Check className="mr-2 size-4 text-green-500" />
                <span>Up to 1,000 messages per day</span>
              </li>
              <li className="flex items-center">
                <Check className="mr-2 size-4 text-green-500" />
                <span>Advanced chat models</span>
              </li>
              <li className="flex items-center">
                <Check className="mr-2 size-4 text-green-500" />
                <span>24/7 technical support</span>
              </li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button className="w-full" variant="default">
              Get Started
            </Button>
          </CardFooter>
        </Card>

        {/* Enterprise Plan */}
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle className="text-2xl">Enterprise</CardTitle>
            <CardDescription>Large Businesses</CardDescription>
            <div className="mt-4">
              <span className="text-4xl font-bold">$750.00</span>
              <span className="text-muted-foreground">/month</span>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              $0.0001 per message
            </p>
          </CardHeader>
          <CardContent className="grow">
            <ul className="space-y-3">
              <li className="flex items-center">
                <Check className="mr-2 size-4 text-green-500" />
                <span>99.9999% availability</span>
              </li>
              <li className="flex items-center">
                <Check className="mr-2 size-4 text-green-500" />
                <span>Unlimited messages</span>
              </li>
              <li className="flex items-center">
                <Check className="mr-2 size-4 text-green-500" />
                <span>Premium chat models</span>
              </li>
              <li className="flex items-center">
                <Check className="mr-2 size-4 text-green-500" />
                <span>24/7 all support</span>
              </li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button className="w-full" onClick={handleContactSales}>
              Contact Sales
            </Button>
          </CardFooter>
        </Card>
      </div>

      <div className="mt-16 text-center">
        <h2 className="text-2xl font-bold mb-4">
          Smart Reservations, Strategic Savings
        </h2>
        <div className="text-muted-foreground max-w-2xl mx-auto">
          Our annual reservations offer a compelling 10% discount while
          three-year commitments unlock a generous 20% savings, with all
          services leveraging prepaid message credits that can be seamlessly
          replenished as needed.
        </div>
      </div>

      <div className="mt-16 text-center">
        <h2 className="text-2xl font-bold mb-4">
          Experience our features first-hand!
        </h2>
        <Button size="lg" className="mt-4">
          Start 14-Day Free Trial
        </Button>
      </div>
    </div>
  );
}
