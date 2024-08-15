import React, { useCallback, useEffect, useMemo } from "react";
import logo from "./logo.svg";
import "./App.css";
import { LabelData } from "./data/labels";
import { ActivityData } from "./data/activity";
import { Box, Fieldset, Flex, SimpleGrid, Title } from "@mantine/core";
import LabelBarGraph from "./components/graph/labelBarGraph";
import ChartResizer from "./components/graph/ChartResizer";
import "@mantine/core/styles.css";
import TimeGraph from "./components/graph/TimeGraph";

function App() {
  const groupedLabelCount = useMemo(() => {
    // we will make the x and y values
    const labelCountMap = new Map<string, number>();
    LabelData.forEach((item) => {
      for (let i = 0; i < item.labels.length; i++) {
        const label = item.labels[i];
        if (labelCountMap.has(label)) {
          labelCountMap.set(label, labelCountMap.get(label)! + 1);
        } else {
          labelCountMap.set(label, 1);
        }
      }
    });

    return Array.from(labelCountMap.entries()).sort((a, b) => b[1] - a[1]);
  }, []);

  const getLabelsOfFullName = useCallback((name: string) => {
    return LabelData.find((item) => item.full_name === name)?.labels;
  }, []);

  const groupedActivityData = useMemo(() => {
    const labels = Array.from(groupedLabelCount.map((item) => item[0]));
    const aggregatedData: Array<{
      date: string;
      [key: string]: number | string;
    }> = [];
    ActivityData.forEach((item) => {
      const date = item.date;
      const monthlyLabels = new Map<string, number>();
      Object.entries(item).forEach(([key, value]) => {
        if (key === "date") {
          return;
        }
        const labelsOfRepo = getLabelsOfFullName(key);
        if (!labelsOfRepo) {
          return;
        }
        labelsOfRepo.forEach((label) => {
          if (labels.includes(label)) {
            if (monthlyLabels.has(label)) {
              monthlyLabels.set(
                label,
                monthlyLabels.get(label)! + parseInt(value as string)
              );
            } else {
              monthlyLabels.set(label, parseInt(value as string));
            }
          }
        });
      });
      aggregatedData.push({
        date,
        ...Object.fromEntries(monthlyLabels),
      });
    });
    return aggregatedData;
  }, [groupedLabelCount, getLabelsOfFullName]);

  return (
    <div className="App">
      <Flex direction={"column"} py={"lg"} gap={20}>
        <Title order={3}>Hun Kim Coding Projects</Title>
        <SimpleGrid cols={2}>
          {/* <ChartResizer width={"100%"}> */}
          <Flex direction={"column"}>
            <Box flex={1}>
              <ChartResizer width={"100%"} height={200}>
                <LabelBarGraph
                  data={groupedLabelCount}
                  width={800}
                  height={400}
                  margin={{
                    top: 20,
                    right: 20,
                    bottom: 40,
                    left: 20,
                  }}
                />
              </ChartResizer>
            </Box>
          </Flex>
          <Fieldset>
            <Flex></Flex>
          </Fieldset>
        </SimpleGrid>
        <Flex direction={"column"}>
          <Title order={5} opacity={0.5}>
            How my coding interests have shaped throughout the year
          </Title>
          <Fieldset>
            <ChartResizer width={"100%"} height={200}>
              <TimeGraph
                data={groupedActivityData}
                width={800}
                height={400}
                margin={{
                  top: 20,
                  right: 20,
                  bottom: 40,
                  left: 20,
                }}
                columns={
                  Object.keys(groupedActivityData[0]).filter(
                    (item) => item !== "date"
                  ) as string[]
                }
                maxYValue={Math.max(
                  ...groupedActivityData.map((item) => {
                    let total = 0;
                    Object.values(item).forEach((key) => {
                      if (key.toString().includes("-")) {
                        return;
                      }
                      const isNumber = parseInt(key as string);
                      if (isNumber) {
                        total += parseInt(key as string);
                        return true;
                      } else {
                        return false;
                      }
                    });
                    return total;
                  })
                )}
              />
            </ChartResizer>
          </Fieldset>
        </Flex>
      </Flex>
    </div>
  );
}

export default App;
