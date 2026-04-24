// components/terms-section.tsx
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

interface Subsection {
  title?: string;
  content: string | string[];
}

interface Section {
  title: string;
  description?: string;
  subsections: Subsection[];
}

export function TermsSection({ section }: { section: Section }) {
  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>{section.title}</CardTitle>
        {section.description && <CardDescription>{section.description}</CardDescription>}
      </CardHeader>

      <CardContent className="space-y-4">
        {section.subsections.map((sub, i) => (
          <div key={i} className="space-y-2">
            {sub.title && <h3 className="text-lg font-medium">{sub.title}</h3>}

            {Array.isArray(sub.content) ? (
              <ul className="list-disc pl-5 space-y-2">
                {sub.content.map((item, idx) => (
                  <li key={idx} dangerouslySetInnerHTML={{ __html: item }} />
                ))}
              </ul>
            ) : (
              <p>{sub.content}</p>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
