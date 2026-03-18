import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Check, Zap, Crown, CreditCard } from 'lucide-react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const PricingModal = ({ open, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [paymentProvider, setPaymentProvider] = useState('stripe');

  const handleSubscribe = async (plan) => {
    setLoading(true);
    try {
      const originUrl = window.location.origin;
      const response = await axios.post(`${API}/payments/checkout`, {
        plan,
        origin_url: originUrl,
        provider: paymentProvider,
      });

      if (response.data.url) {
        window.location.href = response.data.url;
      }
    } catch (error) {
      console.error('Payment error:', error);
      alert('Failed to initiate payment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const plans = [
    {
      id: 'free',
      name: 'Free',
      price: 0,
      period: 'forever',
      description: 'Basic device scanning',
      features: [
        'Single device scan',
        'Basic metadata collection',
        'View current fingerprint',
        'Export snapshot'
      ],
      limited: ['No historical tracking', 'No privacy scoring', 'No alerts'],
      cta: 'Current Plan',
      disabled: true,
      icon: null
    },
    {
      id: 'pro',
      name: 'Pro',
      price: 9,
      period: 'month',
      description: 'For privacy-conscious individuals',
      features: [
        'Unlimited scans',
        'Privacy score & recommendations',
        'Historical tracking (90 days)',
        'Fingerprint change alerts',
        'Side-by-side comparisons',
        'Priority support'
      ],
      limited: [],
      cta: 'Upgrade to Pro',
      disabled: false,
      icon: Zap,
      popular: true
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: 29,
      period: 'month',
      description: 'For teams and businesses',
      features: [
        'Everything in Pro',
        'Multi-device tracking',
        'Team dashboard',
        'Unlimited history',
        'API access',
        'Custom integrations',
        'Dedicated support'
      ],
      limited: [],
      cta: 'Go Enterprise',
      disabled: false,
      icon: Crown
    }
  ];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl bg-[#0A0A0A] border-zinc-800" data-testid="pricing-modal">
        <DialogHeader>
          <DialogTitle className="font-heading font-bold text-3xl tracking-tight uppercase text-center text-cyan-400">
            Upgrade Your Privacy Intelligence
          </DialogTitle>
          <DialogDescription className="text-center text-zinc-400 text-lg">
            Choose the plan that fits your privacy needs
          </DialogDescription>
        </DialogHeader>

        {/* Payment Provider Selector */}
        <div className="flex justify-center gap-4 mt-4">
          <Button
            variant={paymentProvider === 'stripe' ? 'default' : 'outline'}
            onClick={() => setPaymentProvider('stripe')}
            className={`font-heading uppercase tracking-wider ${
              paymentProvider === 'stripe'
                ? 'bg-cyan-600 text-white'
                : 'bg-zinc-800 text-zinc-400'
            }`}
            data-testid="payment-provider-stripe"
          >
            <CreditCard className="w-4 h-4 mr-2" />
            Stripe (Card)
          </Button>
          <Button
            variant={paymentProvider === 'paypal' ? 'default' : 'outline'}
            onClick={() => setPaymentProvider('paypal')}
            className={`font-heading uppercase tracking-wider ${
              paymentProvider === 'paypal'
                ? 'bg-blue-600 text-white'
                : 'bg-zinc-800 text-zinc-400'
            }`}
            data-testid="payment-provider-paypal"
          >
            PayPal
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          {plans.map((plan) => {
            const Icon = plan.icon;
            return (
              <div
                key={plan.id}
                className={`relative bg-zinc-900/50 border rounded-sm p-6 ${
                  plan.popular ? 'border-cyan-500' : 'border-zinc-800'
                }`}
                data-testid={`pricing-plan-${plan.id}`}
              >
                {plan.popular && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-cyan-600 text-white font-heading uppercase text-xs">
                    Most Popular
                  </Badge>
                )}
                
                <div className="text-center mb-6">
                  {Icon && <Icon className="w-8 h-8 mx-auto mb-3 text-cyan-400" />}
                  <h3 className="font-heading font-semibold text-xl text-white mb-2">{plan.name}</h3>
                  <div className="mb-2">
                    <span className="font-heading font-bold text-4xl text-cyan-400">${plan.price}</span>
                    {plan.price > 0 && <span className="text-zinc-500">/{plan.period}</span>}
                  </div>
                  <p className="text-sm text-zinc-400">{plan.description}</p>
                </div>

                <div className="space-y-3 mb-6">
                  {plan.features.map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-zinc-300">{feature}</span>
                    </div>
                  ))}
                  {plan.limited.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-2 opacity-50">
                      <span className="text-zinc-600 text-sm">✕ {item}</span>
                    </div>
                  ))}
                </div>

                <Button
                  onClick={() => handleSubscribe(plan.id)}
                  disabled={plan.disabled || loading}
                  className={`w-full font-heading uppercase tracking-wider ${
                    plan.popular
                      ? 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                      : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300'
                  }`}
                  data-testid={`subscribe-${plan.id}`}
                >
                  {loading ? 'Processing...' : plan.cta}
                </Button>
              </div>
            );
          })}
        </div>

        <div className="text-center mt-6 text-xs text-zinc-600">
          <p>All plans include end-to-end encryption and data privacy protection.</p>
          <p className="mt-1">Cancel anytime. No questions asked.</p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PricingModal;
