export interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  category: string; // 'Primary' | 'Accessory' | 'Emergency' | 'Other'
  color: string; // hex or tailwind classes
  dueDate: string;
  imageUrl?: string;
  streak: number;
  lastDepositDate?: string;
}

export interface Transaction {
  id: string;
  goalId?: string; // associated goal if it's savings
  title: string;
  amount: number;
  type: 'income' | 'expense' | 'savings';
  date: string;
  category: string;
}

export interface Budget {
  monthlyLimit: number;
  categories: {
    name: string;
    allocated: number;
    spent: number;
    color: string;
    icon: string;
  }[];
}
