'use client';

import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface TabsExampleProps {
  title?: string;
  tabs: {
    id: string;
    label: string;
    content: React.ReactNode;
  }[];
  defaultValue?: string;
  className?: string;
}

export function TabsExample({
  title,
  tabs,
  defaultValue,
  className,
}: TabsExampleProps) {
  return (
    <div className={className}>
      {title && (
        <div className="mb-4">
          <h3 className="text-lg font-semibold">{title}</h3>
        </div>
      )}

      <Tabs defaultValue={defaultValue || tabs[0]?.id} className="w-full">
        <TabsList
          className="grid w-full"
          style={{ gridTemplateColumns: `repeat(${tabs.length}, 1fr)` }}
        >
          {tabs.map((tab) => (
            <TabsTrigger key={tab.id} value={tab.id}>
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {tabs.map((tab) => (
          <TabsContent key={tab.id} value={tab.id} className="mt-4">
            {tab.content}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

// Example usage component
export function ExampleTabs() {
  return (
    <TabsExample
      title="Document Analysis"
      tabs={[
        {
          id: 'overview',
          label: 'Overview',
          content: (
            <Card>
              <CardHeader>
                <CardTitle>Document Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <p>This is the overview content for the document analysis.</p>
              </CardContent>
            </Card>
          ),
        },
        {
          id: 'details',
          label: 'Details',
          content: (
            <Card>
              <CardHeader>
                <CardTitle>Detailed Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <p>This contains the detailed analysis information.</p>
              </CardContent>
            </Card>
          ),
        },
        {
          id: 'actions',
          label: 'Actions',
          content: (
            <Card>
              <CardHeader>
                <CardTitle>Available Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Here are the available actions for this document.</p>
              </CardContent>
            </Card>
          ),
        },
      ]}
    />
  );
}
