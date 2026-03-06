import { AppLayout } from "@/components/layout/AppLayout";
import { WorkflowStats } from "@/components/shipments/WorkflowStats";
import { WorkflowToolbar } from "@/components/shipments/WorkflowToolbar";
import { WorkflowKanban } from "@/components/shipments/WorkflowKanban";
import { WorkflowTable } from "@/components/shipments/WorkflowTable";
import { BottleneckBar } from "@/components/shipments/BottleneckBar";
import { useShipmentWorkflow } from "@/hooks/useShipmentWorkflow";

const Shipments = () => {
  const {
    viewMode, setViewMode,
    searchQuery, setSearchQuery,
    stageFilter, setStageFilter,
    priorityFilter, setPriorityFilter,
    workflows,
    stageGroups,
    stats,
    bottlenecks,
  } = useShipmentWorkflow();

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
