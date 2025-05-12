import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const faqs = [
  {
    question: 'What pricing plans do we offer?',
    answer:
      'We offer three distinct plans to cater to businesses of all sizes: Core for small businesses at $150.00 per month, Professional for medium-sized businesses at $350.00 per month, and Enterprise for large businesses at $750.00 per month. Each plan varies in features such as request rates, availability, and support.',
  },
  {
    question: 'How does the per-request pricing work?',
    answer:
      "Depending on your chosen plan, you'll be charged a specific rate for every request made. The Core plan charges $0.01 per request, the Professional plan at $0.001, and the Enterprise plan at just $0.0001 per request.",
  },
  {
    question: 'Is there a difference in availability across the plans?',
    answer:
      'Yes, each plan offers a different level of availability to match your business needs. The Core plan provides 99.99% availability, the Professional bumps that up to 99.999%, while the Enterprise offers an impressive 99.9999% availability.',
  },
  {
    question: 'How many requests per second can I make on each plan?',
    answer:
      'The maximum request rates differ by plan. Core allows up to 100 requests per second, Professional accommodates up to 1,000, and Enterprise can handle a robust 10,000 requests per second.',
  },
  {
    question: 'What kind of support can I expect with my subscription?',
    answer:
      'Our commitment to support varies with each plan. Core users receive support from 9 am to 6 pm. Professional subscribers benefit from 24/7 technical support, while Enterprise subscribers enjoy round-the-clock general support to ensure smooth operations at all times.',
  },
  {
    question: 'How does the referral program work?',
    answer:
      'Our innovative referral program provides you with a unique referral link when you subscribe. If someone subscribes using your referral link, you\'ll receive 10% of all revenue from their subscription for as long as you remain a customer. It\'s our way of saying "thank you" for sharing with your network!',
  },
  {
    question: 'Can I get a discount for paying my invoice early?',
    answer:
      "Absolutely! We value prompt payments. If you pay your invoice within 10 days of receiving it, we offer an Early Payment Discount (EPD) of 2%. For instance, a 2/10 EPD means you'll get a 2% discount if you settle the invoice within 10 days.",
  },
  {
    question: 'What happens if I miss a payment?',
    answer:
      'If any account is overdue by 30 days or more, we reserve the right to suspend the provision of services until the account is settled. Always ensure to address payment issues promptly to avoid service interruptions.',
  },
];

export function PricingFAQ() {
  return (
    <div className="mt-24">
      <h2 className="text-3xl font-bold text-center mb-12">
        Frequently Asked Questions
      </h2>
      <Accordion type="single" collapsible className="max-w-3xl mx-auto">
        {faqs.map((faq, index) => (
          <AccordionItem key={index} value={`item-${index}`}>
            <AccordionTrigger className="text-left">
              {faq.question}
            </AccordionTrigger>
            <AccordionContent>{faq.answer}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
