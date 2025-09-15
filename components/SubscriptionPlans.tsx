'use client';

import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../redux/hooks/hooks';
import { 
  getSubscriptionPlanVariations, 
  createSubscriptionPlan, 
  createPlanVariation 
} from '../redux/features/auth/authSlice';
import { PlanVariation, CreatePlanRequest, CreatePlanVariationRequest } from '../redux/services/authService';
import { Plus, Calendar, DollarSign, Users, AlertCircle, X } from 'lucide-react';

interface SubscriptionPlansProps {
  businessId: string;
}

interface SubscriptionPlan {
  id: number;
  name: string;
  status: string;
  version: number;
  object_id: string;
  created_at: number;
  business_id: string;
  eligible_item_ids: string[] | null;
}

const SubscriptionPlans: React.FC<SubscriptionPlansProps> = ({ businessId }) => {
  const dispatch = useAppDispatch();
  const { 
    subscriptionPlanData, 
    subscriptionLoading, 
    subscriptionError,
    business
  } = useAppSelector((state) => state.auth);

  const [showCreatePlan, setShowCreatePlan] = useState(false);
  const [showCreateVariation, setShowCreateVariation] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState<string>('');
  const [isCreatingPlan, setIsCreatingPlan] = useState(false);
  const [isCreatingVariation, setIsCreatingVariation] = useState(false);
  
  // Create Plan Form
  const [planForm, setPlanForm] = useState({
    name: '',
  });

  // Create Variation Form
  const [variationForm, setVariationForm] = useState({
    name: '',
    cadence: 'DAILY',
    amount: 0,
    type: 'STATIC',
    credit: 0,
    credit_charge_amount: 0,
    description: '',
    tax_percentage: 0,
    gift_credit: 0,
    gift_credit_charge_amount: 0,
  });

  useEffect(() => {
    if (businessId) {
      dispatch(getSubscriptionPlanVariations(businessId));
    }
  }, [dispatch, businessId]);

  const handleCreatePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    const planData: CreatePlanRequest = {
      name: planForm.name,
      business_id: businessId,
    };

    setIsCreatingPlan(true);
    try {
      await dispatch(createSubscriptionPlan(planData)).unwrap();
      setPlanForm({ name: '' });
      setShowCreatePlan(false);
      // Refresh data immediately
      await dispatch(getSubscriptionPlanVariations(businessId)).unwrap();
    } catch (error) {
      console.error('Failed to create plan:', error);
    } finally {
      setIsCreatingPlan(false);
    }
  };

  const handleCreateVariation = async (e: React.FormEvent) => {
    e.preventDefault();
    const variationData: CreatePlanVariationRequest = {
      name: variationForm.name,
      cadence: variationForm.cadence,
      amount: variationForm.amount,
      type: variationForm.type,
      credit: variationForm.credit,
      credit_charge_amount: variationForm.credit_charge_amount,
      description: variationForm.description,
      tax_percentage: variationForm.tax_percentage,
      gift_credit: variationForm.gift_credit,
      gift_credit_charge_amount: variationForm.gift_credit_charge_amount,
      plan_id: selectedPlanId,
      business_id: businessId,
    };

    setIsCreatingVariation(true);
    try {
      await dispatch(createPlanVariation(variationData)).unwrap();
      setVariationForm({
        name: '',
        cadence: 'DAILY',
        amount: 0,
        type: 'STATIC',
        credit: 0,
        credit_charge_amount: 0,
        description: '',
        tax_percentage: 0,
        gift_credit: 0,
        gift_credit_charge_amount: 0,
      });
      setSelectedPlanId('');
      setShowCreateVariation(false);
      // Refresh data immediately
      await dispatch(getSubscriptionPlanVariations(businessId)).unwrap();
    } catch (error) {
      console.error('Failed to create variation:', error);
    } finally {
      setIsCreatingVariation(false);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString();
  };

  const formatCurrency = (amount: number) => {
    return `$${(amount / 100).toFixed(2)}`;
  };

  if (subscriptionLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading subscription data...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Subscription Plans & Variations</h2>
          <p className="text-gray-600 mt-1">Manage your subscription plans and variations</p>
        </div>
        <div className="flex gap-2 mt-4 sm:mt-0">
          <button
            onClick={() => setShowCreatePlan(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors"
          >
            <Plus className="w-4 h-4" />
            Create Plan
          </button>
          <button
            onClick={() => setShowCreateVariation(true)}
            className="flex items-center gap-2 px-4 py-2 bg-success text-white rounded-lg hover:bg-success/90 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Create Variation
          </button>
        </div>
      </div>

      {/* Error Message */}
      {subscriptionError && (
        <div className="flex items-center gap-2 p-4 bg-error/10 border border-error/20 rounded-lg">
          <AlertCircle className="w-5 h-5 text-error" />
          <span className="text-error">{subscriptionError}</span>
        </div>
      )}


      {/* Subscription Plans */}
      {subscriptionPlanData && subscriptionPlanData.subscription_plans.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Subscription Plans</h3>
          <div className="space-y-4">
                  {subscriptionPlanData.subscription_plans.map((plan: SubscriptionPlan) => (
              <div key={plan.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-medium text-gray-900">{plan.name}</span>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        plan.status === 'active' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {plan.status}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>Plan ID: {plan.object_id}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        <span>Version: {plan.version}</span>
                      </div>
                      <div>
                        <span>Created: {formatDate(plan.created_at)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Plan Variations */}
      {subscriptionPlanData && subscriptionPlanData.plan_variations.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Plan Variations</h3>
          <div className="space-y-6">
            {subscriptionPlanData.subscription_plans.map((plan: SubscriptionPlan) => {
              const planVariations = subscriptionPlanData.plan_variations.filter(
                (variation: PlanVariation) => variation.plan_id === plan.object_id
              );
              
              if (planVariations.length === 0) return null;
              
              return (
                <div key={plan.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="mb-4">
                    <h4 className="text-md font-semibold text-gray-900 mb-1">{plan.name}</h4>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        plan.status === 'active' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {plan.status}
                      </span>
                      <span className="text-sm text-gray-500">Plan ID: {plan.object_id}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    {planVariations.map((variation: PlanVariation) => (
                      <div key={variation.id} className="bg-gray-50 rounded-lg p-3 border-l-4 border-primary">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="font-medium text-gray-900">{variation.name}</span>
                              <span className={`px-2 py-1 text-xs rounded-full ${
                                variation.status === 'active' 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-gray-100 text-gray-800'
                              }`}>
                                {variation.status}
                              </span>
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm text-gray-600">
                              <div className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                <span>{variation.cadence}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <DollarSign className="w-4 h-4" />
                                <span>{formatCurrency(variation.amount)}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Users className="w-4 h-4" />
                                <span>{variation.credit} credits</span>
                              </div>
                              <div>
                                <span>Type: {variation.type}</span>
                              </div>
                            </div>
                            {variation.description && (
                              <div className="mt-3 text-sm text-gray-600">
                                <div dangerouslySetInnerHTML={{ __html: variation.description }} />
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Empty State */}
      {subscriptionPlanData && subscriptionPlanData.subscription_plans.length === 0 && subscriptionPlanData.plan_variations.length === 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="text-center py-8">
            <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No subscription plans or variations found</p>
            <p className="text-sm text-gray-400 mt-1">Create a plan to get started</p>
          </div>
        </div>
      )}

      {/* Create Plan Modal */}
      {showCreatePlan && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md relative">
            <button
              onClick={() => setShowCreatePlan(false)}
              className="absolute top-4 right-4 p-1 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 pr-8">Create Subscription Plan</h3>
            <form onSubmit={handleCreatePlan} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Plan Name
                </label>
                <input
                  type="text"
                  value={planForm.name}
                  onChange={(e) => setPlanForm({ ...planForm, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-400"
                  placeholder="Enter plan name"
                  required
                />
              </div>
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isCreatingPlan}
                  className="w-full px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isCreatingPlan ? 'Creating...' : 'Create Plan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Variation Modal */}
      {showCreateVariation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto relative">
            <button
              onClick={() => setShowCreateVariation(false)}
              className="absolute top-4 right-4 p-1 hover:bg-gray-100 rounded-full transition-colors z-10"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 pr-8">Create Plan Variation</h3>
            <form onSubmit={handleCreateVariation} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select Plan
                </label>
                <select
                  value={selectedPlanId}
                  onChange={(e) => setSelectedPlanId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  required
                >
                  <option value="">Select a plan</option>
                  {subscriptionPlanData?.subscription_plans.map((plan) => (
                    <option key={plan.id} value={plan.object_id}>
                      {plan.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Variation Name
                </label>
                <input
                  type="text"
                  value={variationForm.name}
                  onChange={(e) => setVariationForm({ ...variationForm, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-400"
                  placeholder="Enter variation name"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cadence
                  </label>
                  <select
                    value={variationForm.cadence}
                    onChange={(e) => setVariationForm({ ...variationForm, cadence: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  >
                    <option value="DAILY">Daily</option>
                    <option value="WEEKLY">Weekly</option>
                    <option value="MONTHLY">Monthly</option>
                    <option value="YEARLY">Yearly</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Amount ({business?.currency || 'USD'})
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={variationForm.amount / 100}
                    onChange={(e) => setVariationForm({ ...variationForm, amount: Math.round(parseFloat(e.target.value || '0') * 100) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-400"
                    placeholder="3.00"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Credit
                  </label>
                  <input
                    type="number"
                    value={variationForm.credit}
                    onChange={(e) => setVariationForm({ ...variationForm, credit: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-400"
                    placeholder="3"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Credit Charge Amount
                  </label>
                  <input
                    type="number"
                    value={variationForm.credit_charge_amount}
                    onChange={(e) => setVariationForm({ ...variationForm, credit_charge_amount: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-400"
                    placeholder="1"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description (HTML)
                </label>
                <textarea
                  value={variationForm.description}
                  onChange={(e) => setVariationForm({ ...variationForm, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-400"
                  rows={3}
                  placeholder="<ul><li>Test Variation</li></ul>"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Gift Credit
                  </label>
                  <input
                    type="number"
                    value={variationForm.gift_credit}
                    onChange={(e) => setVariationForm({ ...variationForm, gift_credit: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-400"
                    placeholder="0"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Gift Credit Charge Amount
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={variationForm.gift_credit_charge_amount / 100}
                    onChange={(e) => setVariationForm({ ...variationForm, gift_credit_charge_amount: Math.round(parseFloat(e.target.value || '0') * 100) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-400"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tax Percentage
                </label>
                <input
                  type="number"
                  value={variationForm.tax_percentage}
                  onChange={(e) => setVariationForm({ ...variationForm, tax_percentage: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-400"
                  placeholder="0"
                />
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isCreatingVariation}
                  className="w-full px-4 py-2 bg-success text-white rounded-lg hover:bg-success/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isCreatingVariation ? 'Creating...' : 'Create Variation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubscriptionPlans;
