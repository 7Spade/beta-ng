
'use client';

import type { FC } from 'react';
import type { Partner } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Star } from 'lucide-react';

const RatingStars: FC<{ rating: number }> = ({ rating }) => (
    <div className="flex items-center">
        {[...Array(5)].map((_, i) => (
            <Star key={i} className={`h-5 w-5 ${i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
        ))}
    </div>
);

interface PerformanceTabProps {
    partner: Partner;
}

export const PerformanceTab: FC<PerformanceTabProps> = ({ partner }) => {
    return (
        <Card>
            <CardHeader>
              <CardTitle>績效評估</CardTitle>
              <CardDescription>{partner.name} 的績效歷史與備註。</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {partner.performanceReviews && partner.performanceReviews.length > 0 ? partner.performanceReviews.map(review => (
                <div key={review.id} className="border-b pb-4 last:border-b-0">
                  <div className="flex justify-between items-center mb-2">
                    <RatingStars rating={review.rating} />
                    <span className="text-sm text-muted-foreground">{new Date(review.date).toLocaleDateString()} 由 {review.reviewer} 評分</span>
                  </div>
                  <p className="text-muted-foreground">{review.notes}</p>
                </div>
              )) : (
                 <div className="text-center text-muted-foreground py-8">找不到績效評估。</div>
              )}
            </CardContent>
        </Card>
    );
};
