"use client";

import * as React from "react";
import { Tooltip, Legend, ResponsiveContainer } from "recharts";

type ChartConfig = {
  [k in string]: {
    label?: string;
    icon?: React.ComponentType<{ className?: string }>;
    color?: string;
    theme?: {
      light?: string;
      dark?: string;
    };
  };
};

type ChartContextProps = {
  config: ChartConfig;
};

const ChartContext = React.createContext<ChartContextProps | null>(null);

function useChart() {
  const context = React.useContext(ChartContext);

  if (!context) {
    throw new Error("useChart must be used within a <ChartContainer />");
  }

  return context;
}

const ChartContainer = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    children: React.ReactNode;
    config: ChartConfig;
  }
>(({ id, className, children, config, ...props }, ref) => {
  const uniqueId = React.useId();
  const chartId = `chart-${id || uniqueId.replace(/:/g, "")}`;

  return (
    <ChartContext.Provider value={{ config }}>
      <div ref={ref} data-chart={chartId} className={className} {...props}>
        <ChartStyle id={chartId} config={config} />
        <ResponsiveContainer width="100%" height="100%">
          {(() => {
            const child = React.Children.only(children);
            if (React.isValidElement(child)) {
              return React.cloneElement(child, {
                id: chartId,
              } as React.Attributes & Record<string, unknown>);
            }
            return child;
          })()}
        </ResponsiveContainer>
      </div>
    </ChartContext.Provider>
  );
});
ChartContainer.displayName = "Chart";

const ChartStyle = ({ id, config }: { id: string; config: ChartConfig }) => {
  const colorConfig = Object.entries(config).filter(
    ([, configItem]) => configItem.color || configItem.theme,
  );

  if (!colorConfig.length) {
    return null;
  }

  return (
    <style
      dangerouslySetInnerHTML={{
        __html: colorConfig
          .map(([key, configItem]) => {
            const lightColor = configItem.theme?.light || configItem.color;
            const darkColor = configItem.theme?.dark || configItem.color;
            return [
              `[data-chart="${id}"] { --color-${key}: ${lightColor}; }`,
              `.dark [data-chart="${id}"] { --color-${key}: ${darkColor}; }`,
            ].join("\n");
          })
          .join("\n"),
      }}
    />
  );
};

type ChartTooltipContentProps = {
  active?: boolean;
  payload?: Array<{
    name?: string;
    dataKey?: string;
    value?: number | string;
    color?: string;
    fill?: string;
  }>;
  label?: string;
  hideLabel?: boolean;
  hideIndicator?: boolean;
  indicator?: "dot" | "line" | "dashed";
  nameKey?: string;
  labelKey?: string;
};

function ChartTooltipContent({
  active,
  payload,
  label,
  hideLabel,
  hideIndicator,
  indicator = "dot",
  nameKey,
  labelKey,
}: ChartTooltipContentProps) {
  const { config } = useChart();

  if (!active || !payload?.length) return null;

  const tooltipLabel = labelKey ? config[labelKey]?.label || label : label;

  return (
    <div className="rounded-lg border bg-background px-3 py-2 shadow-md">
      {!hideLabel && tooltipLabel && (
        <p className="text-xs font-medium text-muted-foreground mb-1">
          {tooltipLabel}
        </p>
      )}
      <div className="flex flex-col gap-0.5">
        {payload.map((entry, index) => {
          const key = (entry.dataKey as string) || (entry.name as string) || "";
          const itemConfig = config[key];
          const entryLabel = nameKey
            ? config[nameKey]?.label
            : itemConfig?.label || entry.name || entry.dataKey;
          const entryColor = entry.color || entry.fill || itemConfig?.color;

          return (
            <div key={index} className="flex items-center gap-2 text-xs">
              {!hideIndicator && (
                <div
                  className={
                    indicator === "line"
                      ? "h-3 w-0.5 rounded-full"
                      : indicator === "dashed"
                        ? "h-3 w-3 border-l-2 border-dashed border-current"
                        : "h-2 w-2 rounded-full"
                  }
                  style={{ backgroundColor: entryColor }}
                />
              )}
              <span className="font-medium text-foreground">{entryLabel}:</span>
              <span className="text-muted-foreground">
                {typeof entry.value === "number"
                  ? entry.value.toLocaleString()
                  : entry.value}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const ChartTooltip = Tooltip;

type ChartLegendContentProps = {
  payload?: Array<{
    value?: string;
    color?: string;
    dataKey?: string;
  }>;
  nameKey?: string;
};

function ChartLegendContent({ payload, nameKey }: ChartLegendContentProps) {
  const { config } = useChart();

  if (!payload?.length) return null;

  return (
    <div className="flex flex-wrap items-center justify-center gap-4">
      {payload.map((entry, index) => {
        const key = (entry.dataKey as string) || "";
        const itemConfig = config[key];
        const entryLabel = nameKey
          ? config[nameKey]?.label
          : itemConfig?.label || entry.value;

        return (
          <div key={index} className="flex items-center gap-1.5 text-xs">
            <div
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-muted-foreground">{entryLabel}</span>
          </div>
        );
      })}
    </div>
  );
}

const ChartLegend = Legend;

export {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  ChartStyle,
  useChart,
  type ChartConfig,
};
