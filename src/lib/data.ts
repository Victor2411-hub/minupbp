export type Delegate = {
    id: string;
    name: string;
    country: string;
    avatar?: string;
};

export type Criteria = {
    id: string;
    name: string;
    maxScore: number;
};

export type EvaluationSheet = {
    id: string;
    name: string;
    criteria: Criteria[];
};

export const MOCK_DELEGATES: Delegate[] = [
    { id: "1", name: "Alice Johnson", country: "United States" },
    { id: "2", name: "Bob Smith", country: "United Kingdom" },
    { id: "3", name: "Carlos Ruiz", country: "Mexico" },
    { id: "4", name: "Diana Prince", country: "France" },
    { id: "5", name: "Evan Wright", country: "Germany" },
];

export const MOCK_CRITERIA: Criteria[] = [
    { id: "1", name: "Public Speaking", maxScore: 10 },
    { id: "2", name: "Diplomacy", maxScore: 10 },
    { id: "3", name: "Position Paper", maxScore: 5 },
];
