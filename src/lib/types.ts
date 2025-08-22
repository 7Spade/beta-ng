

export type TaskStatus = '待處理' | '進行中' | '已完成';

export interface Task {
  id: string;
  title: string;
  status: TaskStatus;
  lastUpdated: string;
  subTasks: Task[];
  value: number; // This will now be calculated as quantity * unitPrice
  quantity: number;
  unitPrice: number;
}

export interface Project {
  id: string;
  customId?: string;
  title: string;
  description: string;
  client?: string;
  clientRepresentative?: string;
  startDate: Date;
  endDate: Date;
  tasks: Task[];
  value: number;
}

export interface Contact {
  id: string;
  name: string;
  role: string;
  email: string;
  phone: string;
}

export interface Transaction {
  id: string;
  date: string;
  amount: number;
  status: '已完成' | '待處理' | '失敗';
  description: string;
}

export interface ComplianceDocument {
  id: string;
  name: string;
  status: '有效' | '即將到期' | '已過期';
  expiryDate: string;
  fileUrl: string;
}

export interface PerformanceReview {
    id: string;
    date: string;
    rating: number; // 1-5
    notes: string;
    reviewer: string;
}

export interface ContractDocument {
    id: string;
    title: string;
    startDate: string;
    endDate: string;
    status: '啟用中' | '已過期' | '已終止';
    fileUrl: string;
}

export type PartnerFlowType = '未配置' | '純收款' | '純付款' | '收付款';

export interface Partner {
  id?: string;
  name: string;
  logoUrl: string;
  category: '技術' | '經銷商' | '服務' | '顧問' | '下游承包商' | '供應商' | '設備';
  status: '啟用中' | '停用中' | '待審核';
  overview: string;
  website: string;
  contacts: Contact[];
  transactions: Transaction[];
  joinDate: string;
  performanceReviews: PerformanceReview[];
  complianceDocuments: ComplianceDocument[];
  contracts: ContractDocument[];
  flowType: PartnerFlowType;
  receivableWorkflow: string[];
  payableWorkflow: string[];
}

export type ReceivablePayableType = 'receivable' | 'payable';

export interface FinancialDocument {
    id: string;
    partnerId: string;
    partnerName: string;
    contractId?: string;
    contractName?: string;
    type: ReceivablePayableType;
    amount: number;
    description: string;
    currentStep: string;
    createDate: Date;
    dueDate: Date;
    history: Array<{
        step: string;
        date: Date;
        user: string;
    }>;
}

export type WorkflowNode = {
  id: string;
  type: 'start' | 'end' | 'task' | 'decision';
  label: string;
  position: { x: number; y: number };
};

export type WorkflowEdge = {
  id: string;
  source: string;
  target: string;
  label?: string;
};

export type Workflow = {
  id?: string;
  name: string;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  partnerId?: string;
};

export type ContractStatus = "啟用中" | "已完成" | "暫停中" | "已終止";

export interface Payment {
  id: string;
  amount: number;
  status: "已付款" | "待處理" | "已逾期";
  requestDate: Date;
  paidDate?: Date;
}

export interface ChangeOrder {
  id: string;
  title: string;
  description: string;
  status: "已核准" | "待處理" | "已拒絕";
  date: Date;
  impact: {
    cost: number;
    scheduleDays: number;
  };
}

export interface ContractVersion {
  version: number;
  date: Date;
  changeSummary: string;
}

export interface Contract {
  id: string;
  customId?: string;
  name: string;
  contractor: string;
  client: string;
  clientRepresentative?: string;
  startDate: Date;
  endDate: Date;
  totalValue: number;
  status: ContractStatus;
  scope: string;
  payments: Payment[];
  changeOrders: ChangeOrder[];
  versions: ContractVersion[];
}
