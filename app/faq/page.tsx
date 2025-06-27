import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default function FAQPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold mb-4">Frequently Asked Questions</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Find answers to common questions about Vespera AI Chatbot
        </p>
      </div>

      <div className="max-w-4xl mx-auto space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>What is Vespera AI Chatbot?</CardTitle>
            <CardDescription>
              Vespera AI is an advanced chatbot platform that helps businesses
              automate their customer interactions using cutting-edge AI
              technology.
            </CardDescription>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>How does the pricing work?</CardTitle>
            <CardDescription>
              We offer three tiers: Core ($150/month), Professional
              ($350/month), and Enterprise ($750/month). Each plan includes
              different message limits and features. Annual and three-year
              commitments come with additional discounts.
            </CardDescription>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>What are the message limits?</CardTitle>
            <CardDescription>
              Core plan includes up to 200 messages per day, Professional plan
              offers up to 1,000 messages per day, and Enterprise plan provides
              unlimited messages.
            </CardDescription>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>What kind of support do you offer?</CardTitle>
            <CardDescription>
              Core plan includes 9 am - 6 pm support, Professional plan offers
              24/7 technical support, and Enterprise plan provides 24/7 all
              support including dedicated account management.
            </CardDescription>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Can I try before I buy?</CardTitle>
            <CardDescription>
              Yes! We offer a 14-day free trial for all plans. No credit card
              required to start.
            </CardDescription>
          </CardHeader>
        </Card>

        <div className="text-center mt-12">
          <h2 className="text-2xl font-bold mb-4">Still have questions?</h2>
          <p className="text-muted-foreground mb-4">
            Contact our support team or check out our pricing plans for more
            details.
          </p>
          <a
            href="/pricing"
            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
          >
            View Pricing Plans
          </a>
        </div>
      </div>
    </div>
  );
}
