import { Box, Center, Flex, Text } from "@mantine/core";
import { ILabelItem } from "../../data/labels";

interface RepositoryListInterface {
  data: Array<ILabelItem>;
}

export const RepositoryList: React.FC<RepositoryListInterface> = ({ data }) => {
  if (data.length === 0) {
    return (
      <Center h={400}>
        <Text>Click on a label to see the related repositories</Text>
      </Center>
    );
  }
  return (
    <Flex direction={"column"} gap={15}>
      {data.map((item) => {
        return (
          <Box
            bg="rgba(0,0,0,0.1)"
            p={"md"}
            style={{
              cursor: "pointer",
            }}
            onClick={() => {
              window.open(item.url, "_blank");
            }}
          >
            <Text
              style={{
                fontWeight: "bold",
              }}
            >
              {item.name}
            </Text>
            <Text>{item.description}</Text>
          </Box>
        );
      })}
    </Flex>
  );
};
