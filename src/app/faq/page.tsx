'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronDown, HelpCircle } from 'lucide-react';

const FAQ_ITEMS: { q: string; a: string }[] = [
  { q: 'What are your delivery hours?', a: 'We deliver during our business hours. Check the opening time on the menu page. Delivery is available for orders within our service area.' },
  { q: 'Is delivery free?', a: 'Yes. Delivery is free within 5 km. Beyond 5 km, Rs 30 per km is charged. Free delivery may also apply on orders above a certain amount in some areas.' },
  { q: 'How can I track my order?', a: 'After placing an order, go to My Orders and open your order. You can see status (New → Preparing → Ready → On the Way → Delivered) and, when the rider is on the way, live tracking.' },
  { q: 'What payment methods do you accept?', a: 'We accept Cash on Delivery (COD). Pay when your order is delivered.' },
  { q: 'Can I cancel my order?', a: 'Contact us as soon as possible. If the order has not yet been prepared, we may be able to cancel it. Call the store number shown on the order page.' },
  { q: 'Do you have a minimum order?', a: 'Minimum order may apply in some delivery zones. You will see it at checkout if it applies to your address.' },
  { q: 'How do I use a promo code?', a: 'At checkout, enter your promo code in the "Promo code" field and click Apply. The discount will be applied if the code is valid and meets the conditions.' },
  { q: 'Where is Haq Bahu Foods located?', a: 'We are near Pak Arab Society, Opp Awan Market, Lahore. You can order for delivery or pickup.' },
  { q: 'Can I order for pickup?', a: 'Yes. On the menu page, select "Pickup" instead of "Delivery". Pickup orders are ready in about 15 minutes.' },
  { q: 'How do I reorder?', a: 'Go to My Orders, open a past order, and tap "Reorder". The same items will be added to your cart. You can edit the cart and checkout.' },
  { q: 'What if my order is wrong or missing items?', a: 'Contact us immediately with your order number. We will try to resolve it as soon as possible.' },
  { q: 'Do you have vegetarian options?', a: 'We have veggie options including Veggie Duluxe Pizza and other items. Check the menu for details.' },
  { q: 'How do I contact the rider?', a: 'When your order is "On the Way", the order tracking page shows the rider\'s name and a "Call rider" button. Use it to call the rider directly.' },
  { q: 'What is the rider app?', a: 'Delivery riders use the same website. They log in at the Rider Login page (link in the footer) with their PIN to see assigned orders and mark them delivered.' },
  { q: 'Can I reserve a table?', a: 'Yes. We have a table reservation system. Go to the Reservations section in the app to see availability and book a table for 4 or 6 persons.' },
  { q: 'How do I create an account?', a: 'Tap "Sign in" and sign in with Google. Your email is saved so we can link your orders to your account.' },
  { q: 'Is my data secure?', a: 'We use secure sign-in (Google) and do not store your password. Order and contact details are stored securely.' },
  { q: 'Do you have deals or combos?', a: 'Yes. Check the "Deals" section on the menu. We have combo deals, student deals, and family deals.' },
  { q: 'How can I get support?', a: 'Use the Support / FAQ link in the app, call the store number on the order page, or use our social links (Facebook, Instagram) in the footer.' },
  { q: 'What sizes do pizzas come in?', a: 'Pizzas are available in S (7"), M (10"), and L (14") depending on the type. Size options and prices are shown on each pizza item.' },
];

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="max-w-md mx-auto p-6 pb-8">
      <div className="flex items-center gap-2 mb-6">
        <HelpCircle className="w-8 h-8 text-primary" />
        <h1 className="text-2xl font-bold text-dark dark:text-white">FAQ</h1>
      </div>
      <p className="text-gray-600 dark:text-gray-400 mb-6">
        Frequently asked questions about ordering, delivery, and Haq Bahu Foods.
      </p>
      <div className="space-y-2">
        {FAQ_ITEMS.map((item, i) => (
          <div
            key={i}
            className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden"
          >
            <button
              type="button"
              onClick={() => setOpenIndex(openIndex === i ? null : i)}
              className="w-full flex items-center justify-between gap-2 p-4 text-left bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/50"
            >
              <span className="font-medium text-dark dark:text-white">{item.q}</span>
              <ChevronDown
                className={`w-5 h-5 flex-shrink-0 text-gray-500 transition-transform ${
                  openIndex === i ? 'rotate-180' : ''
                }`}
              />
            </button>
            {openIndex === i && (
              <div className="px-4 pb-4 pt-0 text-sm text-gray-600 dark:text-gray-400 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                {item.a}
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="mt-8 text-center">
        <Link
          href="/menu"
          className="inline-block py-2 px-4 rounded-xl bg-primary text-white font-medium hover:bg-red-700"
        >
          Back to Menu
        </Link>
      </div>
    </div>
  );
}
