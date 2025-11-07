import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth-context";
import { KpiCard } from "@/components/KpiCard";
import { PersonaSwitch } from "@/components/PersonaSwitch";
import { Card } from "@/components/ui/card";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatKwh, formatCO2, formatCII, formatDelta } from "@/lib/formatters";
import { DollarSign, Zap, Leaf, Heart, Map, TrendingUp } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import type { MetricsData } from "@shared/schema";

export default function Dashboard() {
  const { session } = useAuth();

  const { data: metrics, isLoading } = useQuery<MetricsData>({
    queryKey: [`/api/metrics?persona=${session?.role}`],
    enabled: !!session,
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2" data-testid="text-dashboard-title">
            Dashboard
          </h1>
          <p className="text-muted-foreground">
            {session?.companyName} • {session?.role === "operator" ? "Data Center Operator" : "Cloud Company"}
          </p>
        </div>
        <PersonaSwitch />
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <KpiCard
          label="Cost"
          value={metrics ? formatCurrency(metrics.kpis.cost_usd.value) : "$0"}
          delta={metrics?.kpis.cost_usd.delta ? {
            value: formatDelta(metrics.kpis.cost_usd.delta, true).text,
            isPositive: formatDelta(metrics.kpis.cost_usd.delta, true).isPositive,
            label: metrics.kpis.cost_usd.deltaLabel,
          } : undefined}
          icon={<DollarSign className="h-8 w-8" />}
          loading={isLoading}
        />
        <KpiCard
          label="Energy Usage"
          value={metrics ? formatKwh(metrics.kpis.kwh.value) : "0 kWh"}
          delta={metrics?.kpis.kwh.delta ? {
            value: formatDelta(metrics.kpis.kwh.delta, true).text,
            isPositive: formatDelta(metrics.kpis.kwh.delta, true).isPositive,
            label: metrics.kpis.kwh.deltaLabel,
          } : undefined}
          icon={<Zap className="h-8 w-8" />}
          loading={isLoading}
        />
        <KpiCard
          label="CO₂ Emissions"
          value={metrics ? formatCO2(metrics.kpis.co2_kg.value) : "0 kg"}
          delta={metrics?.kpis.co2_kg.delta ? {
            value: formatDelta(metrics.kpis.co2_kg.delta, true).text,
            isPositive: formatDelta(metrics.kpis.co2_kg.delta, true).isPositive,
            label: metrics.kpis.co2_kg.deltaLabel,
          } : undefined}
          icon={<Leaf className="h-8 w-8" />}
          loading={isLoading}
        />
        <KpiCard
          label="Community Impact"
          value={metrics ? formatCII(metrics.kpis.cii.value) : "0"}
          delta={metrics?.kpis.cii.delta ? {
            value: formatDelta(metrics.kpis.cii.delta).text,
            isPositive: formatDelta(metrics.kpis.cii.delta).isPositive,
            label: metrics.kpis.cii.deltaLabel,
          } : undefined}
          icon={<Heart className="h-8 w-8" />}
          loading={isLoading}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Cost Over Time
          </h2>
          {isLoading ? (
            <div className="h-64 bg-muted animate-pulse rounded" />
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={metrics?.timeseries.cost || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="timestamp"
                  stroke="hsl(var(--muted-foreground))"
                  tick={{ fill: "hsl(var(--muted-foreground))" }}
                />
                <YAxis stroke="hsl(var(--muted-foreground))" tick={{ fill: "hsl(var(--muted-foreground))" }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--popover))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "var(--radius)",
                  }}
                />
                <Legend />
                <Line type="monotone" dataKey="baseline" stroke="hsl(var(--chart-4))" strokeWidth={2} name="Baseline" />
                <Line type="monotone" dataKey="optimized" stroke="hsl(var(--chart-1))" strokeWidth={2} name="Optimized" />
              </LineChart>
            </ResponsiveContainer>
          )}
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Leaf className="h-5 w-5 text-primary" />
            Carbon Intensity
          </h2>
          {isLoading ? (
            <div className="h-64 bg-muted animate-pulse rounded" />
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={metrics?.timeseries.carbon || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="timestamp"
                  stroke="hsl(var(--muted-foreground))"
                  tick={{ fill: "hsl(var(--muted-foreground))" }}
                />
                <YAxis stroke="hsl(var(--muted-foreground))" tick={{ fill: "hsl(var(--muted-foreground))" }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--popover))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "var(--radius)",
                  }}
                />
                <Legend />
                <Line type="monotone" dataKey="baseline" stroke="hsl(var(--chart-4))" strokeWidth={2} name="Baseline" />
                <Line type="monotone" dataKey="optimized" stroke="hsl(var(--chart-1))" strokeWidth={2} name="Optimized" />
              </LineChart>
            </ResponsiveContainer>
          )}
        </Card>
      </div>

      {/* Map Preview */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Map className="h-5 w-5 text-primary" />
            Energy Zone Map
          </h2>
          <Link href="/energy-zone">
            <Button variant="outline" size="sm" data-testid="button-view-full-map">
              View Full Map
            </Button>
          </Link>
        </div>
        <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
          <div className="text-center">
            <Map className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              Interactive map showing ZIP-level energy metrics
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
