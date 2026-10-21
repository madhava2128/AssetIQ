'use client';

import React, { useState, useEffect } from 'react';

interface DecisionExplanationPanelProps {
    isOpen?: boolean;
    onToggle?: () => void;
}

export default function DecisionExplanationPanel({
    isOpen: controlledIsOpen,
    onToggle
}: DecisionExplanationPanelProps) {
    const [localIsOpen, setLocalIsOpen] = useState(false);
    const [modelStatus, setModelStatus] = useState<{
        isActive: boolean;
        label: string;
        description: string;
    }>({
        isActive: true,
        label: 'Active',
        description: 'Trained on historical maintenance and breakdown records'
    });

    const isExpanded = controlledIsOpen !== undefined ? controlledIsOpen : localIsOpen;

    const handleToggle = () => {
        if (onToggle) {
            onToggle();
        } else {
            setLocalIsOpen(!localIsOpen);
        }
    };

    useEffect(() => {
        const fetchModelStatus = async () => {
            try {
                const res = await fetch('/api/readiness/model-status');
                const data = await res.json();
                if (data.success) {
                    setModelStatus({
                        isActive: data.is_active,
                        label: data.status_label || (data.is_active ? 'Active' : 'Learning: needs more history before it can predict'),
                        description: data.description || ''
                    });
                }
            } catch {
                // Keep default active state if fetch fails
            }
        };
        fetchModelStatus();
    }, []);

    return (
        <section id="how-assetiq-decides" className="bg-panel border border-border rounded p-5 space-y-4 transition-all">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                    <div className="flex items-center gap-2.5">
                        <h2 className="text-section-heading text-text-primary">
                            How AssetIQ decides
                        </h2>
                        <span className="text-xs px-2 py-0.5 rounded font-medium bg-subtle text-text-secondary border border-border">
                            Project explanation
                        </span>
                    </div>
                    <p className="text-body text-text-secondary mt-0.5">
                        A three-step verification process that checks safety facts, predicts potential risk, and provides clear action steps.
                    </p>
                </div>
                <button
                    onClick={handleToggle}
                    className="border border-border-strong bg-panel hover:bg-subtle text-text-primary px-3.5 py-1.5 rounded text-table font-medium transition-colors self-start sm:self-auto cursor-pointer"
                    aria-expanded={isExpanded}
                >
                    {isExpanded ? 'Hide explanation' : 'How does this work?'}
                </button>
            </div>

            {isExpanded && (
                <div className="pt-4 border-t border-border space-y-6">
                    {/* Three-Step Plain Diagram */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Step 1: Safety rules */}
                        <div className="bg-subtle border border-border rounded p-4 flex flex-col justify-between">
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-caption font-semibold text-accent">
                                        Step 1
                                    </span>
                                    <span className="text-xs px-2 py-0.5 rounded font-medium bg-panel text-text-primary border border-border">
                                        Hard rules
                                    </span>
                                </div>
                                <h3 className="text-body font-semibold text-text-primary mb-2">
                                    Safety rules check first
                                </h3>
                                <p className="text-caption text-text-secondary leading-relaxed">
                                    AssetIQ checks hard facts: is the equipment available, is maintenance overdue, has it broken down recently, is the service contract valid, and are there enough units. These rules always take priority.
                                </p>
                            </div>
                            <div className="mt-4 pt-3 border-t border-border text-xs text-text-muted">
                                If any safety rule fails, the surgery cannot be marked Ready.
                            </div>
                        </div>

                        {/* Step 2: Risk prediction */}
                        <div className="bg-subtle border border-border rounded p-4 flex flex-col justify-between">
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-caption font-semibold text-accent">
                                        Step 2
                                    </span>
                                    <span className={`text-xs px-2 py-0.5 rounded font-medium border ${
                                        modelStatus.isActive
                                            ? 'bg-status-ready-bg text-status-ready-text border-status-ready-solid'
                                            : 'bg-status-atrisk-bg text-status-atrisk-text border-status-atrisk-solid'
                                    }`}>
                                        {modelStatus.label}
                                    </span>
                                </div>
                                <h3 className="text-body font-semibold text-text-primary mb-2">
                                    Risk prediction adds a second opinion
                                </h3>
                                <p className="text-caption text-text-secondary leading-relaxed">
                                    A prediction model looks at past maintenance and breakdowns to flag equipment that may fail soon. It can raise a warning, but it can never override a safety rule.
                                </p>
                            </div>
                            <div className="mt-4 pt-3 border-t border-border text-xs text-text-muted">
                                Live status: {modelStatus.label}.
                            </div>
                        </div>

                        {/* Step 3: Plain explanation */}
                        <div className="bg-subtle border border-border rounded p-4 flex flex-col justify-between">
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-caption font-semibold text-accent">
                                        Step 3
                                    </span>
                                    <span className="text-xs px-2 py-0.5 rounded font-medium bg-panel text-text-primary border border-border">
                                        Plain language
                                    </span>
                                </div>
                                <h3 className="text-body font-semibold text-text-primary mb-2">
                                    Plain explanation
                                </h3>
                                <p className="text-caption text-text-secondary leading-relaxed">
                                    An AI writer turns the result into a short explanation and recommended action. It explains the result; it does not make the decision.
                                </p>
                            </div>
                            <div className="mt-4 pt-3 border-t border-border text-xs text-text-muted">
                                Translates status codes into clear actions for clinical and engineering teams.
                            </div>
                        </div>
                    </div>

                    {/* Status Legend */}
                    <div className="bg-subtle border border-border rounded p-4 space-y-3">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-border pb-2">
                            <span className="text-caption font-semibold text-text-primary">
                                What each status means
                            </span>
                            <span className="text-caption text-text-muted">
                                Readiness is verified automatically 24 hours before each surgery
                            </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-caption">
                            <div className="bg-panel p-3 rounded border border-border">
                                <div className="flex items-center gap-2 mb-1.5">
                                    <span className="inline-block w-2.5 h-2.5 rounded-full bg-status-ready-solid"></span>
                                    <span className="font-semibold text-status-ready-text">Ready</span>
                                </div>
                                <p className="text-text-secondary text-xs leading-normal">
                                    All safety rules passed and required equipment is verified operational.
                                </p>
                            </div>

                            <div className="bg-panel p-3 rounded border border-border">
                                <div className="flex items-center gap-2 mb-1.5">
                                    <span className="inline-block w-2.5 h-2.5 rounded-full bg-status-atrisk-solid"></span>
                                    <span className="font-semibold text-status-atrisk-text">At Risk</span>
                                </div>
                                <p className="text-text-secondary text-xs leading-normal">
                                    Non-critical issue detected (such as expiring contract or upcoming maintenance); surgery can proceed with caution or backup.
                                </p>
                            </div>

                            <div className="bg-panel p-3 rounded border border-border">
                                <div className="flex items-center gap-2 mb-1.5">
                                    <span className="inline-block w-2.5 h-2.5 rounded-full bg-status-notready-solid"></span>
                                    <span className="font-semibold text-status-notready-text">Not Ready</span>
                                </div>
                                <p className="text-text-secondary text-xs leading-normal">
                                    Hard safety rule violated (equipment missing, broken down, or under repair); surgery cannot proceed without resolution.
                                </p>
                            </div>

                            <div className="bg-panel p-3 rounded border border-border">
                                <div className="flex items-center gap-2 mb-1.5">
                                    <span className="inline-block w-2.5 h-2.5 rounded-full bg-border-strong"></span>
                                    <span className="font-semibold text-text-secondary">Not yet checked</span>
                                </div>
                                <p className="text-text-secondary text-xs leading-normal">
                                    Procedure is scheduled in advance; readiness verification runs automatically 24 hours before surgery.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
}
