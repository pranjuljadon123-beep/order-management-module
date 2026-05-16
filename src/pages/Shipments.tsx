import { AppLayout } from "@/components/layout/AppLayout";
import { WorkflowStats } from "@/components/shipments/WorkflowStats";
import { WorkflowToolbar } from "@/components/shipments/WorkflowToolbar";
import { WorkflowKanban } from "@/components/shipments/WorkflowKanban";
import { WorkflowTable } from "@/components/shipments/WorkflowTable";
import { BottleneckBar } from "@/components/shipments/BottleneckBar";
import { useShipmentWorkflow } from "@/hooks/useShipmentWorkflow";
import { useAiContext } from "@/hooks/useAiContext";

const Shipments = () => {
  const {
    viewMode, setViewMode,
    searchQuery, setSearchQuery,
    stageFilter, setStageFilter,
    priorityFilter, setPriorityFilter,
    workflows,
    allWorkflows,
    stageGroups,
    stats,
    bottlenecks,
    advanceShipmentStage,
    reassignStageOwner,
    setShipmentPriority,
  } = useShipmentWorkflow();

  useAiContext("workflow", { shipments: allWorkflows ?? workflows, stats, bottlenecks }, {
    advance: (id: string) => advanceShipmentStage(id),
    reassign: (id: string, owner: string) => reassignStageOwner(id, owner),
    setPriority: (id: string, priority: string) => setShipmentPriority(id, priority as any),
    setStageFilter: (s: string) => setStageFilter(s as any),
    setPriorityFilter: (p: string) => setPriorityFilter(p),
    setSearch: (q: string) => setSearchQuery(q),
    setView: (v: string) => setViewMode(v as any),
  });

  return (
    <AppLayout>
      <div className="space-y-5">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Shipment Workflow
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Track shipments through each process stage — identify bottlenecks and SLA breaches by owner
          </p>
        </div>

        {/* KPI Stats */}
        <WorkflowStats stats={stats} />

        {/* Bottleneck Analysis */}
        <BottleneckBar bottlenecks={bottlenecks} total={stats.total} />

        {/* Toolbar */}
        <WorkflowToolbar
          viewMode={viewMode}
          setViewMode={setViewMode}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          stageFilter={stageFilter}
          setStageFilter={setStageFilter}
          priorityFilter={priorityFilter}
          setPriorityFilter={setPriorityFilter}
        />

        {/* View */}
        {viewMode === "kanban" ? (
          <WorkflowKanban stageGroups={stageGroups} bottlenecks={bottlenecks} />
        ) : (
          <WorkflowTable workflows={workflows} />
        )}
      </div>
    </AppLayout>
  );
};

export default Shipments;
