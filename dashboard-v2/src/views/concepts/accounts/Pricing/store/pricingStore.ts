import { create } from 'zustand'
import type { PaymentCycle, SelectedPlan } from '../types'

type PricingState = {
    paymentCycle: PaymentCycle
    paymentDialog: boolean
    selectedPlan: Partial<SelectedPlan>
}

type PricingAction = {
    setPaymentCycle: (payload: PaymentCycle) => void
    setPaymentDialog: (payload: boolean) => void
    setSelectedPlan: (payload: Partial<SelectedPlan>) => void
}

const initialState: PricingState = {
    paymentCycle: 'monthly',
    paymentDialog: false,
    selectedPlan: {},
}

export const usePricingStore = create<PricingState & PricingAction>((set) => ({
    ...initialState,
    setPaymentCycle: (payload) => set(() => ({ paymentCycle: payload })),
    setPaymentDialog: (payload) => set(() => ({ paymentDialog: payload })),
    setSelectedPlan: (payload) => set(() => ({ selectedPlan: payload })),
}))
