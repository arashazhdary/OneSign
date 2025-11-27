'use client';

import { Card } from '@/app/components/ui';

interface Testimonial {
  name: string;
  role: string;
  company: string;
  avatar: string;
  content: string;
  rating: number;
}

const testimonials: Testimonial[] = [
  {
    name: 'Sarah Johnson',
    role: 'CEO',
    company: 'TechCorp Inc.',
    avatar: '👩‍💼',
    content:
      'OneSign has transformed how we handle contracts. The process is now 10x faster and our clients love the seamless experience.',
    rating: 5,
  },
  {
    name: 'Michael Chen',
    role: 'Legal Director',
    company: 'LawFirm Partners',
    avatar: '👨‍💼',
    content:
      'As a law firm, security and compliance are paramount. OneSign exceeds our expectations in both areas while being incredibly user-friendly.',
    rating: 5,
  },
  {
    name: 'Emily Rodriguez',
    role: 'Operations Manager',
    company: 'Global Solutions',
    avatar: '👩‍💻',
    content:
      'The integration with our existing tools was seamless. OneSign has become an essential part of our workflow.',
    rating: 5,
  },
  {
    name: 'David Kumar',
    role: 'Founder',
    company: 'StartupXYZ',
    avatar: '👨‍🚀',
    content:
      'We needed a reliable e-signature solution that could scale with us. OneSign has been perfect, and the pricing is very competitive.',
    rating: 5,
  },
  {
    name: 'Lisa Thompson',
    role: 'HR Director',
    company: 'Enterprise Co.',
    avatar: '👩‍🏫',
    content:
      'Onboarding new employees is so much easier now. OneSign has streamlined our entire HR documentation process.',
    rating: 5,
  },
  {
    name: 'James Wilson',
    role: 'Sales Manager',
    company: 'SalesPro Inc.',
    avatar: '👨‍💼',
    content:
      'Closing deals is faster than ever. Our sales cycle has shortened by 40% since implementing OneSign.',
    rating: 5,
  },
];

export function Testimonials() {
  return (
    <div className="py-16">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Trusted by Thousands
        </h2>
        <p className="text-lg text-gray-600 dark:text-gray-300">
          See what our customers have to say about OneSign
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {testimonials.map((testimonial, index) => (
          <Card key={index} padding="lg" hover className="h-full">
            <div className="flex flex-col h-full">
              {/* Rating Stars */}
              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <svg
                    key={i}
                    className="w-5 h-5 text-yellow-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>

              {/* Content */}
              <p className="text-gray-700 dark:text-gray-300 mb-6 flex-1">
                "{testimonial.content}"
              </p>

              {/* Author */}
              <div className="flex items-center gap-3">
                <div className="text-4xl">{testimonial.avatar}</div>
                <div>
                  <div className="font-semibold text-gray-900 dark:text-white">
                    {testimonial.name}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {testimonial.role}, {testimonial.company}
                  </div>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Stats */}
      <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8">
        <div className="text-center">
          <div className="text-4xl font-bold text-blue-600 mb-2">50K+</div>
          <div className="text-gray-600 dark:text-gray-400">Active Users</div>
        </div>
        <div className="text-center">
          <div className="text-4xl font-bold text-blue-600 mb-2">1M+</div>
          <div className="text-gray-600 dark:text-gray-400">Documents Signed</div>
        </div>
        <div className="text-center">
          <div className="text-4xl font-bold text-blue-600 mb-2">99.9%</div>
          <div className="text-gray-600 dark:text-gray-400">Uptime</div>
        </div>
        <div className="text-center">
          <div className="text-4xl font-bold text-blue-600 mb-2">4.9/5</div>
          <div className="text-gray-600 dark:text-gray-400">Customer Rating</div>
        </div>
      </div>
    </div>
  );
}
